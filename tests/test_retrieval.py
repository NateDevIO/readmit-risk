"""Unit tests for the retrieval module and the two new MCP tools.

Both ``embed_text`` and ``connect`` are mocked so the suite never touches
Voyage or Postgres. The fake DB cursor returns a hand-crafted set of rows
so we can assert on ranking, dedup, and the JSON envelope shape.
"""

from __future__ import annotations

import json
from contextlib import contextmanager
from unittest.mock import patch

import pytest

# A fixed dummy embedding so we don't have to mock the math.
_FAKE_VEC = [0.0] * 512


# ---------------------------------------------------------------------------
# Fixture: canned rows + fake DB
# ---------------------------------------------------------------------------

# Tuple shape matches the SELECT in retrieval.py:
# (source_id, note_type, content, metadata_dict, similarity)
SAMPLE_ROWS = [
    (
        "mtsamples_chest-pain-eval_chunk_0",
        "Cardiovascular / Pulmonary",
        "Patient presents with substernal chest pain radiating to the left arm.",
        {
            "corpus": "mtsamples",
            "sample_name": "Chest Pain Evaluation",
            "medical_specialty": "Cardiovascular / Pulmonary",
            "soap_section": None,
            "chunk_index": 0,
            "total_chunks": 3,
        },
        0.91,
    ),
    (
        "mtsamples_chest-pain-eval_chunk_1",
        "Cardiovascular / Pulmonary",
        "ECG shows ST-segment depression in the anterolateral leads.",
        {
            "corpus": "mtsamples",
            "sample_name": "Chest Pain Evaluation",
            "medical_specialty": "Cardiovascular / Pulmonary",
            "soap_section": None,
            "chunk_index": 1,
            "total_chunks": 3,
        },
        0.78,
    ),
    (
        "mtsamples_cabg-followup_chunk_0",
        "Cardiovascular / Pulmonary",
        "Status post coronary artery bypass graft, doing well two weeks out.",
        {
            "corpus": "mtsamples",
            "sample_name": "CABG Followup",
            "medical_specialty": "Cardiovascular / Pulmonary",
            "soap_section": "subjective",
            "chunk_index": 0,
            "total_chunks": 4,
        },
        0.74,
    ),
    (
        "mtsamples_chest-pain-eval_chunk_2",
        "Cardiovascular / Pulmonary",
        "Plan: admit for observation and serial troponins.",
        {
            "corpus": "mtsamples",
            "sample_name": "Chest Pain Evaluation",
            "medical_specialty": "Cardiovascular / Pulmonary",
            "soap_section": "plan",
            "chunk_index": 2,
            "total_chunks": 3,
        },
        0.69,
    ),
    (
        "mtsamples_neuro-consult_chunk_0",
        "Neurology",
        "Headache evaluation in 45-year-old with no prior neuro history.",
        {
            "corpus": "mtsamples",
            "sample_name": "Neuro Consult",
            "medical_specialty": "Neurology",
            "soap_section": None,
            "chunk_index": 0,
            "total_chunks": 2,
        },
        0.55,
    ),
]


class FakeCursor:
    def __init__(self, rows):
        self._rows = rows
        self.last_sql = None
        self.last_params = None

    def execute(self, sql, params):
        self.last_sql = sql
        self.last_params = params

    def fetchall(self):
        return self._rows

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


class FakeConn:
    def __init__(self, rows):
        self.cursor_obj = FakeCursor(rows)

    def cursor(self):
        return self.cursor_obj

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


@contextmanager
def _fake_connect_factory(rows):
    """Mimic the ``connect()`` context-manager protocol used in retrieval."""
    yield FakeConn(rows)


@pytest.fixture
def patched_db():
    """Patch ``embed_text`` and ``connect`` for both retrieval and the
    server tools. ``rows_holder`` is a list with a single mutable element
    so individual tests can swap the canned rows without re-patching."""
    rows_holder = [SAMPLE_ROWS]

    def fake_connect(*_a, **_k):
        return _fake_connect_factory(rows_holder[0])

    with (
        patch("mcp_server.retrieval.embed_text", return_value=_FAKE_VEC),
        patch("mcp_server.retrieval.connect", side_effect=fake_connect),
    ):
        yield rows_holder


# ---------------------------------------------------------------------------
# retrieval.search_chunks
# ---------------------------------------------------------------------------


class TestSearchChunks:
    def test_returns_chunks_in_input_order(self, patched_db):
        from mcp_server import retrieval

        # FakeCursor returns rows as-is; SQL ORDER BY is what the real DB
        # would do — here we just confirm the result shaping is correct.
        results = retrieval.search_chunks("chest pain", k=3)
        assert len(results) == 5  # FakeCursor ignores LIMIT — we check shape
        assert results[0]["source_id"] == SAMPLE_ROWS[0][0]
        assert results[0]["similarity"] == pytest.approx(0.91)

    def test_each_result_has_citation_block(self, patched_db):
        from mcp_server import retrieval

        results = retrieval.search_chunks("chest pain")
        for r in results:
            assert "citation" in r
            assert r["citation"]["corpus"] == "mtsamples"
            assert "sample_name" in r["citation"]
            assert "medical_specialty" in r["citation"]
            assert "chunk_index" in r["citation"]
            assert "total_chunks" in r["citation"]

    def test_note_type_filter_passed_to_sql(self, patched_db):
        from mcp_server import retrieval

        retrieval.search_chunks("foo", k=5, note_type="Neurology")
        # The fake cursor doesn't actually filter; just confirm the SQL
        # branch with WHERE was used and the param was forwarded.
        # We can't pull the cursor object out without going through the
        # context manager, so re-run to inspect via a direct fake.
        with patch("mcp_server.retrieval.embed_text", return_value=_FAKE_VEC):
            fake_conn = FakeConn(SAMPLE_ROWS)
            with patch(
                "mcp_server.retrieval.connect",
                lambda *a, **k: _fake_connect_factory_from_conn(fake_conn),
            ):
                retrieval.search_chunks("foo", k=5, note_type="Neurology")
            assert "WHERE note_type" in fake_conn.cursor_obj.last_sql
            assert "Neurology" in fake_conn.cursor_obj.last_params

    def test_empty_results_returns_empty_list(self, patched_db):
        from mcp_server import retrieval

        patched_db[0] = []  # swap canned rows to empty
        results = retrieval.search_chunks("zebra unicorn quark")
        assert results == []

    def test_k_capped_at_20(self, patched_db):
        from mcp_server import retrieval

        # cap_k itself
        assert retrieval.cap_k(0) == 1
        assert retrieval.cap_k(-5) == 1
        assert retrieval.cap_k(50) == 20
        assert retrieval.cap_k(20) == 20
        assert retrieval.cap_k(5) == 5


@contextmanager
def _fake_connect_factory_from_conn(conn):
    yield conn


# ---------------------------------------------------------------------------
# retrieval.search_similar_reports — report-level dedup
# ---------------------------------------------------------------------------


class TestSearchSimilarReports:
    def test_dedupes_by_sample_name(self, patched_db):
        from mcp_server import retrieval

        # SAMPLE_ROWS has 3 chunks from "Chest Pain Evaluation", 1 from
        # "CABG Followup", 1 from "Neuro Consult" — three distinct samples.
        results = retrieval.search_similar_reports("chest pain", k=3)
        assert len(results) == 3
        sample_names = [r["sample_name"] for r in results]
        assert sample_names == [
            "Chest Pain Evaluation",
            "CABG Followup",
            "Neuro Consult",
        ]

    def test_best_chunk_per_report_is_highest_similarity(self, patched_db):
        from mcp_server import retrieval

        results = retrieval.search_similar_reports("chest pain", k=3)
        chest_pain = next(r for r in results if r["sample_name"] == "Chest Pain Evaluation")
        # Best chunk for that sample is row 0 with similarity 0.91.
        assert chest_pain["best_similarity"] == pytest.approx(0.91)
        assert chest_pain["best_match_source_id"] == "mtsamples_chest-pain-eval_chunk_0"

    def test_extra_chunks_from_same_report_aggregate(self, patched_db):
        from mcp_server import retrieval

        results = retrieval.search_similar_reports("chest pain", k=3)
        chest_pain = next(r for r in results if r["sample_name"] == "Chest Pain Evaluation")
        # Three chest-pain chunks in fixture should all show up under
        # matching_chunks, sorted by similarity desc.
        assert len(chest_pain["matching_chunks"]) == 3
        sims = [c["similarity"] for c in chest_pain["matching_chunks"]]
        assert sims == sorted(sims, reverse=True)

    def test_k_caps_distinct_reports(self, patched_db):
        from mcp_server import retrieval

        results = retrieval.search_similar_reports("chest pain", k=2)
        assert len(results) == 2
        # Neuro Consult is the lowest-similarity distinct sample and
        # should be excluded when k=2.
        assert "Neuro Consult" not in [r["sample_name"] for r in results]

    def test_empty_results_returns_empty_list(self, patched_db):
        from mcp_server import retrieval

        patched_db[0] = []
        assert retrieval.search_similar_reports("anything") == []

    def test_each_report_has_citation_block(self, patched_db):
        from mcp_server import retrieval

        results = retrieval.search_similar_reports("chest pain", k=3)
        for r in results:
            assert "citation" in r
            assert r["citation"]["corpus"] == "mtsamples"


# ---------------------------------------------------------------------------
# Tool-level wrappers in server.py — JSON envelope contract
# ---------------------------------------------------------------------------


class TestSearchClinicalNotesTool:
    def test_envelope_shape(self, patched_db):
        from mcp_server.server import search_clinical_notes

        raw = search_clinical_notes(query="chest pain", k=3)
        body = json.loads(raw)
        assert body["query"] == "chest pain"
        assert body["k"] == 3
        assert body["note_type_filter"] is None
        assert body["result_count"] == len(body["results"])
        assert body["results"][0]["citation"]["corpus"] == "mtsamples"

    def test_caps_k_at_20_in_envelope(self, patched_db):
        from mcp_server.server import search_clinical_notes

        body = json.loads(search_clinical_notes(query="x", k=999))
        assert body["k"] == 20

    def test_note_type_filter_surfaces_in_envelope(self, patched_db):
        from mcp_server.server import search_clinical_notes

        body = json.loads(
            search_clinical_notes(query="x", note_type="Neurology", k=3)
        )
        assert body["note_type_filter"] == "Neurology"

    def test_empty_query_raises(self, patched_db):
        from mcp_server.server import search_clinical_notes

        with pytest.raises(ValueError):
            search_clinical_notes(query="   ", k=3)

    def test_empty_results_returns_empty_envelope(self, patched_db):
        from mcp_server.server import search_clinical_notes

        patched_db[0] = []
        body = json.loads(search_clinical_notes(query="zebra", k=3))
        assert body["result_count"] == 0
        assert body["results"] == []


class TestFindSimilarCasesTool:
    def test_envelope_shape(self, patched_db):
        from mcp_server.server import find_similar_cases

        raw = find_similar_cases(case_description="chest pain in 65yo male", k=2)
        body = json.loads(raw)
        assert body["case_description_length"] == len("chest pain in 65yo male")
        assert body["k"] == 2
        assert body["result_count"] == 2
        assert len(body["results"]) == 2

    def test_caps_k_at_20(self, patched_db):
        from mcp_server.server import find_similar_cases

        body = json.loads(find_similar_cases(case_description="x", k=999))
        assert body["k"] == 20

    def test_empty_input_raises(self, patched_db):
        from mcp_server.server import find_similar_cases

        with pytest.raises(ValueError):
            find_similar_cases(case_description="", k=3)

    def test_empty_results_returns_empty_envelope(self, patched_db):
        from mcp_server.server import find_similar_cases

        patched_db[0] = []
        body = json.loads(find_similar_cases(case_description="zebra", k=3))
        assert body["result_count"] == 0
        assert body["results"] == []
