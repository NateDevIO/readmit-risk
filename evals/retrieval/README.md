# Retrieval Evaluation Harness

This directory holds the offline retrieval-quality eval that gates any
future change to the RAG pipeline (chunking, embedding model, search
SQL, re-ranking). If a change can't show up favourably here, it doesn't
ship.

```
evals/retrieval/
├── questions.yaml      # The labelled question set (committed)
├── run_eval.py         # The runner: --seed and default eval modes
├── metrics.py          # Pure functions: precision@k, recall@k, MRR
├── README.md           # This file
├── SETUP.md            # Methodology + baseline metrics + weakness log
└── reports/            # Timestamped markdown reports (gitignored)
```

## Quick start

```bash
# 1. (One time per refresh) seed candidate reports from the live corpus.
python evals/retrieval/run_eval.py --seed -n 5 -o questions_seed.yaml

# 2. Author / update questions.yaml using the seed file as reference.
#    Each entry needs: id, category, question, expected_relevant_source_ids.

# 3. Run the eval. Writes a timestamped markdown report under reports/.
python evals/retrieval/run_eval.py
```

Required env: `DATABASE_URL` (Supabase pgvector connection) and
`VOYAGE_API_KEY` (same one used by the MCP server). The runner imports
`mcp_server.retrieval.search_chunks`, so you need the project root on
your `PYTHONPATH` (running from the repo root handles this).

## Question schema

```yaml
questions:
  - id: q05
    category: factual              # factual | comparative | case_similarity | edge_case
    question: "What workup is performed for substernal chest pain?"
    expected_relevant_source_ids:
      - mtsamples_chest-pain_chunk_0
      - mtsamples_chest-pain_chunk_1
    expected_irrelevant_source_ids: []   # optional
```

### Categories

| Category | Use when… |
|---|---|
| `factual` | The answer lives in one specific report; we can name the chunks that should match. |
| `comparative` | The question contrasts two concepts; relevant chunks may span multiple reports. |
| `case_similarity` | The question describes a patient/scenario; relevance is "reports about clinically similar cases". |
| `edge_case` | No clean answer (out-of-domain query, multiple equally-good matches, ambiguous phrasing). Used to surface false-positive failure modes. |

### Adding a new question

1. Run `--seed` to pull a fresh set of candidate reports.
2. Pick one from the seed file; copy two or three of its `source_id`s
   into `expected_relevant_source_ids`.
3. Author a question whose answer lives in those chunks. Be concrete —
   "How is HIT diagnosed?" beats "Tell me about heparin".
4. Add an `id` (use the next free `qNN`) and a `category`.
5. Re-run the eval. Compare the report under `reports/` to the most
   recent baseline before committing.

## Metrics

For each question we retrieve top-`k` (default 10) and report:

- **Precision@5** — fraction of top-5 results that are in
  `expected_relevant_source_ids`. Standard P@k convention: divides by
  5 even when fewer than 5 items came back, so a system that returned
  3 results and got all 3 right scores 0.6.
- **Recall@5** — fraction of `expected_relevant_source_ids` that show
  up in the top-5. Returns 0 when the question has no expected
  relevants (out-of-scope edge cases) — this is intentional; we use
  precision and irrelevant-violation counts to grade those.
- **MRR** — reciprocal rank of the *first* relevant hit anywhere in
  the top-`k`. 0 if none.
- **Irrelevant violations** — count of `expected_irrelevant_source_ids`
  that landed in the top-5. Smell test for surface-similarity false
  positives.
- **Latency** — per-question wall time including embed + SQL.

Reports are aggregated overall and broken out by category, so you can
see which question types regressed before chasing an overall delta.

## Workflow rule

**Any change to the RAG pipeline must include a re-run and a comparison
against the last committed report.** Steps:

1. Note the latest `reports/<timestamp>.md` filename — this is the
   pre-change baseline.
2. Make the change (chunking, embedding model, search SQL, etc.).
3. Re-run `python evals/retrieval/run_eval.py`.
4. Diff the new report against the baseline. Document what moved and
   why in your PR description.
5. If overall metrics regress, you need a clear story for the
   tradeoff (e.g. higher latency in exchange for better recall on
   case-similarity queries) before merging.

`SETUP.md` records the current baseline numbers and our hypotheses for
where the system is weak — read it before proposing a change.
