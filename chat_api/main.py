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

MODEL = os.getenv("CHAT_MODEL", "claude-sonnet-4-6")
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
patient datasets and a corpus of transcribed clinical notes:

- UCI Diabetes Dataset: 71,518 diabetes patients with readmission outcomes
- MIMIC-IV Dataset: 211,073 hospital admissions with ICU data
- MTSamples corpus: ~10K embedded chunks from ~5K transcribed clinical notes

Tool routing:
- Quantitative risk questions about a specific patient or hypothetical \
  scenario → predict_risk, get_patient_risk_score, get_high_risk_patients, \
  get_risk_distribution, get_feature_importance, compare_datasets, \
  get_hospital_metrics. Use these for anything involving risk scores, \
  cohort stats, hospital benchmarks, or feature importance.
- Open-ended clinical-knowledge questions ("what does the corpus say \
  about X?", "show me notes discussing Y") → search_clinical_notes.
- Case-similarity questions ("find cases similar to a 65-year-old male \
  with substernal chest pain") → find_similar_cases.
- Hybrid questions: call multiple tools as needed and combine the \
  evidence in your answer.

Citing retrieved chunks (search_clinical_notes / find_similar_cases):
- Each result in the tool's `results` array carries a `citation_index` \
  field with a 1-based number that is unique across the whole turn.
- Cite each fact you take from a retrieved chunk inline as [N], using \
  the chunk's `citation_index`. Multiple citations: [1][3].
- Do NOT invent citation numbers. If the tool returned no results \
  (`result_count: 0` or empty `results`), say plainly that no relevant \
  documentation was found rather than fabricating sources.
- The chunks are clinical documentation, not patient outcomes — when \
  citing them, frame them as "the corpus describes ..." not "the data \
  shows ...".

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

# Tools whose results should be parsed into a structured "citations" SSE
# event for the chat widget to render. Both produce a top-level `results`
# array of items that can be cited.
RAG_TOOLS = {"search_clinical_notes", "find_similar_cases"}


def _process_rag_result(
    tool_name: str, result_text: str, citation_offset: int
) -> tuple[str, list[dict]]:
    """Annotate a RAG tool's JSON result with 1-based ``citation_index``
    fields and extract a flat citations list for the SSE event.

    The annotated JSON is what we hand back to Claude so it can use the
    same indices in its ``[N]`` markers; the citations list is what the
    frontend renders.

    ``citation_offset`` is the highest index emitted earlier in the same
    turn — this function indexes from ``offset + 1`` so multiple RAG
    tool calls in one turn share a single global numbering.

    Falls back gracefully (returns the original text + empty list) if
    the tool result is not parseable JSON or is shaped unexpectedly.
    """
    try:
        data = json.loads(result_text)
    except (ValueError, TypeError):
        return result_text, []

    items = data.get("results")
    if not isinstance(items, list) or not items:
        return result_text, []

    citations: list[dict] = []
    for offset, item in enumerate(items):
        if not isinstance(item, dict):
            continue
        index = citation_offset + 1 + offset
        item["citation_index"] = index

        if tool_name == "search_clinical_notes":
            cite_meta = item.get("citation") or {}
            citations.append({
                "index": index,
                "tool": tool_name,
                "source_id": item.get("source_id"),
                "note_type": item.get("note_type"),
                "content": item.get("content"),
                "similarity": item.get("similarity"),
                "sample_name": cite_meta.get("sample_name"),
                "medical_specialty": cite_meta.get("medical_specialty"),
                "soap_section": cite_meta.get("soap_section"),
                "chunk_index": cite_meta.get("chunk_index"),
                "total_chunks": cite_meta.get("total_chunks"),
            })
        elif tool_name == "find_similar_cases":
            chunks = item.get("matching_chunks") or []
            best_chunk_content = chunks[0].get("content") if chunks else None
            citations.append({
                "index": index,
                "tool": tool_name,
                "source_id": item.get("best_match_source_id"),
                "note_type": item.get("note_type"),
                "content": best_chunk_content,
                "similarity": item.get("best_similarity"),
                "sample_name": item.get("sample_name"),
                "medical_specialty": item.get("medical_specialty"),
                "matching_chunks_count": len(chunks),
            })

    return json.dumps(data, default=str), citations


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
    # Global running citation counter so multiple RAG tool calls in the
    # same turn share one numbering scheme — the same numbering Claude
    # uses for [N] markers because we inject these indices into the
    # tool_result JSON it sees.
    citation_offset = 0

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

            # For RAG tools, parse out citations and inject indices into
            # the JSON Claude sees so its [N] markers line up with what
            # the frontend renders.
            citations: list[dict] = []
            if tc["name"] in RAG_TOOLS:
                result_text, citations = _process_rag_result(
                    tc["name"], result_text, citation_offset
                )
                if citations:
                    citation_offset = citations[-1]["index"]
                    yield {
                        "event": "citations",
                        "data": json.dumps(
                            {"tool": tc["name"], "citations": citations}
                        ),
                    }

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
