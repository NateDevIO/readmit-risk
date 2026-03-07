"""FastAPI chat proxy — bridges frontend widgets to Anthropic API with MCP tool support.

Deploy as a separate Railway service with ANTHROPIC_API_KEY set in environment.
"""

import json
import logging
import os

import anthropic
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mcp.client.session import ClientSession
from mcp.client.sse import sse_client
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from sse_starlette.sse import EventSourceResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL = os.getenv("CHAT_MODEL", "claude-sonnet-4-20250514")
MAX_TURNS = 10
MAX_TOKENS = 4096

MCP_SERVERS: dict[str, str] = {
    "readmitrisk": os.getenv(
        "MCP_READMITRISK_URL",
        "https://readmit-risk-production.up.railway.app/sse",
    ),
}

SYSTEM_PROMPT = """\
You are ReadmitRisk Assistant, an AI-powered clinical analytics helper for \
hospital readmission risk analysis. You have access to tools that query two \
patient datasets:

- UCI Diabetes Dataset: 71,518 diabetes patients with readmission outcomes
- MIMIC-IV Dataset: 211,073 hospital admissions with ICU data

Use the available tools to answer questions about patient risk scores, hospital \
performance metrics, feature importance, risk distributions, and dataset \
comparisons. You can also run live risk predictions for hypothetical patient \
scenarios.

Important context:
- Risk scores are relative rankings (0-100), not readmission probabilities.
- UCI model AUC is 0.56, MIMIC is 0.63 — useful for ranking, not calibrated \
  clinical predictions.
- This is a portfolio analytics demo, not a clinical decision-support tool.

Be concise and accurate. Cite which dataset you query. Include tier \
classifications (Low/Moderate/High/Very High/Critical) with risk scores.\
"""

ALLOWED_ORIGINS = [
    "https://readmit-risk.vercel.app",
    "http://localhost:3000",
    "https://natedev.io",
]

# --- App setup ---

def _get_client_ip(request: Request) -> str:
    """Extract real client IP behind Railway's reverse proxy."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


limiter = Limiter(key_func=_get_client_ip)
app = FastAPI(title="ReadmitRisk Chat API")
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RateLimitExceeded)
async def _rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"error": "Rate limit exceeded. Try again in a minute."},
    )


# --- Routes ---


@app.get("/health")
async def health():
    return {"status": "ok", "model": MODEL}


@app.post("/api/chat")
@limiter.limit("20/minute")
async def chat(request: Request):
    body = await request.json()
    messages = body.get("messages", [])
    project = body.get("project", "readmitrisk")

    if not messages:
        return JSONResponse(status_code=400, content={"error": "messages required"})

    return EventSourceResponse(_stream_response(messages, project))


# --- Streaming logic ---


async def _stream_response(messages: list[dict], project: str):
    """Connect to MCP server and run the agentic loop."""
    mcp_url = MCP_SERVERS.get(project)

    try:
        if mcp_url:
            async with sse_client(mcp_url) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()
                    tools_result = await session.list_tools()
                    tools = [
                        {
                            "name": t.name,
                            "description": t.description or "",
                            "input_schema": t.inputSchema,
                        }
                        for t in tools_result.tools
                    ]
                    async for event in _agentic_loop(messages, tools, session):
                        yield event
        else:
            async for event in _agentic_loop(messages, [], None):
                yield event
    except Exception as e:
        logger.exception("Stream error")
        yield {"event": "error", "data": json.dumps({"error": str(e)})}
        yield {"event": "done", "data": "{}"}


async def _agentic_loop(
    messages: list[dict],
    tools: list[dict],
    mcp_session: ClientSession | None,
):
    """Stream Claude responses, execute MCP tools, loop until done."""
    client = anthropic.AsyncAnthropic()
    conversation = list(messages)

    for _ in range(MAX_TURNS):
        tool_calls: list[dict] = []
        current_tool: dict | None = None
        tool_json_parts: list[str] = []

        api_kwargs: dict = {
            "model": MODEL,
            "messages": conversation,
            "system": SYSTEM_PROMPT,
            "max_tokens": MAX_TOKENS,
        }
        if tools:
            api_kwargs["tools"] = tools

        async with client.messages.stream(**api_kwargs) as stream:
            async for event in stream:
                if event.type == "content_block_start":
                    if event.content_block.type == "tool_use":
                        current_tool = {
                            "id": event.content_block.id,
                            "name": event.content_block.name,
                        }
                        tool_json_parts = []
                        yield {
                            "event": "tool_start",
                            "data": json.dumps(
                                {"tool": event.content_block.name}
                            ),
                        }

                elif event.type == "content_block_delta":
                    if event.delta.type == "text_delta":
                        yield {
                            "event": "text",
                            "data": json.dumps({"text": event.delta.text}),
                        }
                    elif event.delta.type == "input_json_delta":
                        tool_json_parts.append(event.delta.partial_json)

                elif event.type == "content_block_stop":
                    if current_tool is not None:
                        raw = "".join(tool_json_parts)
                        current_tool["input"] = (
                            json.loads(raw) if raw else {}
                        )
                        tool_calls.append(current_tool)
                        current_tool = None
                        tool_json_parts = []

            final_message = await stream.get_final_message()

        if final_message.stop_reason != "tool_use":
            break

        # Append assistant turn to conversation
        conversation.append(
            {
                "role": "assistant",
                "content": [
                    (
                        {"type": "text", "text": b.text}
                        if b.type == "text"
                        else {
                            "type": "tool_use",
                            "id": b.id,
                            "name": b.name,
                            "input": b.input,
                        }
                    )
                    for b in final_message.content
                ],
            }
        )

        # Execute each tool via MCP
        tool_results = []
        for tc in tool_calls:
            result_text = await _execute_tool(
                mcp_session, tc["name"], tc["input"]
            )
            yield {
                "event": "tool_result",
                "data": json.dumps(
                    {"tool": tc["name"], "result": result_text[:2000]}
                ),
            }
            tool_results.append(
                {
                    "type": "tool_result",
                    "tool_use_id": tc["id"],
                    "content": result_text,
                }
            )

        conversation.append({"role": "user", "content": tool_results})

    yield {"event": "done", "data": "{}"}


async def _execute_tool(
    session: ClientSession | None, name: str, arguments: dict
) -> str:
    """Call an MCP tool and return the text result."""
    if session is None:
        return json.dumps(
            {"error": "No MCP server configured for this project"}
        )
    try:
        result = await session.call_tool(name, arguments)
        parts = []
        for item in result.content:
            if hasattr(item, "text"):
                parts.append(item.text)
        return "\n".join(parts) if parts else "{}"
    except Exception as e:
        logger.warning("Tool %s failed: %s", name, e)
        return json.dumps({"error": f"Tool execution failed: {e}"})
