"""Pure functions for retrieval evaluation metrics.

The runner pulls top-k results from the retrieval system and feeds the
resulting list of ``source_id`` strings into these helpers. Keeping the
math separate makes it trivially unit-testable without touching the DB.

All functions accept:
  - ``retrieved``: ordered list of source_ids from the retrieval system
    (best match first).
  - ``relevant``: set/iterable of source_ids that should be retrieved.

precision@k and recall@k are computed against the top-k slice. MRR is
the reciprocal rank of the FIRST relevant hit anywhere in the full
``retrieved`` list (0 if none).
"""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from statistics import mean


def precision_at_k(retrieved: Sequence[str], relevant: Iterable[str], k: int) -> float:
    """Fraction of top-k retrieved items that are relevant.

    Returns 0.0 when k <= 0. When fewer than k items were retrieved,
    we still divide by k — a system that retrieved 3 results when 5
    were possible and got all 3 right scores 0.6, not 1.0. This is
    the standard P@k convention.
    """
    if k <= 0:
        return 0.0
    relevant_set = set(relevant)
    top_k = retrieved[:k]
    hits = sum(1 for sid in top_k if sid in relevant_set)
    return hits / k


def recall_at_k(retrieved: Sequence[str], relevant: Iterable[str], k: int) -> float:
    """Fraction of relevant items that appear in the top-k.

    Returns 0.0 if there are no relevant items (treating the question
    as out-of-scope rather than perfectly answered).
    """
    relevant_set = set(relevant)
    if not relevant_set:
        return 0.0
    if k <= 0:
        return 0.0
    top_k = set(retrieved[:k])
    return len(top_k & relevant_set) / len(relevant_set)


def reciprocal_rank(retrieved: Sequence[str], relevant: Iterable[str]) -> float:
    """Reciprocal rank of the first relevant hit.

    Returns 1/rank where rank is 1-indexed. 0.0 if no relevant item
    appears anywhere in ``retrieved``.
    """
    relevant_set = set(relevant)
    for i, sid in enumerate(retrieved, start=1):
        if sid in relevant_set:
            return 1.0 / i
    return 0.0


def irrelevant_violations(
    retrieved: Sequence[str], irrelevant: Iterable[str], k: int
) -> int:
    """Count of explicitly-flagged irrelevant items appearing in top-k.

    Used as a quality smell — if your "this should NOT be top of mind"
    items keep showing up, the retriever is confused by surface
    similarity rather than semantic relevance.
    """
    if k <= 0:
        return 0
    bad = set(irrelevant)
    return sum(1 for sid in retrieved[:k] if sid in bad)


def aggregate(values: Iterable[float]) -> float:
    """Mean of a sequence of floats. Returns 0.0 for empty input."""
    seq = list(values)
    return mean(seq) if seq else 0.0
