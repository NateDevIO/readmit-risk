"""Apply SQL migrations from ``mcp_server/migrations/`` to ``DATABASE_URL``.

Tracks applied filenames in a ``schema_migrations`` table so re-runs are
idempotent. Run with::

    python -m mcp_server.migrate

Files are applied in lexicographic order, so use a numeric prefix
(``001_*.sql``, ``002_*.sql``, ...).
"""

import logging
import sys
from pathlib import Path

from .db import connect

logger = logging.getLogger(__name__)

MIGRATIONS_DIR = Path(__file__).resolve().parent / "migrations"

_TRACKING_TABLE_DDL = """
CREATE TABLE IF NOT EXISTS schema_migrations (
    filename    TEXT         PRIMARY KEY,
    applied_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
)
"""


def _applied_set(conn) -> set[str]:
    with conn.cursor() as cur:
        cur.execute(_TRACKING_TABLE_DDL)
        cur.execute("SELECT filename FROM schema_migrations")
        return {row[0] for row in cur.fetchall()}


def _migration_files() -> list[Path]:
    if not MIGRATIONS_DIR.is_dir():
        return []
    return sorted(p for p in MIGRATIONS_DIR.iterdir() if p.suffix == ".sql")


def apply_migrations() -> list[str]:
    """Apply any pending migrations. Returns the filenames that were applied."""
    files = _migration_files()
    if not files:
        logger.info("No migration files found in %s", MIGRATIONS_DIR)
        return []

    applied: list[str] = []
    with connect() as conn:
        already = _applied_set(conn)
        for path in files:
            if path.name in already:
                logger.info("Skipping %s (already applied)", path.name)
                continue
            sql = path.read_text(encoding="utf-8")
            logger.info("Applying %s", path.name)
            with conn.cursor() as cur:
                cur.execute(sql)
                cur.execute(
                    "INSERT INTO schema_migrations (filename) VALUES (%s)",
                    (path.name,),
                )
            conn.commit()
            applied.append(path.name)

    return applied


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    applied = apply_migrations()
    if applied:
        print("Applied:", ", ".join(applied))
    else:
        print("No pending migrations.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
