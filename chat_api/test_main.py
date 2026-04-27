"""Tests for the ReadmitRisk Chat API backend."""

import json
from unittest.mock import AsyncMock, patch, MagicMock

import pytest
from fastapi.testclient import TestClient

from main import (
    app,
    _get_client_ip,
    _process_rag_result,
    ALLOWED_ORIGINS,
    MODEL,
    RAG_TOOLS,
    SYSTEM_PROMPT,
)


@pytest.fixture
def client():
    return TestClient(app)


# --- Health endpoint ---


class TestHealth:
    def test_returns_200(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200

    def test_returns_status_ok(self, client):
        body = client.get("/health").json()
        assert body["status"] == "ok"

    def test_returns_model_name(self, client):
        body = client.get("/health").json()
        assert body["model"] == MODEL


# --- Chat endpoint validation ---


class TestChatValidation:
    def test_rejects_empty_messages(self, client):
        resp = client.post(
            "/api/chat",
            json={"messages": [], "project": "readmitrisk"},
        )
        assert resp.status_code == 400
        assert "messages required" in resp.json()["error"]

    def test_rejects_missing_messages(self, client):
        resp = client.post("/api/chat", json={"project": "readmitrisk"})
        assert resp.status_code == 400

    def test_accepts_valid_request(self, client):
        """A valid request returns 200 with text/event-stream content type.
        It will fail to actually stream (no Anthropic key in tests),
        but the request itself is accepted."""
        resp = client.post(
            "/api/chat",
            json={
                "messages": [{"role": "user", "content": "hello"}],
                "project": "readmitrisk",
            },
        )
        # Should get 200 (SSE stream starts, even if it errors internally)
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers.get("content-type", "")

    def test_defaults_project_to_readmitrisk(self, client):
        """When project is omitted, it defaults to readmitrisk."""
        resp = client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "hi"}]},
        )
        assert resp.status_code == 200


# --- CORS ---


class TestCORS:
    def test_allows_vercel_origin(self, client):
        resp = client.options(
            "/api/chat",
            headers={
                "Origin": "https://readmit-risk.vercel.app",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        assert resp.headers["access-control-allow-origin"] == "https://readmit-risk.vercel.app"

    def test_allows_localhost_origin(self, client):
        resp = client.options(
            "/api/chat",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        assert resp.headers["access-control-allow-origin"] == "http://localhost:3000"

    def test_allows_natedev_origin(self, client):
        resp = client.options(
            "/api/chat",
            headers={
                "Origin": "https://natedev.io",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        assert resp.headers["access-control-allow-origin"] == "https://natedev.io"

    def test_rejects_unknown_origin(self, client):
        resp = client.options(
            "/api/chat",
            headers={
                "Origin": "https://evil.com",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        assert "access-control-allow-origin" not in resp.headers


# --- Client IP extraction ---


class TestClientIP:
    def test_extracts_from_x_forwarded_for(self):
        request = MagicMock()
        request.headers = {"x-forwarded-for": "1.2.3.4, 10.0.0.1"}
        result = _get_client_ip(request)
        assert result == "1.2.3.4"

    def test_falls_back_to_client_host(self):
        request = MagicMock()
        request.headers = {}
        request.client.host = "127.0.0.1"
        result = _get_client_ip(request)
        assert result == "127.0.0.1"

    def test_handles_no_client(self):
        request = MagicMock()
        request.headers = {}
        request.client = None
        result = _get_client_ip(request)
        assert result == "unknown"

    def test_strips_whitespace_from_forwarded_ip(self):
        request = MagicMock()
        request.headers = {"x-forwarded-for": "  5.6.7.8 , 10.0.0.1"}
        result = _get_client_ip(request)
        assert result == "5.6.7.8"


# --- Configuration ---


class TestConfiguration:
    def test_allowed_origins_has_three_entries(self):
        assert len(ALLOWED_ORIGINS) == 3
        assert "https://readmit-risk.vercel.app" in ALLOWED_ORIGINS
        assert "http://localhost:3000" in ALLOWED_ORIGINS
        assert "https://natedev.io" in ALLOWED_ORIGINS

    def test_system_prompt_mentions_both_datasets(self):
        assert "UCI" in SYSTEM_PROMPT
        assert "MIMIC" in SYSTEM_PROMPT

    def test_system_prompt_includes_disclaimer(self):
        assert "portfolio" in SYSTEM_PROMPT.lower() or "demo" in SYSTEM_PROMPT.lower()

    def test_model_default(self):
        assert "claude" in MODEL.lower()


# --- SSE stream format (integration-level) ---


class TestStreamFormat:
    def test_stream_emits_error_event_on_missing_api_key(self, client):
        """Without ANTHROPIC_API_KEY, the stream should emit an error event
        rather than crashing."""
        resp = client.post(
            "/api/chat",
            json={
                "messages": [{"role": "user", "content": "test"}],
                "project": "readmitrisk",
            },
        )
        assert resp.status_code == 200

        # Parse SSE events from the response body
        body = resp.text
        events = []
        for block in body.split("\n\n"):
            event_type = ""
            data = ""
            for line in block.strip().split("\n"):
                if line.startswith("event:"):
                    event_type = line[6:].strip()
                elif line.startswith("data:"):
                    data = line[5:].strip()
            if event_type or data:
                events.append({"event": event_type, "data": data})

        # Should contain at least an error or done event
        event_types = [e["event"] for e in events]
        assert "error" in event_types or "done" in event_types

    def test_stream_emits_done_event(self, client):
        """The stream should always end with a done event."""
        resp = client.post(
            "/api/chat",
            json={
                "messages": [{"role": "user", "content": "test"}],
                "project": "readmitrisk",
            },
        )
        body = resp.text
        assert "event: done" in body


# --- RAG citation handling ---


_SEARCH_TOOL_PAYLOAD = {
    "query": "beta-blocker contraindications",
    "note_type_filter": None,
    "k": 2,
    "result_count": 2,
    "results": [
        {
            "source_id": "mtsamples_chest-pain-eval_chunk_0",
            "note_type": "Cardiovascular / Pulmonary",
            "content": "Patient presents with substernal chest pain.",
            "similarity": 0.91,
            "metadata": {},
            "citation": {
                "corpus": "mtsamples",
                "sample_name": "Chest Pain Evaluation",
                "medical_specialty": "Cardiovascular / Pulmonary",
                "soap_section": None,
                "chunk_index": 0,
                "total_chunks": 3,
            },
        },
        {
            "source_id": "mtsamples_cabg-followup_chunk_0",
            "note_type": "Cardiovascular / Pulmonary",
            "content": "Status post CABG, doing well.",
            "similarity": 0.74,
            "metadata": {},
            "citation": {
                "corpus": "mtsamples",
                "sample_name": "CABG Followup",
                "medical_specialty": "Cardiovascular / Pulmonary",
                "soap_section": "subjective",
                "chunk_index": 0,
                "total_chunks": 4,
            },
        },
    ],
}


_SIMILAR_TOOL_PAYLOAD = {
    "case_description_length": 60,
    "k": 2,
    "result_count": 2,
    "results": [
        {
            "sample_name": "CABG Followup",
            "medical_specialty": "Cardiovascular / Pulmonary",
            "note_type": "Cardiovascular / Pulmonary",
            "best_similarity": 0.535,
            "best_match_source_id": "mtsamples_cabg-followup_chunk_0",
            "matching_chunks": [
                {
                    "source_id": "mtsamples_cabg-followup_chunk_0",
                    "content": "Status post CABG, doing well.",
                    "similarity": 0.535,
                },
                {
                    "source_id": "mtsamples_cabg-followup_chunk_2",
                    "content": "Continues on aspirin and statin.",
                    "similarity": 0.42,
                },
            ],
            "citation": {"corpus": "mtsamples"},
        },
        {
            "sample_name": "Stress Test",
            "medical_specialty": "Cardiovascular / Pulmonary",
            "note_type": "Cardiovascular / Pulmonary",
            "best_similarity": 0.51,
            "best_match_source_id": "mtsamples_stress-test_chunk_0",
            "matching_chunks": [
                {
                    "source_id": "mtsamples_stress-test_chunk_0",
                    "content": "Bruce protocol, achieved target HR.",
                    "similarity": 0.51,
                },
            ],
            "citation": {"corpus": "mtsamples"},
        },
    ],
}


class TestRAGToolsConstant:
    def test_rag_tools_is_set_of_two(self):
        assert RAG_TOOLS == {"search_clinical_notes", "find_similar_cases"}


class TestSystemPromptRouting:
    def test_mentions_search_clinical_notes(self):
        assert "search_clinical_notes" in SYSTEM_PROMPT

    def test_mentions_find_similar_cases(self):
        assert "find_similar_cases" in SYSTEM_PROMPT

    def test_mentions_predict_risk_routing(self):
        assert "predict_risk" in SYSTEM_PROMPT

    def test_explains_citation_index_field(self):
        assert "citation_index" in SYSTEM_PROMPT

    def test_instructs_bracketed_citation_marker(self):
        # Look for the literal "[N]" instruction.
        assert "[N]" in SYSTEM_PROMPT

    def test_forbids_fabricating_citations(self):
        lower = SYSTEM_PROMPT.lower()
        assert "fabricat" in lower or "invent" in lower


class TestProcessRagResultSearch:
    def test_indexes_each_result_starting_at_offset_plus_one(self):
        text = json.dumps(_SEARCH_TOOL_PAYLOAD)
        modified, citations = _process_rag_result(
            "search_clinical_notes", text, citation_offset=0
        )
        assert [c["index"] for c in citations] == [1, 2]
        # The annotated JSON Claude sees must include citation_index too.
        annotated = json.loads(modified)
        assert annotated["results"][0]["citation_index"] == 1
        assert annotated["results"][1]["citation_index"] == 2

    def test_carries_metadata_into_citation(self):
        text = json.dumps(_SEARCH_TOOL_PAYLOAD)
        _, citations = _process_rag_result(
            "search_clinical_notes", text, citation_offset=0
        )
        first = citations[0]
        assert first["source_id"] == "mtsamples_chest-pain-eval_chunk_0"
        assert first["sample_name"] == "Chest Pain Evaluation"
        assert first["medical_specialty"] == "Cardiovascular / Pulmonary"
        assert first["chunk_index"] == 0
        assert first["total_chunks"] == 3
        assert first["similarity"] == pytest.approx(0.91)
        assert first["content"].startswith("Patient presents")
        assert first["tool"] == "search_clinical_notes"

    def test_offset_is_respected_across_calls(self):
        text = json.dumps(_SEARCH_TOOL_PAYLOAD)
        # Offset of 5 → indices 6, 7
        _, citations = _process_rag_result(
            "search_clinical_notes", text, citation_offset=5
        )
        assert [c["index"] for c in citations] == [6, 7]


class TestProcessRagResultSimilar:
    def test_one_citation_per_report(self):
        text = json.dumps(_SIMILAR_TOOL_PAYLOAD)
        modified, citations = _process_rag_result(
            "find_similar_cases", text, citation_offset=0
        )
        assert len(citations) == 2
        assert [c["sample_name"] for c in citations] == ["CABG Followup", "Stress Test"]
        annotated = json.loads(modified)
        assert annotated["results"][0]["citation_index"] == 1
        assert annotated["results"][1]["citation_index"] == 2

    def test_uses_best_match_chunk_content(self):
        text = json.dumps(_SIMILAR_TOOL_PAYLOAD)
        _, citations = _process_rag_result(
            "find_similar_cases", text, citation_offset=0
        )
        assert citations[0]["content"] == "Status post CABG, doing well."
        assert citations[0]["source_id"] == "mtsamples_cabg-followup_chunk_0"
        assert citations[0]["similarity"] == pytest.approx(0.535)
        assert citations[0]["matching_chunks_count"] == 2
        assert citations[0]["tool"] == "find_similar_cases"

    def test_handles_empty_matching_chunks(self):
        payload = {
            "result_count": 1,
            "results": [
                {
                    "sample_name": "Lonely Sample",
                    "medical_specialty": "Surgery",
                    "note_type": "Surgery",
                    "best_similarity": 0.5,
                    "best_match_source_id": "mtsamples_lonely_chunk_0",
                    "matching_chunks": [],
                }
            ],
        }
        _, citations = _process_rag_result(
            "find_similar_cases", json.dumps(payload), citation_offset=0
        )
        assert len(citations) == 1
        assert citations[0]["content"] is None


class TestProcessRagResultEdgeCases:
    def test_malformed_json_returns_original_and_empty_citations(self):
        modified, citations = _process_rag_result(
            "search_clinical_notes", "not-json{{", citation_offset=0
        )
        assert modified == "not-json{{"
        assert citations == []

    def test_empty_results_array_returns_empty_citations(self):
        text = json.dumps({"result_count": 0, "results": []})
        modified, citations = _process_rag_result(
            "search_clinical_notes", text, citation_offset=0
        )
        assert citations == []
        assert modified == text  # Unchanged (no items to index)

    def test_missing_results_key_is_safe(self):
        text = json.dumps({"unexpected": "shape"})
        modified, citations = _process_rag_result(
            "search_clinical_notes", text, citation_offset=0
        )
        assert citations == []
        assert modified == text
