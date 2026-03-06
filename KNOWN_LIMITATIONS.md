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
- **UCI predict_risk uses 9 features** (age, time in hospital, medications, diagnoses, prior visits, lab procedures, procedures). The full pre-computed model uses 70 features (12 numeric + 58 one-hot categoricals).
- **MIMIC predict_risk uses 18 features** (age, medications, procedures, plus lab values and clinical flags via `additional_features`). MIMIC predictions improve significantly when clinical data is provided.

## Cross-Dataset Comparisons

- The two datasets use **different algorithms** (LogisticRegression for UCI pre-computed, GradientBoosting for MIMIC pre-computed) and **different feature sets** (diabetes-specific vs. ICU clinical data). Direct score comparisons across datasets should be interpreted with caution.
- UCI represents a diabetes outpatient population (8.8% readmission rate); MIMIC represents a general hospital/ICU population (20.5% readmission rate). The populations are fundamentally different.
- UCI avg risk score (~26) is much lower than MIMIC (~61) because most UCI diabetes patients are low-risk, while MIMIC's post-processed scores spread across a wider range.
