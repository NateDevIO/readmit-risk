# Retrieval Setup — Methodology and Baseline

This document records what the RAG pipeline looks like *right now* and
how we measure its quality. It's the reference point against which any
future change is compared.

## System under test

| Component | Configuration |
|---|---|
| Corpus | MTSamples (~5K transcribed clinical notes; ~10K chunks ingested into `clinical_notes`) |
| Chunking | Recursive character splitter — paragraph → sentence → hard-wrap. Target ~500 tokens (~2000 chars), ~50-token overlap. |
| SOAP-aware path | Implemented in `mcp_server/chunking.py` but **did not activate on the MTSamples corpus** — the source transcriptions don't use the strict `SUBJECTIVE:` / `OBJECTIVE:` / `ASSESSMENT:` / `PLAN:` line-anchored markers we detect. |
| Embedding model | Voyage `voyage-3-lite` — 512 dim, fixed dimension. |
| Vector index | pgvector HNSW with `vector_cosine_ops`. |
| Retrieval | `mcp_server.retrieval.search_chunks` — single-stage cosine ANN, no re-ranker. |
| Cosine distance operator | `<=>` ; similarity reported as `1 - distance`. |

## What "production credibility" means here

We commit metrics, not vibes. The eval harness in this directory
exists so that:

- We can prove the retrieval system works *before* a Claude wrapper
  rationalises away poor recall.
- Any future change to the pipeline must justify itself with a
  before/after comparison on the same question set.
- New failure modes (e.g. a category whose recall collapsed) are
  visible and tracked, not invisible until a user complains.

## Baseline metrics

Committed baseline as of **2026-04-27**. Run on the live Supabase
corpus after the source_id dedup fix landed in `search_chunks` and
`search_similar_reports` (see *Eval-driven improvements* below for the
pre-fix run that surfaced the bug).

| Slice | N | P@5 | R@5 | MRR |
|---|---:|---:|---:|---:|
| **Overall** | 20 | **0.290** | **0.492** | **0.613** |
| factual | 11 | 0.382 | 0.591 | 0.727 |
| case_similarity | 4 | 0.300 | 0.583 | 0.812 |
| comparative | 2 | 0.200 | 0.500 | 0.500 |
| edge_case | 3 | 0.000 | 0.000 | 0.000 |

- **Irrelevant hits in top-5 (total): 0** — no question with an
  ``expected_irrelevant_source_ids`` list saw any of those flagged
  chunks in its top-5.
- **Average latency per question: 1.325 s** (embed + cosine ANN over
  ~10K rows on Supabase Session Pooler — most of this is the Voyage
  embed call, not the SQL).
- The `edge_case` row is by design — those questions have empty
  ``expected_relevant_source_ids``. We track them via the irrelevant-
  hit counter, not via P@5/R@5/MRR.

## Eval-driven improvements

This section is the receipt that the harness pays for itself.

The first eval run produced **P@5 0.080 / Recall@5 0.200 / MRR 0.141**
— much worse than expected for a corpus this small and a question set
authored against verified-existing reports. Investigation showed that
MTSamples ingestion had created multiple rows per chunk (one per
medical_specialty value, for samples that span specialties), and
`search_chunks` ranked rows by similarity without deduplicating. The
same `source_id` appeared 2-4 times in top-k results, eating slots
that should have held other relevant chunks.

The fix was small and surgical:

- `search_chunks` now over-fetches `k * 4` (capped at 80) candidate
  rows, then dedupes by `source_id` in Python — the first occurrence
  of any source_id is its highest-similarity row because the cursor
  delivers sorted-DESC, so first-write-wins is correct.
- `search_similar_reports` already deduped at the report level (by
  `sample_name`); added per-sample `seen_chunks` tracking so the
  `matching_chunks` list within each report no longer carries
  duplicate source_ids either.
- `tests/test_retrieval.py` gained a `DUPLICATED_ROWS` fixture and 5
  tests pinning the dedup contract (collapse, highest-similarity
  retained, k respected, no dupes inside `matching_chunks`).

| Metric | Pre-fix | Post-fix | Change |
|---|---:|---:|---:|
| Precision@5 | 0.080 | 0.290 | **3.6×** |
| Recall@5    | 0.200 | 0.492 | **2.5×** |
| MRR         | 0.141 | 0.613 | **4.3×** |
| Edge-case violations | 0 | 0 | unchanged |

The lesson: the eval harness paid for itself on its first run by
surfacing this bug before any production user saw degraded results.
This is exactly the workflow we want to repeat on every future change
to the pipeline.

Latency is reported per-question in the markdown report; overall
average sits at **~1.3 s on Supabase Session Pooler** (embed + ANN
over ~10K rows). The Voyage embed call dominates — the SQL itself is
fast.

## Known weaknesses (hypotheses)

Each weakness lists what we expect to see, *why* we expect it, and the
intervention most likely to move the needle. None of these are
implemented yet — they're the queue for Phase 5+ improvements.

### 1. Recall on `case_similarity` queries

- **Why we expect it**: case-similarity queries are long, multi-clause
  natural-language descriptions; the best chunk for "65-year-old male
  with substernal chest pain radiating to left arm" might be one
  sentence buried in a longer transcription that cosine ANN can't
  pull out reliably.
- **Likely fix**: hybrid retrieval — combine cosine ANN with a sparse
  BM25/tsvector pass, take the union, re-rank with Voyage's reranker
  or a cross-encoder. Trades latency for recall.

### 2. Precision on `factual` queries with vocabulary overlap

- **Why we expect it**: factual queries about CABG vs angioplasty,
  STEMI vs NSTEMI, or bacterial vs viral pneumonia share clinical
  vocabulary. Top-5 will pull chunks from the wrong report.
- **Likely fix**: per-result LLM judge ("does this chunk actually
  answer the query?") OR a small cross-encoder trained on clinical
  text. The judge approach is cheaper to ship; the cross-encoder is
  faster at query time once trained.

### 3. False positives on `edge_case` out-of-domain queries

- **Why we expect it**: cosine similarity always returns *something*
  — there's no built-in "no good answer" threshold. Out-of-domain
  queries ("remote work policy", "Postgres connection pool") will
  surface unrelated clinical chunks with low-but-nonzero similarity.
- **Likely fix**: a similarity floor (e.g. drop hits below 0.3 cosine
  similarity) + an explicit "no relevant documentation found" branch
  in the MCP tool. The floor needs tuning against the eval to avoid
  killing legitimate low-confidence retrievals.

### 4. SOAP-aware chunking unused

- **Why we expect it**: as noted above, MTSamples transcriptions
  rarely emit the strict line-anchored SOAP markers our detector
  needs, so all chunks come from the recursive fallback. Section
  context (e.g. "this chunk is from the Plan section") is therefore
  not available as a metadata filter or as a citation field.
- **Likely fix**: relax the SOAP detector (accept "S:", "O:", "A:",
  "P:" abbreviations + section-header variants like "ASSESSMENT/PLAN");
  alternately, train a small classifier that tags chunks with their
  inferred section. Worth it only if a downstream feature actually
  uses the section metadata.

### 5. No re-ranking

- **Why we expect it**: single-stage cosine ANN consistently
  under-performs cosine-then-rerank pipelines on benchmark RAG
  evals. Voyage ships `rerank-2.5` for exactly this.
- **Likely fix**: pull k=20 from the index, rerank to top-5 with
  `voyage.rerank()`. Cost is one extra Voyage API call per query;
  expected lift is largest on `comparative` and `case_similarity`.

### 6. HIV-related queries score zero (post-baseline observation)

- **Observed in the 2026-04-27 baseline**: q08 ("What problems are
  tracked at a routine HIV followup appointment?") and q10 ("How
  does HIV management differ from other chronic disease followups?")
  both scored `P@5 = R@5 = MRR = 0`. The top-5 retrieved for each
  was dominated by *other* chronic disease followups (Proctitis,
  CKD, Psych) — the embedding model is selecting on "chronic disease
  followup" generally rather than "HIV" specifically.
- **Why**: voyage-3-lite is trained for general semantic similarity,
  not clinical specificity. Topical descriptors ("chronic disease
  management") swamp domain-specific tokens ("HIV") when both occur
  in the query.
- **Likely fix**: hybrid retrieval — combine cosine ANN with a
  BM25/tsvector pass that gives keyword precision on tokens like
  "HIV", "antiretroviral", etc. Take the union, then rerank. This
  is the same intervention that fixes weakness #1, with HIV-style
  queries as the strongest motivating case.

### 7. Comparative category is too small to draw conclusions

- **Observed in the 2026-04-27 baseline**: only 2 of 20 questions are
  `comparative` (q10 and q14). The category-level metrics for
  comparative (P@5 0.200, R@5 0.500, MRR 0.500) are noisy at that
  N and shouldn't be read as a real signal.
- **Likely fix**: bring the comparative count to 5+ in the next
  question-set iteration. Author against pairs of reports that share
  vocabulary but differ on a meaningful axis (e.g. STEMI vs NSTEMI,
  community-acquired vs hospital-acquired pneumonia, type 1 vs type
  2 diabetes management).

## Notes for future runs

- The runner depends on `mcp_server.retrieval.search_chunks` directly
  rather than the live MCP server, so eval results are independent of
  the FastAPI proxy and the chat widget. If those layers degrade
  retrieval quality (e.g. by truncating queries), they need their
  own integration tests.
- Reports are timestamped UTC and committed to `reports/` as
  gitignored artifacts. Pin specific reports to a PR description
  rather than relying on git history.
