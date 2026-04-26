"""Postgres connection helpers for the RAG pipeline.

The MCP server's existing tools are file-backed and unaffected by this
module. New RAG code (ingestion, retrieval) will import ``connect()`` to
talk to the Railway-hosted Postgres instance with pgvector enabled.
"""

import logging
import os

logger = logging.getLogger(__name__)

DATABASE_URL_ENV = "DATABASE_URL"


def get_database_url() -> str:
    """Return the configured ``DATABASE_URL`` or raise."""
    url = os.getenv(DATABASE_URL_ENV)
    if not url:
        raise RuntimeError(
            f"{DATABASE_URL_ENV} is not set. Configure it before connecting."
        )
    return url


def connect(autocommit: bool = False):
    """Open a psycopg3 connection with the pgvector adapter registered.

    psycopg and pgvector are imported lazily so importing this module
    does not require the drivers to be installed (useful for offline
    unit tests that mock ``connect``). The caller is responsible for
    ``conn.close()`` (or use as a context manager).
    """
    import psycopg
    from pgvector.psycopg import register_vector

    conn = psycopg.connect(get_database_url(), autocommit=autocommit)
    register_vector(conn)
    return conn
