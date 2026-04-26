"""Ingest the MTSamples public clinical corpus into ``clinical_notes``.

Steps per row:
  1. Read the raw transcription from the MTSamples CSV.
  2. SOAP-aware chunk it via ``mcp_server.chunking.chunk_clinical_note``.
  3. Skip chunks whose ``source_id`` already exists in the DB (idempotent).
  4. Embed the remaining chunks via ``mcp_server.embeddings.embed_batch``.
  5. Bulk-insert into ``clinical_notes`` with rich metadata.

Usage::

    # default: read from data/mtsamples_raw/mtsamples.csv
    python ingest_mtsamples.py --limit 10

    # download via kagglehub (public dataset; install kagglehub first)
    python ingest_mtsamples.py --download --limit 50

    # explicit path
    python ingest_mtsamples.py --csv /path/to/mtsamples.csv

Environment:
    DATABASE_URL    Postgres connection string with pgvector enabled.
    VOYAGE_API_KEY  Voyage API key for embeddings.
"""

from __future__ import annotations

import argparse
import csv
import json
import logging
import re
import sys
import time
from pathlib import Path
from typing import Iterable, Iterator

from psycopg.types.json import Jsonb

from mcp_server.chunking import Chunk, chunk_clinical_note
from mcp_server.db import connect
from mcp_server.embeddings import embed_batch

# CSV parser handles long transcription cells; raise the field limit so
# unusually long rows don't blow up.
csv.field_size_limit(min(sys.maxsize, 2**31 - 1))

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent
DEFAULT_CSV_PATH = PROJECT_ROOT / "data" / "mtsamples_raw" / "mtsamples.csv"
KAGGLE_DATASET = "tboyle10/medicaltranscriptions"

# Voyage allows large batches; 64 keeps memory + retry blast radius small.
EMBED_BATCH_SIZE = 64

# Columns we expect from the standard MTSamples CSV. Other columns are
# tolerated and ignored.
EXPECTED_COLUMNS = ("sample_name", "medical_specialty", "transcription")


# ---------------------------------------------------------------------------
# CSV / corpus loading
# ---------------------------------------------------------------------------


def slugify(name: str) -> str:
    """Convert a sample name into a stable, URL-safe slug for source_id."""
    s = re.sub(r"[^a-zA-Z0-9]+", "-", (name or "").strip().lower())
    return s.strip("-")[:80]


def download_corpus(target_dir: Path) -> Path:
    """Download the MTSamples CSV via kagglehub. Requires ``kagglehub``
    to be installed; for public datasets no auth setup is needed."""
    try:
        import kagglehub
    except ImportError as exc:
        raise SystemExit(
            "kagglehub is not installed. Either run `pip install kagglehub`,\n"
            "or download the CSV manually from\n"
            f"  https://www.kaggle.com/datasets/{KAGGLE_DATASET}\n"
            f"and place it at {target_dir / 'mtsamples.csv'}."
        ) from exc

    logger.info("Downloading %s via kagglehub...", KAGGLE_DATASET)
    cache_path = Path(kagglehub.dataset_download(KAGGLE_DATASET))
    csvs = sorted(cache_path.rglob("*.csv"))
    if not csvs:
        raise SystemExit(f"No CSV files found inside {cache_path}")

    target_dir.mkdir(parents=True, exist_ok=True)
    target_csv = target_dir / "mtsamples.csv"
    target_csv.write_bytes(csvs[0].read_bytes())
    logger.info("Wrote corpus to %s", target_csv)
    return target_csv


def load_corpus(path: Path) -> list[dict]:
    """Read the MTSamples CSV and drop rows with no transcription."""
    if not path.exists():
        raise SystemExit(
            f"MTSamples CSV not found at {path}.\n"
            "Run with --download (requires kagglehub), or download from\n"
            f"  https://www.kaggle.com/datasets/{KAGGLE_DATASET}\n"
            "and pass --csv <path> or place it at the default location."
        )
    with path.open(encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        rows = [r for r in reader if (r.get("transcription") or "").strip()]
    missing = [c for c in EXPECTED_COLUMNS if c not in (rows[0] if rows else {})]
    if missing:
        logger.warning("CSV missing expected columns: %s", missing)
    logger.info("Loaded %d rows with non-empty transcriptions from %s", len(rows), path)
    return rows


# ---------------------------------------------------------------------------
# Record building
# ---------------------------------------------------------------------------


def build_records(rows: Iterable[dict]) -> Iterator[dict]:
    """Yield one record dict per chunk, ready for embedding + insertion."""
    for row_idx, row in enumerate(rows):
        sample_name = (row.get("sample_name") or "").strip()
        slug = slugify(sample_name) or f"row-{row_idx}"
        specialty = (row.get("medical_specialty") or "").strip()
        keywords = (row.get("keywords") or "").strip()
        transcription = (row.get("transcription") or "").strip()

        chunks: list[Chunk] = chunk_clinical_note(transcription)
        if not chunks:
            logger.debug("Row %d (%s) produced no chunks — skipping", row_idx, slug)
            continue

        total = len(chunks)
        for i, ch in enumerate(chunks):
            note_type = (
                ch.soap_section.lower() if ch.soap_section else (specialty or "clinical_note")
            )
            metadata = {
                "corpus": "mtsamples",
                "sample_name": sample_name,
                "medical_specialty": specialty,
                "keywords": keywords,
                "chunk_index": i,
                "total_chunks": total,
                "soap_section": ch.soap_section,
            }
            yield {
                "source_id": f"mtsamples_{slug}_chunk_{i}",
                "note_type": note_type,
                "content": ch.text,
                "metadata": metadata,
            }


def filter_existing(records: list[dict]) -> list[dict]:
    """Remove records whose source_id is already in the DB."""
    if not records:
        return []
    ids = [r["source_id"] for r in records]
    with connect() as conn, conn.cursor() as cur:
        cur.execute(
            "SELECT source_id FROM clinical_notes WHERE source_id = ANY(%s)",
            (ids,),
        )
        existing = {row[0] for row in cur.fetchall()}
    skipped = len(existing)
    new_records = [r for r in records if r["source_id"] not in existing]
    if skipped:
        logger.info("Skipped %d already-ingested chunks", skipped)
    return new_records


# ---------------------------------------------------------------------------
# Embedding + insertion
# ---------------------------------------------------------------------------


def _batched(seq: list[dict], n: int) -> Iterator[list[dict]]:
    for i in range(0, len(seq), n):
        yield seq[i : i + n]


def embed_and_insert(records: list[dict], embed_batch_size: int = EMBED_BATCH_SIZE) -> int:
    """Embed records in batches and insert them. Returns rows inserted."""
    if not records:
        return 0

    inserted = 0
    sql = (
        "INSERT INTO clinical_notes "
        "(source_id, note_type, content, embedding, metadata) "
        "VALUES (%s, %s, %s, %s, %s)"
    )

    with connect() as conn:
        for batch in _batched(records, embed_batch_size):
            t0 = time.perf_counter()
            vectors = embed_batch([r["content"] for r in batch])
            embed_secs = time.perf_counter() - t0

            params = [
                (
                    r["source_id"],
                    r["note_type"],
                    r["content"],
                    v,
                    Jsonb(r["metadata"]),
                )
                for r, v in zip(batch, vectors)
            ]
            with conn.cursor() as cur:
                cur.executemany(sql, params)
            conn.commit()
            inserted += len(params)
            logger.info(
                "Inserted batch of %d (embed=%.2fs, total inserted=%d)",
                len(params),
                embed_secs,
                inserted,
            )

    return inserted


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------


def run(
    csv_path: Path,
    *,
    limit: int | None = None,
    download: bool = False,
    embed_batch_size: int = EMBED_BATCH_SIZE,
) -> dict:
    if download:
        csv_path = download_corpus(csv_path.parent)

    rows = load_corpus(csv_path)
    if limit is not None:
        rows = rows[:limit]
        logger.info("Limiting ingestion to first %d rows", len(rows))

    records = list(build_records(rows))
    logger.info("Built %d candidate chunks across %d reports", len(records), len(rows))

    new_records = filter_existing(records)
    logger.info("%d chunks need embedding + insertion", len(new_records))

    inserted = embed_and_insert(new_records, embed_batch_size=embed_batch_size)
    logger.info("Done. Reports=%d Chunks=%d Inserted=%d", len(rows), len(records), inserted)
    return {
        "reports": len(rows),
        "chunks": len(records),
        "inserted": inserted,
        "skipped_existing": len(records) - len(new_records),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--csv",
        type=Path,
        default=DEFAULT_CSV_PATH,
        help=f"Path to mtsamples.csv (default: {DEFAULT_CSV_PATH})",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Only ingest the first N reports (useful for testing).",
    )
    parser.add_argument(
        "--download",
        action="store_true",
        help="Download the corpus via kagglehub before ingesting.",
    )
    parser.add_argument(
        "--embed-batch-size",
        type=int,
        default=EMBED_BATCH_SIZE,
        help=f"Number of texts per Voyage call (default: {EMBED_BATCH_SIZE}).",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        help="Python log level (default: INFO).",
    )
    args = parser.parse_args()

    logging.basicConfig(
        level=args.log_level.upper(),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

    summary = run(
        args.csv,
        limit=args.limit,
        download=args.download,
        embed_batch_size=args.embed_batch_size,
    )
    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
