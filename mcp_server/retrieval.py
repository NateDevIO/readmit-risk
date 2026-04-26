"""Vector search helpers backing the RAG MCP tools.

The MCP tool layer (``server.py``) calls these helpers for the actual
embedding + cosine-similarity work, then JSON-wraps the results. Keeping
the SQL and Voyage calls here makes the tools easy to unit-test by
mocking ``embed_text`` and ``connect``.

Cosine distance via the ``<=>`` operator pairs with the HNSW index
created in Phase 1 (``vector_cosine_ops``). Similarity is reported as
``1 - distance`` so callers see a ``[0, 1]`` score where higher is better.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from .db import connect
from .embeddings import embed_text

logger = logging.getLogger(__name__)

# Hard cap on requested results to prevent abusive or runaway queries.
K_MAX = 20

# Per-report match cap so similar_cases responses don't explode in size.
MATCHES_PER_REPORT = 5

# Multiplier used when over-fetching chunks for report-level aggregation.
# We need extra raw chunks because many of the top-N may share a report.
SIMILAR_OVERFETCH_FACTOR = 5
SIMILAR_OVERFETCH_CAP = 100


def cap_k(k: int) -> int:
    """Clamp ``k`` to the inclusive range ``[1, K_MAX]``."""
    if k < 1:
        return 1
    if k > K_MAX:
        return K_MAX
    return k


def _row_to_chunk(row: tuple) -> dict[str, Any]:
    """Shape a fetched row into the public chunk dict.

    Row order: ``source_id, note_type, content, metadata, similarity``.
    Metadata is already a dict thanks to psycopg's JSONB adapter.
    """
    source_id, note_type, content, metadata, similarity = row
    meta = metadata or {}
    return {
        "source_id": source_id,
        "note_type": note_type,
        "content": content,
        "similarity": float(similarity),
        "metadata": meta,
        # Surface the most-cited fields up top so the LLM can build a
        # citation without digging into metadata.
        "citation": {
            "corpus": meta.get("corpus", "mtsamples"),
            "sample_name": meta.get("sample_name"),
            "medical_specialty": meta.get("medical_specialty"),
            "soap_section": meta.get("soap_section"),
            "chunk_index": meta.get("chunk_index"),
            "total_chunks": meta.get("total_chunks"),
        },
    }


def search_chunks(
    query: str,
    *,
    k: int = 5,
    note_type: str | None = None,
) -> list[dict[str, Any]]:
    """Return the top-``k`` chunks ranked by cosine similarity to ``query``.

    Args:
        query: Natural-language query. Embedded via ``embed_text``.
        k: Number of chunks to return. Clamped to ``[1, K_MAX]``.
        note_type: Optional exact-match filter on the ``note_type`` column.

    Returns: list of chunk dicts; ``[]`` if no rows match.
    """
    k = cap_k(k)
    t0 = time.perf_counter()
    embedding = embed_text(query)

    if note_type:
        sql = (
            "SELECT source_id, note_type, content, metadata, "
            "       1 - (embedding <=> %s::vector) AS similarity "
            "FROM clinical_notes "
            "WHERE note_type = %s "
            "ORDER BY embedding <=> %s::vector "
            "LIMIT %s"
        )
        params: tuple = (embedding, note_type, embedding, k)
    else:
        sql = (
            "SELECT source_id, note_type, content, metadata, "
            "       1 - (embedding <=> %s::vector) AS similarity "
            "FROM clinical_notes "
            "ORDER BY embedding <=> %s::vector "
            "LIMIT %s"
        )
        params = (embedding, embedding, k)

    with connect() as conn, conn.cursor() as cur:
        cur.execute(sql, params)
        rows = cur.fetchall()

    results = [_row_to_chunk(r) for r in rows]
    latency = time.perf_counter() - t0
    logger.info(
        "search_chunks query_len=%d k=%d note_type=%r latency=%.3fs results=%d",
        len(query),
        k,
        note_type,
        latency,
        len(results),
    )
    return results


def search_similar_reports(
    case_description: str,
    *,
    k: int = 3,
) -> list[dict[str, Any]]:
    """Return the top-``k`` *reports* (deduped by ``sample_name``) most
    semantically similar to ``case_description``.

    Each result aggregates up to ``MATCHES_PER_REPORT`` of that report's
    matching chunks, sorted by similarity (best first).

    Args:
        case_description: Free-text description of a patient or case.
        k: Number of distinct reports to return. Clamped to ``[1, K_MAX]``.

    Returns: list of report dicts; ``[]`` if no rows match.
    """
    k = cap_k(k)
    fetch_limit = min(k * SIMILAR_OVERFETCH_FACTOR, SIMILAR_OVERFETCH_CAP)

    t0 = time.perf_counter()
    embedding = embed_text(case_description)

    sql = (
        "SELECT source_id, note_type, content, metadata, "
        "       1 - (embedding <=> %s::vector) AS similarity "
        "FROM clinical_notes "
        "ORDER BY embedding <=> %s::vector "
        "LIMIT %s"
    )

    with connect() as conn, conn.cursor() as cur:
        cur.execute(sql, (embedding, embedding, fetch_limit))
        rows = cur.fetchall()

    # Dedupe by sample_name. Rows are already sorted by similarity DESC,
    # so the first chunk we see for any sample is the best match for that
    # sample. Subsequent chunks from the same sample are stashed as extras.
    by_sample: dict[str, dict[str, Any]] = {}
    for row in rows:
        chunk = _row_to_chunk(row)
        meta = chunk["metadata"] or {}
        sample = meta.get("sample_name") or chunk["source_id"]

        if sample in by_sample:
            entry = by_sample[sample]
            if len(entry["matching_chunks"]) < MATCHES_PER_REPORT:
                entry["matching_chunks"].append(_chunk_summary(chunk))
            continue

        if len(by_sample) >= k:
            continue

        by_sample[sample] = {
            "sample_name": sample,
            "medical_specialty": meta.get("medical_specialty"),
            "note_type": chunk["note_type"],
            "best_similarity": chunk["similarity"],
            "best_match_source_id": chunk["source_id"],
            "matching_chunks": [_chunk_summary(chunk)],
            "citation": chunk["citation"],
        }

    results = list(by_sample.values())
    latency = time.perf_counter() - t0
    logger.info(
        "search_similar_reports query_len=%d k=%d latency=%.3fs reports=%d",
        len(case_description),
        k,
        latency,
        len(results),
    )
    return results


def _chunk_summary(chunk: dict[str, Any]) -> dict[str, Any]:
    """Compact per-match shape used inside report-level aggregations."""
    meta = chunk["metadata"] or {}
    return {
        "source_id": chunk["source_id"],
        "content": chunk["content"],
        "similarity": chunk["similarity"],
        "soap_section": meta.get("soap_section"),
        "chunk_index": meta.get("chunk_index"),
    }
