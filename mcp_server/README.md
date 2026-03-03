# ReadmitRisk MCP Server

MCP (Model Context Protocol) server that exposes hospital readmission risk data and ML models as conversational tools for AI assistants.

## Quick Start

```bash
# Install dependencies
pip install mcp joblib pyarrow

# (Optional) Train models for the predict_risk tool
python -m mcp_server.train_model

# Run the server
python -m mcp_server.server
```

## Tools

| Tool | Description |
|------|-------------|
| `get_patient_risk_score` | Look up risk score, tier, and cost for a specific patient |
| `get_high_risk_patients` | List patients above a risk threshold, with optional age filters |
| `get_hospital_metrics` | Query hospital readmission rates and CMS penalties |
| `get_risk_distribution` | Pre-computed distribution, tier counts, and cost breakdowns |
| `compare_datasets` | Side-by-side UCI vs MIMIC-IV comparison |
| `get_feature_importance` | Top features driving readmission risk |
| `predict_risk` | Live risk prediction using trained ML models |

## Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "readmit-risk": {
      "command": "python",
      "args": ["-m", "mcp_server.server"],
      "cwd": "/path/to/readmit-risk"
    }
  }
}
```

If using a virtual environment:

```json
{
  "mcpServers": {
    "readmit-risk": {
      "command": "/path/to/readmit-risk/.venv/Scripts/python",
      "args": ["-m", "mcp_server.server"],
      "cwd": "/path/to/readmit-risk"
    }
  }
}
```

## Remote Server (Railway)

The server is deployed on Railway and available publicly — no clone or install needed:

```json
{
  "mcpServers": {
    "readmit-risk": {
      "url": "https://readmit-risk-production.up.railway.app/sse"
    }
  }
}
```

Add this to your Claude Desktop config (`claude_desktop_config.json`) or any MCP-compatible client. All 7 tools work identically over the remote SSE transport.

To run your own instance: deploy this repo to Railway, set `MCP_TRANSPORT=sse`, and Railway auto-detects the Dockerfile.

## Data Requirements

- All tools except `predict_risk` work out of the box with the existing `data/processed/` JSON files.
- `predict_risk` requires trained model artifacts. Run `python -m mcp_server.train_model` to generate them.
  - UCI model needs `data/raw/diabetic_data.csv`
  - MIMIC model needs `data/mimic_processed/mimic_features_latest.parquet`

## Testing

Use the MCP Inspector to test tools interactively:

```bash
npx @modelcontextprotocol/inspector python -m mcp_server.server
```
