"""Tests for the ReadmitRisk Chat API backend."""

import json
from unittest.mock import AsyncMock, patch, MagicMock

import pytest
from fastapi.testclient import TestClient

from main import app, _get_client_ip, ALLOWED_ORIGINS, MODEL, SYSTEM_PROMPT


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
