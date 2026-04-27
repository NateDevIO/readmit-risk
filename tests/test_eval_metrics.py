"""Unit tests for the retrieval evaluation metrics."""

import pytest

from evals.retrieval.metrics import (
    aggregate,
    irrelevant_violations,
    precision_at_k,
    recall_at_k,
    reciprocal_rank,
)


# ---------------------------------------------------------------------------
# precision@k
# ---------------------------------------------------------------------------


class TestPrecisionAtK:
    def test_all_relevant_in_top_k(self):
        retrieved = ["a", "b", "c", "d", "e"]
        assert precision_at_k(retrieved, {"a", "b", "c"}, k=3) == pytest.approx(1.0)

    def test_no_relevant_in_top_k(self):
        retrieved = ["x", "y", "z"]
        assert precision_at_k(retrieved, {"a", "b"}, k=3) == 0.0

    def test_partial_relevant_in_top_k(self):
        retrieved = ["a", "x", "b", "y", "c"]
        # 3 of top-5 are relevant.
        assert precision_at_k(retrieved, {"a", "b", "c"}, k=5) == pytest.approx(0.6)

    def test_fewer_results_than_k_still_divides_by_k(self):
        retrieved = ["a", "b"]  # only 2 results returned
        # 2 hits out of k=5 slots → 0.4, not 1.0.
        assert precision_at_k(retrieved, {"a", "b"}, k=5) == pytest.approx(0.4)

    def test_zero_k_returns_zero(self):
        assert precision_at_k(["a", "b"], {"a"}, k=0) == 0.0

    def test_negative_k_returns_zero(self):
        assert precision_at_k(["a", "b"], {"a"}, k=-3) == 0.0

    def test_empty_retrieved_returns_zero(self):
        assert precision_at_k([], {"a", "b"}, k=5) == 0.0


# ---------------------------------------------------------------------------
# recall@k
# ---------------------------------------------------------------------------


class TestRecallAtK:
    def test_all_relevant_in_top_k(self):
        retrieved = ["a", "b", "c", "d", "e"]
        assert recall_at_k(retrieved, {"a", "b", "c"}, k=5) == pytest.approx(1.0)

    def test_no_relevant_in_top_k(self):
        assert recall_at_k(["x", "y"], {"a"}, k=5) == 0.0

    def test_partial_relevant(self):
        retrieved = ["a", "x", "b"]
        # 2 of 3 expected relevant items in top-5.
        assert recall_at_k(retrieved, {"a", "b", "c"}, k=5) == pytest.approx(2 / 3)

    def test_no_relevant_items_returns_zero(self):
        # Treating an out-of-scope question as 0, not 1.
        assert recall_at_k(["a", "b"], set(), k=5) == 0.0

    def test_zero_k_returns_zero(self):
        assert recall_at_k(["a"], {"a"}, k=0) == 0.0


# ---------------------------------------------------------------------------
# reciprocal rank
# ---------------------------------------------------------------------------


class TestReciprocalRank:
    def test_first_position_is_one(self):
        assert reciprocal_rank(["a", "b", "c"], {"a"}) == pytest.approx(1.0)

    def test_second_position_is_half(self):
        assert reciprocal_rank(["x", "a", "b"], {"a"}) == pytest.approx(0.5)

    def test_fifth_position(self):
        assert reciprocal_rank(["x", "y", "z", "w", "a"], {"a"}) == pytest.approx(0.2)

    def test_no_relevant_returns_zero(self):
        assert reciprocal_rank(["x", "y", "z"], {"a"}) == 0.0

    def test_uses_first_relevant_only(self):
        # Both 'a' (rank 1) and 'b' (rank 3) are relevant — RR is from the first.
        assert reciprocal_rank(["a", "x", "b"], {"a", "b"}) == pytest.approx(1.0)

    def test_empty_retrieved_returns_zero(self):
        assert reciprocal_rank([], {"a"}) == 0.0


# ---------------------------------------------------------------------------
# irrelevant violations
# ---------------------------------------------------------------------------


class TestIrrelevantViolations:
    def test_counts_flagged_items_in_top_k(self):
        retrieved = ["a", "bad1", "b", "bad2", "c"]
        assert irrelevant_violations(retrieved, {"bad1", "bad2"}, k=5) == 2

    def test_ignores_flagged_items_outside_top_k(self):
        retrieved = ["a", "b", "c", "d", "e", "bad1"]
        assert irrelevant_violations(retrieved, {"bad1"}, k=5) == 0

    def test_no_irrelevant_set_returns_zero(self):
        assert irrelevant_violations(["a", "b"], set(), k=5) == 0

    def test_zero_k_returns_zero(self):
        assert irrelevant_violations(["bad1", "bad2"], {"bad1"}, k=0) == 0


# ---------------------------------------------------------------------------
# aggregate
# ---------------------------------------------------------------------------


class TestAggregate:
    def test_simple_mean(self):
        assert aggregate([0.5, 1.0, 0.0]) == pytest.approx(0.5)

    def test_empty_returns_zero(self):
        assert aggregate([]) == 0.0

    def test_single_value(self):
        assert aggregate([0.42]) == pytest.approx(0.42)
