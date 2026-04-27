"""Retrieval evaluation harness for the ReadmitRisk RAG corpus.

Two modes:

  --seed [-n N]
      Sample ``N`` (default 5) diverse reports across medical
      specialties from the live ``clinical_notes`` table and write a
      DRAFT yaml file with their chunks visible. Use the output as
      scaffolding when authoring or refreshing ``questions.yaml``.

  default
      Load ``questions.yaml``, call ``search_chunks(query, k=10)`` for
      each entry, compute precision@5 / recall@5 / MRR per question,
      aggregate by category and overall, and write a timestamped
      markdown report under ``evals/retrieval/reports/``.

Usage::

    # 1. (One time) generate a seed file from your live corpus:
    python evals/retrieval/run_eval.py --seed -n 5 -o questions_seed.yaml

    # 2. Author or update questions.yaml using the seed as reference.

    # 3. Run the eval (writes a timestamped report):
    python evals/retrieval/run_eval.py

Environment:
    DATABASE_URL    pgvector-enabled Postgres (same as the MCP server).
    VOYAGE_API_KEY  Voyage API key for query embedding.
"""

from __future__ import annotations

import argparse
import json
import logging
import statistics
import sys
import time
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml

# Ensure project root is importable when this script is invoked directly.
ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from evals.retrieval.metrics import (  # noqa: E402
    aggregate,
    irrelevant_violations,
    precision_at_k,
    recall_at_k,
    reciprocal_rank,
)

logger = logging.getLogger(__name__)

QUESTIONS_PATH = Path(__file__).parent / "questions.yaml"
REPORTS_DIR = Path(__file__).parent / "reports"
DEFAULT_K = 10
TOP_K_FOR_PRECISION_RECALL = 5
VALID_CATEGORIES = {"factual", "comparative", "case_similarity", "edge_case"}


# ---------------------------------------------------------------------------
# Question set loading + validation
# ---------------------------------------------------------------------------


def load_questions(path: Path) -> list[dict[str, Any]]:
    """Load and validate the questions.yaml file. Raises on bad shape."""
    with path.open(encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    questions = data.get("questions") or []
    if not isinstance(questions, list) or not questions:
        raise SystemExit(f"{path} contains no questions")

    for i, q in enumerate(questions):
        if not isinstance(q, dict):
            raise SystemExit(f"Question {i}: must be a mapping")
        if not q.get("question"):
            raise SystemExit(f"Question {i}: missing 'question' field")
        if q.get("category") not in VALID_CATEGORIES:
            raise SystemExit(
                f"Question {i}: category must be one of {sorted(VALID_CATEGORIES)}"
            )
        rel = q.get("expected_relevant_source_ids", [])
        irr = q.get("expected_irrelevant_source_ids", [])
        if not isinstance(rel, list) or not isinstance(irr, list):
            raise SystemExit(f"Question {i}: source-id lists must be lists")

    return questions


# ---------------------------------------------------------------------------
# Eval mode
# ---------------------------------------------------------------------------


def evaluate(
    questions: list[dict[str, Any]],
    k: int = DEFAULT_K,
    cutoff: int = TOP_K_FOR_PRECISION_RECALL,
) -> dict[str, Any]:
    """Run search_chunks for every question, compute per-question metrics."""
    # Imported lazily so --seed mode doesn't need the embeddings stack.
    from mcp_server.retrieval import search_chunks  # noqa: E402

    rows: list[dict[str, Any]] = []
    for q in questions:
        relevant = q.get("expected_relevant_source_ids", [])
        irrelevant = q.get("expected_irrelevant_source_ids", [])

        t0 = time.perf_counter()
        results = search_chunks(q["question"], k=k)
        latency = time.perf_counter() - t0

        retrieved_ids = [r["source_id"] for r in results]
        rows.append({
            "id": q.get("id"),
            "question": q["question"],
            "category": q["category"],
            "expected_relevant": list(relevant),
            "expected_irrelevant": list(irrelevant),
            "retrieved": retrieved_ids,
            "top_results_preview": [
                {
                    "source_id": r["source_id"],
                    "sample_name": (r.get("metadata") or {}).get("sample_name"),
                    "similarity": r.get("similarity"),
                }
                for r in results[:cutoff]
            ],
            "precision_at_k": precision_at_k(retrieved_ids, relevant, k=cutoff),
            "recall_at_k": recall_at_k(retrieved_ids, relevant, k=cutoff),
            "reciprocal_rank": reciprocal_rank(retrieved_ids, relevant),
            "irrelevant_violations": irrelevant_violations(
                retrieved_ids, irrelevant, k=cutoff
            ),
            "latency_seconds": latency,
        })

    by_category: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        by_category[row["category"]].append(row)

    summary = {
        "k": k,
        "cutoff": cutoff,
        "question_count": len(rows),
        "overall": _summarise(rows),
        "by_category": {
            cat: _summarise(items) for cat, items in by_category.items()
        },
        "rows": rows,
    }
    return summary


def _summarise(rows: list[dict[str, Any]]) -> dict[str, float | int]:
    return {
        "n": len(rows),
        "precision_at_k": aggregate(r["precision_at_k"] for r in rows),
        "recall_at_k": aggregate(r["recall_at_k"] for r in rows),
        "mrr": aggregate(r["reciprocal_rank"] for r in rows),
        "irrelevant_violations": sum(r["irrelevant_violations"] for r in rows),
        "avg_latency_seconds": aggregate(r["latency_seconds"] for r in rows),
    }


# ---------------------------------------------------------------------------
# Markdown report writer
# ---------------------------------------------------------------------------


def render_report(summary: dict[str, Any]) -> str:
    """Render the eval summary as a markdown report."""
    lines: list[str] = []
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    lines.append(f"# Retrieval Eval Report — {ts}")
    lines.append("")
    lines.append(
        f"`k={summary['k']}` retrieved per question; precision/recall reported "
        f"at top-{summary['cutoff']}."
    )
    lines.append("")

    lines.append("## Overall")
    lines.append("")
    lines.append(_metrics_table(summary["overall"]))
    lines.append("")

    lines.append("## By category")
    lines.append("")
    lines.append("| Category | N | P@{0} | R@{0} | MRR | Irrelevant hits | Avg latency (s) |".format(summary["cutoff"]))
    lines.append("|---|---:|---:|---:|---:|---:|---:|")
    for cat in sorted(summary["by_category"]):
        m = summary["by_category"][cat]
        lines.append(
            f"| {cat} | {m['n']} | {m['precision_at_k']:.3f} | "
            f"{m['recall_at_k']:.3f} | {m['mrr']:.3f} | "
            f"{m['irrelevant_violations']} | {m['avg_latency_seconds']:.3f} |"
        )
    lines.append("")

    lines.append("## Per-question results")
    lines.append("")
    for row in summary["rows"]:
        ident = row.get("id") or "(no id)"
        lines.append(f"### {ident} — {row['category']}")
        lines.append("")
        lines.append(f"> {row['question']}")
        lines.append("")
        lines.append(
            f"- **P@{summary['cutoff']}**: {row['precision_at_k']:.3f}  "
            f"**R@{summary['cutoff']}**: {row['recall_at_k']:.3f}  "
            f"**RR**: {row['reciprocal_rank']:.3f}  "
            f"**Latency**: {row['latency_seconds']:.3f}s"
        )
        if row["expected_relevant"]:
            lines.append(
                f"- Expected relevant: `{', '.join(row['expected_relevant'])}`"
            )
        if row["irrelevant_violations"]:
            lines.append(
                f"- ⚠️ {row['irrelevant_violations']} irrelevant item(s) "
                f"in top-{summary['cutoff']}"
            )
        lines.append("")
        lines.append(f"**Top {summary['cutoff']} retrieved:**")
        lines.append("")
        for i, hit in enumerate(row["top_results_preview"], start=1):
            sim = hit.get("similarity")
            sim_str = f"{sim:.3f}" if isinstance(sim, (int, float)) else "—"
            mark = " ✅" if hit["source_id"] in row["expected_relevant"] else ""
            sample = hit.get("sample_name") or ""
            lines.append(
                f"{i}. `{hit['source_id']}` · {sample} · sim={sim_str}{mark}"
            )
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def _metrics_table(m: dict[str, float | int]) -> str:
    return (
        "| Metric | Value |\n"
        "|---|---:|\n"
        f"| Questions | {m['n']} |\n"
        f"| Precision@5 | {m['precision_at_k']:.3f} |\n"
        f"| Recall@5 | {m['recall_at_k']:.3f} |\n"
        f"| MRR | {m['mrr']:.3f} |\n"
        f"| Irrelevant hits in top-5 (total) | {m['irrelevant_violations']} |\n"
        f"| Avg latency (seconds) | {m['avg_latency_seconds']:.3f} |"
    )


def write_report(summary: dict[str, Any]) -> Path:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    path = REPORTS_DIR / f"{stamp}.md"
    path.write_text(render_report(summary), encoding="utf-8")
    return path


# ---------------------------------------------------------------------------
# Seed mode (DB sampling for question authoring)
# ---------------------------------------------------------------------------


_SEED_PICK_SQL = """
WITH ranked AS (
    SELECT
        metadata->>'sample_name'        AS sample_name,
        metadata->>'medical_specialty'  AS medical_specialty,
        COUNT(*) AS chunk_count,
        ROW_NUMBER() OVER (
            PARTITION BY metadata->>'medical_specialty'
            ORDER BY RANDOM()
        ) AS rn
    FROM clinical_notes
    WHERE metadata->>'sample_name' IS NOT NULL
    GROUP BY metadata->>'sample_name', metadata->>'medical_specialty'
    HAVING COUNT(*) >= 2
)
SELECT sample_name, medical_specialty, chunk_count
FROM ranked
WHERE rn = 1
ORDER BY RANDOM()
LIMIT %s
"""

_SEED_CHUNKS_SQL = """
SELECT source_id, note_type, content, metadata
FROM clinical_notes
WHERE metadata->>'sample_name' = %s
ORDER BY (metadata->>'chunk_index')::int NULLS LAST, source_id
"""


def seed_draft(n: int, output_path: Path) -> None:
    """Pick ``n`` diverse reports from the live DB and write a draft yaml."""
    from mcp_server.db import connect  # noqa: E402

    with connect() as conn, conn.cursor() as cur:
        cur.execute(_SEED_PICK_SQL, (n,))
        picked = cur.fetchall()
        if not picked:
            raise SystemExit("No reports found in clinical_notes — has ingestion run?")

        reports: list[dict[str, Any]] = []
        for sample_name, specialty, chunk_count in picked:
            cur.execute(_SEED_CHUNKS_SQL, (sample_name,))
            chunks = [
                {
                    "source_id": row[0],
                    "note_type": row[1],
                    "content_preview": (row[2] or "")[:240],
                    "chunk_index": (row[3] or {}).get("chunk_index"),
                    "soap_section": (row[3] or {}).get("soap_section"),
                }
                for row in cur.fetchall()
            ]
            reports.append({
                "sample_name": sample_name,
                "medical_specialty": specialty,
                "chunk_count": chunk_count,
                "chunks": chunks,
            })

    payload = {
        "_note": (
            "Draft generated by run_eval.py --seed. Use these reports as "
            "reference material when authoring entries in questions.yaml. "
            "This file is NOT consumed by the eval — questions.yaml is."
        ),
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "reports": reports,
    }
    output_path.write_text(
        yaml.safe_dump(payload, sort_keys=False, allow_unicode=True),
        encoding="utf-8",
    )


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--seed",
        action="store_true",
        help="Sample diverse reports and write a draft yaml; do not run eval.",
    )
    parser.add_argument(
        "-n",
        "--num-reports",
        type=int,
        default=5,
        help="Number of reports to seed (default 5). Ignored without --seed.",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path(__file__).parent / "questions_seed.yaml",
        help="Path for the seed yaml (only used with --seed).",
    )
    parser.add_argument(
        "-q",
        "--questions",
        type=Path,
        default=QUESTIONS_PATH,
        help="Path to the questions yaml (default evals/retrieval/questions.yaml).",
    )
    parser.add_argument(
        "-k",
        type=int,
        default=DEFAULT_K,
        help=f"Top-k results to retrieve per question (default {DEFAULT_K}).",
    )
    parser.add_argument(
        "--cutoff",
        type=int,
        default=TOP_K_FOR_PRECISION_RECALL,
        help=(
            f"Slice for precision/recall (default {TOP_K_FOR_PRECISION_RECALL})."
        ),
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        help="Log level (default INFO).",
    )
    args = parser.parse_args()

    logging.basicConfig(
        level=args.log_level.upper(),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

    if args.seed:
        seed_draft(args.num_reports, args.output)
        print(f"Wrote seed draft → {args.output}")
        return 0

    questions = load_questions(args.questions)
    summary = evaluate(questions, k=args.k, cutoff=args.cutoff)
    path = write_report(summary)
    overall = summary["overall"]
    print(
        f"Wrote {path}\n"
        f"  Questions: {overall['n']}\n"
        f"  P@{args.cutoff}: {overall['precision_at_k']:.3f}\n"
        f"  R@{args.cutoff}: {overall['recall_at_k']:.3f}\n"
        f"  MRR:    {overall['mrr']:.3f}\n"
        f"  Irrelevant hits: {overall['irrelevant_violations']}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
