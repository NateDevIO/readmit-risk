# Known Limitations

## Data Quality

### UCI Diabetes Dataset
- **Age is approximate.** The original dataset encodes age as decade buckets (`[0-10)`, `[10-20)`, etc.). These are decoded to bucket midpoints (5, 15, 25, ..., 95), so age as a continuous feature is approximate — especially for younger patients where a 10-year range is significant.
- **Readmission label is coarse.** The target variable distinguishes `<30` days, `>30` days, and `NO` readmission. Only `<30` is treated as positive, but the exact timing within 30 days is unknown.

### MIMIC-IV Dataset
- **Risk scores were post-processed.** Pre-computed MIMIC scores were transformed using percentile ranking, power scaling, and readmission-outcome boosting to spread an originally narrow distribution. This makes the scores useful for ranking but not directly interpretable as readmission probabilities.

## Model Performance

| Dataset | Algorithm (pre-computed) | Algorithm (predict_risk) | AUC |
|---------|-------------------------|--------------------------|------|
| UCI     | LogisticRegression + SMOTE | GradientBoosting (numeric-only) | 0.56 |
| MIMIC   | GradientBoosting + SMOTE | GradientBoosting (numeric-only) | 0.63 |

- **UCI AUC is 0.56** — barely above random (0.50). Risk tiers are useful for relative ranking within the dataset but should not be interpreted as clinically validated predictions.
- **MIMIC AUC is 0.63** — better but still modest. Readmission prediction is inherently difficult due to the many social and behavioral factors not captured in clinical data.
- Both models were trained with SMOTE oversampling for the pre-computed scores, which inflates predicted probabilities. The `predict_risk` tool uses models trained without SMOTE and applies quantile mapping to normalize outputs to the stored-score scale.

## predict_risk vs. Stored Scores

The `predict_risk` tool uses a **separate, numeric-only model** trained on the subset of features available as tool parameters. Pre-computed patient risk scores (returned by `get_patient_risk_score`) use a full-feature model including categorical variables like discharge disposition, admission type, race, and gender.

Because of this:
- **Scores are approximate.** A live prediction for the same patient may not exactly match their stored risk score. The quantile mapping ensures outputs are on the same scale and distribution, but the underlying model is different.
- **Expected score gap is 10-20 points** for some patients, because the stored scores are driven primarily by categorical features (discharge disposition, admission type, etc.) that the live model cannot access. Tier classification (Low / Moderate / High / Very High / Critical) is consistent across both tools; exact numeric scores may vary.
- **UCI predict_risk uses 9 features** (age, time in hospital, medications, diagnoses, prior visits, lab procedures, procedures). The full pre-computed model uses 70 features (12 numeric + 58 one-hot categoricals). The categorical features account for ~89% of the full model's predictive importance — this is the primary source of the score gap.
- **MIMIC predict_risk uses 18 features** (age, medications, procedures, plus lab values and clinical flags via `additional_features`). MIMIC predictions improve significantly when clinical data is provided.
- **For the most authoritative score on an existing patient, use `get_patient_risk_score`**, which returns the pre-computed full-model score. Use `predict_risk` for hypothetical scenarios or patients not in the dataset.

## Cross-Dataset Comparisons

- The two datasets use **different algorithms** (LogisticRegression for UCI pre-computed, GradientBoosting for MIMIC pre-computed) and **different feature sets** (diabetes-specific vs. ICU clinical data). Direct score comparisons across datasets should be interpreted with caution.
- UCI represents a diabetes outpatient population (8.8% readmission rate); MIMIC represents a general hospital/ICU population (20.5% readmission rate). The populations are fundamentally different.
- UCI avg risk score (~26) is much lower than MIMIC (~61) because most UCI diabetes patients are low-risk, while MIMIC's post-processed scores spread across a wider range.


## Chunking limitations (Phase 2)

The chunker has a SOAP-aware path that activates when 2+ distinct
SOAP markers (Subjective, Objective, Assessment, Plan) are detected
in a report. On the MTSamples corpus this path did not activate for
any of 4,966 reports because MTSamples uses semantic section headers
(PAST MEDICAL HISTORY, PHYSICAL EXAMINATION, ASSESSMENT, PLAN, etc.)
rather than strict S/O/A/P labels.

All 10,287 chunks went through the recursive character-based fallback
chunker. This works but loses semantic section information that could
improve retrieval precision and enable section-filtered queries.

Planned Phase 6 improvement: extend section detection to recognize
MTSamples' conventional headers, with measurement against the Phase 5
eval baseline to validate the improvement.


## Deployment — Railway monorepo config (Phase 5)

The `chat_api` Railway service fails to use `chat_api/Dockerfile`
despite a per-service `chat_api/railway.json`. The root-level
`railway.json` (used for the MCP server build) ends up taking
precedence in monorepo mode, so deploys for `chat_api` don't pick
up changes made there.

This is an infrastructure-config conflict, not an application bug.
The production `chat_api` is therefore pinned to the Phase 4 image,
which is feature-complete for RAG citations — the system prompt
update, `_process_rag_result` helper, citations SSE event, and
frontend Sources block all live in that build. Phase 5 did not
modify `chat_api/`, so production behaviour is unaffected.

Fix is non-urgent infrastructure cleanup (root vs per-service
config precedence, possibly switching to Railway's "monorepo with
service root directories" setting), not application logic. Defer
until a future infra pass.