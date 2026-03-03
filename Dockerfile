FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies (minimal server-only set)
COPY requirements-server.txt .
RUN pip install --no-cache-dir -r requirements-server.txt

# Copy MCP server code + trained models
COPY mcp_server/ mcp_server/

# Copy data files the server needs at runtime
COPY data/processed/patient_risks.json       data/processed/patient_risks.json
COPY data/processed/patient_risks_mimic.json  data/processed/patient_risks_mimic.json
COPY data/processed/risk_summary.json         data/processed/risk_summary.json
COPY data/processed/risk_summary_mimic.json   data/processed/risk_summary_mimic.json
COPY data/processed/risk_summary_uci.json     data/processed/risk_summary_uci.json
COPY data/processed/hospital_metrics.json     data/processed/hospital_metrics.json
COPY data/processed/state_summary.json        data/processed/state_summary.json
COPY data/feature_importance/feature_importance.json  data/feature_importance/feature_importance.json
COPY data/comparison_reports/dataset_comparison.csv   data/comparison_reports/dataset_comparison.csv

ENV MCP_TRANSPORT=sse
ENV PORT=8000

EXPOSE 8000

CMD ["python", "-m", "mcp_server.server"]
