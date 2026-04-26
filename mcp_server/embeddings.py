"""Voyage embedding client used by the RAG pipeline.

Wraps the official ``voyageai`` SDK so the rest of the codebase can call
``embed_text`` / ``embed_batch`` without thinking about model names, retries,
or dimensionality. Reads the API key from the ``VOYAGE_API_KEY`` env var.
"""

import logging
import os
from typing import Sequence

logger = logging.getLogger(__name__)

# voyage-3-lite has a fixed output dimension of 512. The clinical_notes
# table's vector column is sized to match — keep these in sync.
DEFAULT_MODEL = "voyage-3-lite"
EMBEDDING_DIM = 512

# Tuning knobs. The SDK handles wait-and-retry on rate-limit and transient
# 5xx errors when max_retries > 0; we set a sensible default that callers
# can override via env vars without touching code.
_MAX_RETRIES = int(os.getenv("VOYAGE_MAX_RETRIES", "3"))
_TIMEOUT_SECS = int(os.getenv("VOYAGE_TIMEOUT_SECS", "30"))
_BATCH_INPUT_TYPE = "document"
_QUERY_INPUT_TYPE = "query"

_client = None  # type: ignore[var-annotated]


def _get_client():
    """Lazy-init a process-wide Voyage client.

    Done lazily so importing this module never requires the SDK or the
    API key, which keeps unit tests and the existing MCP tools
    unaffected when RAG is off.
    """
    global _client
    if _client is None:
        import voyageai

        api_key = os.getenv("VOYAGE_API_KEY")
        if not api_key:
            raise RuntimeError(
                "VOYAGE_API_KEY is not set. Export it before calling "
                "embed_text / embed_batch."
            )
        _client = voyageai.Client(
            api_key=api_key,
            max_retries=_MAX_RETRIES,
            timeout=_TIMEOUT_SECS,
        )
    return _client


def embed_text(text: str, model: str = DEFAULT_MODEL) -> list[float]:
    """Embed a single query string and return a ``EMBEDDING_DIM``-length vector.

    Args:
        text: Query text to embed. Must be non-empty.
        model: Voyage model name. Defaults to ``voyage-3-lite``.

    Raises:
        ValueError: If ``text`` is empty.
        voyageai.error.VoyageError: If the API call fails after retries.
    """
    if not text or not text.strip():
        raise ValueError("embed_text requires non-empty text")

    client = _get_client()
    try:
        result = client.embed(
            [text],
            model=model,
            input_type=_QUERY_INPUT_TYPE,
        )
    except Exception:
        logger.exception("Voyage embed_text failed (model=%s)", model)
        raise

    return result.embeddings[0]


def embed_batch(
    texts: Sequence[str], model: str = DEFAULT_MODEL
) -> list[list[float]]:
    """Embed many strings for ingestion. Returns one vector per input.

    Args:
        texts: Sequence of non-empty strings.
        model: Voyage model name. Defaults to ``voyage-3-lite``.

    Raises:
        ValueError: If ``texts`` is empty or contains an empty string.
        voyageai.error.VoyageError: If the API call fails after retries.
    """
    if not texts:
        raise ValueError("embed_batch requires at least one text")
    if any((t is None or not t.strip()) for t in texts):
        raise ValueError("embed_batch inputs must all be non-empty strings")

    client = _get_client()
    try:
        result = client.embed(
            list(texts),
            model=model,
            input_type=_BATCH_INPUT_TYPE,
        )
    except Exception:
        logger.exception(
            "Voyage embed_batch failed (model=%s, count=%d)", model, len(texts)
        )
        raise

    return result.embeddings
