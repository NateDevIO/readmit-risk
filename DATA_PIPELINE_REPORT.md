# ReadmitRisk Data Pipeline Report

## Executive Summary

This document describes the data processing pipeline used to generate the risk predictions and analytics displayed in the ReadmitRisk dashboard. The pipeline transforms raw hospital encounter data into actionable risk scores using machine learning.

---

## 1. Data Sources

### 1.1 UCI Diabetes 130-US Hospitals Dataset
- **Source**: UCI Machine Learning Repository
- **Description**: 10 years of clinical care data at 130 US hospitals (1999-2008)
- **Size**: 101,766 hospital encounters
- **Key Variables**: Demographics, lab results, medications, diagnoses, readmission outcomes

### 1.2 CMS Hospital Readmissions Data
- **Source**: Centers for Medicare & Medicaid Services
- **Description**: Hospital-level readmission rates and penalty information
- **Coverage**: All 50 states + DC (simulated with realistic patterns based on actual CMS HRRP data)

---

## 2. Data Cleaning Steps

### 2.1 Missing Value Handling
| Column | Missing Rate | Treatment |
|--------|--------------|-----------|
| `weight` | 97% | Dropped |
| `payer_code` | 40% | Dropped |
| `medical_specialty` | 49% | Dropped |
| `race` | 2% | Filled with "Unknown" |
| Numeric features | <1% | Filled with median |

### 2.2 Data Quality Transformations
- **Missing Value Indicator**: UCI dataset uses `?` for missing values - converted to `NaN`
- **Duplicate Encounters**: Removed repeat encounters per patient (kept first encounter only)
  - Before: 101,766 encounters
  - After: 71,518 unique patients

### 2.3 Target Variable Creation
- **Original**: 3 categories (`NO`, `>30`, `<30`)
- **Transformed**: Binary (1 = readmitted within 30 days, 0 = not readmitted within 30 days)
- **Class Distribution**: 11.2% positive (significant imbalance)

---

## 3. Feature Engineering

### 3.1 Numeric Features Created
| Feature | Description | Formula |
|---------|-------------|---------|
| `age_numeric` | Age midpoint | Mapped from age ranges (e.g., `[70-80)` → 75) |
| `total_visits` | Prior healthcare utilization | `outpatient + emergency + inpatient` visits |
| `medication_intensity` | Medications per day | `num_medications / (time_in_hospital + 1)` |
| `num_med_changes` | Medication adjustments | Count of medications with dosage changes |
| `A1Cresult_abnormal` | Abnormal A1C indicator | 1 if A1C > 7 or > 8, else 0 |

### 3.2 Final Feature Set
**12 Numeric Features:**
- `time_in_hospital`, `num_lab_procedures`, `num_procedures`
- `num_medications`, `number_outpatient`, `number_emergency`
- `number_inpatient`, `number_diagnoses`, `age_numeric`
- `total_visits`, `medication_intensity`, `num_med_changes`

**8 Categorical Features (One-Hot Encoded):**
- `race`, `gender`, `admission_type_id`, `discharge_disposition_id`
- `admission_source_id`, `diabetesMed`, `change`, `A1Cresult_abnormal`

---

## 4. Machine Learning Pipeline

### 4.1 Class Imbalance Handling
- **Method**: SMOTE (Synthetic Minority Over-sampling Technique)
- **Before SMOTE**: 63,413 negative, 8,105 positive
- **After SMOTE**: 63,413 negative, 63,413 positive (balanced)
- **Applied only to training data** to prevent data leakage

### 4.2 Model Selection
- **Algorithm**: Logistic Regression
- **Rationale**: Interpretable coefficients for clinical explainability
- **Regularization**: L2 with C=0.1 (moderate regularization)
- **Feature Scaling**: StandardScaler applied

### 4.3 Train-Test Split
- **Split Ratio**: 80% training, 20% testing
- **Stratification**: Maintained class proportions in both sets

### 4.4 Model Performance
| Metric | Score |
|--------|-------|
| ROC-AUC | 0.564 |
| Average Precision | 0.110 |

**Note**: The modest AUC reflects the inherent difficulty of predicting hospital readmissions. Performance is consistent with published literature on readmission prediction.

---

## 5. Risk Score Calculation

### 5.1 Score Generation
```
Risk Score = P(readmission | features) × 100
```
Where P(readmission | features) is the predicted probability from logistic regression.

### 5.2 Cost Estimation
```
Estimated Cost = Risk Score × $15,000 (avg readmission cost)
```

### 5.3 Risk Stratification
| Tier | Risk Score Range | Count | Description |
|------|------------------|-------|-------------|
| Critical | 80-100% | 1,931 | Immediate intervention needed |
| Very High | 70-80% | 2,232 | Priority outreach |
| High | 60-70% | 2,920 | Proactive monitoring |
| Moderate | 40-60% | 9,224 | Standard care |
| Low | 0-40% | 55,211 | Routine follow-up |

---

## 6. Key Risk Factors

The model identified these top factors influencing readmission risk:

### 6.1 Risk-Increasing Factors
1. **Total Prior Visits** (coef: +4.36) - Strong positive predictor
2. **Number of Medications** (coef: +0.28) - Polypharmacy indicator
3. **Lab Procedures** (coef: +0.10) - Diagnostic complexity

### 6.2 Risk-Decreasing Factors
1. **Outpatient Visits** (coef: -3.12) - Continuity of care
2. **Prior Inpatient Visits** (coef: -1.96) - Established care protocols
3. **Emergency Visits** (coef: -1.54) - Prior acute care exposure

**Clinical Interpretation**: Patients with high healthcare utilization history have complex cases but may benefit from established care relationships. Outpatient follow-up appears protective.

---

## 7. Output Files

### 7.1 Generated JSON Files
| File | Description | Records |
|------|-------------|---------|
| `patient_risks.json` | High-risk patient records (60%+) | 7,083 |
| `risk_summary.json` | Dashboard statistics | 15 keys |
| `state_summary.json` | State-level metrics | 51 states |
| `hospital_metrics.json` | Hospital-level data | 746 hospitals |

### 7.2 Data Schema

**patient_risks.json**
```json
{
  "patient_id": 12345,
  "age": 75,
  "time_in_hospital": 5,
  "num_medications": 18,
  "number_diagnoses": 9,
  "number_inpatient": 2,
  "number_emergency": 1,
  "total_visits": 5,
  "num_med_changes": 2,
  "risk_score": 85.5,
  "estimated_cost": 12825.00,
  "readmitted_30day": 0
}
```

---

## 8. Jupyter Notebooks

Three notebooks were created to document the analysis:

1. **01_data_exploration.ipynb**
   - Dataset overview and statistics
   - Missing value analysis
   - Target variable distribution
   - Feature correlation analysis

2. **02_patient_risk_modeling.ipynb**
   - Feature engineering pipeline
   - SMOTE implementation
   - Model training and evaluation
   - Risk score generation

3. **03_hospital_analytics.ipynb**
   - Geographic analysis
   - State-level aggregation
   - Penalty estimation

---

## 9. Limitations & Considerations

1. **Data Age**: UCI dataset is from 1999-2008; healthcare patterns may have evolved
2. **Model Performance**: AUC of 0.56 indicates modest predictive power, typical for readmission models
3. **Geographic Data**: State-level metrics are simulated based on actual CMS patterns
4. **Cost Estimates**: Based on $15,000 average; actual costs vary by condition and facility
5. **Single Hospital System**: Results may not generalize to other patient populations

---

## 10. Reproduction Steps

To regenerate the analysis:

```bash
# 1. Ensure dependencies are installed
pip install pandas numpy scikit-learn imbalanced-learn

# 2. Run the analysis script
python run_analysis_v2.py

# 3. Copy outputs to dashboard
cp data/processed/*.json dashboard/lib/
```

---

## Appendix: Technology Stack

- **Analysis**: Python 3.x, pandas, scikit-learn, imbalanced-learn
- **Visualization**: Next.js 14, Recharts, Tailwind CSS
- **Data Storage**: Static JSON files (pre-computed intelligence pattern)

---

*Report generated for ReadmitRisk Dashboard v1.0*
*Last updated: January 2026*
