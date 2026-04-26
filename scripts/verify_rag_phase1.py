"""Phase 1 verification: pgvector + clinical_notes + Voyage embeddings.

Run after applying migrations and exporting VOYAGE_API_KEY + DATABASE_URL::

    python scripts/verify_rag_phase1.py

Checks:
  1. pgvector extension is enabled.
  2. clinical_notes table exists with the expected columns.
  3. embed_text("test") returns a vector of EMBEDDING_DIM floats.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from mcp_server.db import connect  # noqa: E402
from mcp_server.embeddings import EMBEDDING_DIM, embed_text  # noqa: E402

EXPECTED_COLUMNS = {
    "id",
    "source_id",
    "note_type",
    "content",
    "embedding",
    "metadata",
    "created_at",
}


def check_extension() -> None:
    with connect() as conn, conn.cursor() as cur:
        cur.execute(
            "SELECT extname FROM pg_extension WHERE extname = 'vector'"
        )
        row = cur.fetchone()
    if not row:
        raise SystemExit("FAIL: pgvector extension not enabled")
    print("OK   pgvector extension enabled")


def check_table() -> None:
    with connect() as conn, conn.cursor() as cur:
        cur.execute(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'clinical_notes'
            """
        )
        cols = {r[0] for r in cur.fetchall()}
    missing = EXPECTED_COLUMNS - cols
    if missing:
        raise SystemExit(f"FAIL: clinical_notes missing columns: {missing}")
    print("OK   clinical_notes table has expected columns")


def check_embedding() -> None:
    vec = embed_text("test")
    if not isinstance(vec, list):
        raise SystemExit(f"FAIL: embed_text returned {type(vec).__name__}")
    if len(vec) != EMBEDDING_DIM:
        raise SystemExit(
            f"FAIL: embedding length {len(vec)} != expected {EMBEDDING_DIM}"
        )
    if not all(isinstance(x, float) for x in vec[:5]):
        raise SystemExit("FAIL: embedding values are not floats")
    print(f"OK   embed_text('test') returned {len(vec)}-dim vector")


def main() -> int:
    check_extension()
    check_table()
    check_embedding()
    print("\nPhase 1 verification passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
