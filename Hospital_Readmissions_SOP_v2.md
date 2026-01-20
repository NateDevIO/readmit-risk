# SOP: Hospital Readmissions Risk Stratification Platform
## Version 2.0 - Corrected & Enhanced

---

## Document Information

| Field | Value |
|-------|-------|
| Version | 2.0 |
| Status | Production Ready |
| Last Updated | January 2026 |
| Purpose | Complete implementation guide for AI-assisted development |

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Phase 1: Environment Setup](#3-phase-1-environment-setup)
4. [Phase 2: Data Analysis & Modeling](#4-phase-2-data-analysis--modeling)
5. [Phase 3: Dashboard Development](#5-phase-3-dashboard-development)
6. [Phase 4: Deployment & Documentation](#6-phase-4-deployment--documentation)
7. [Phase 5: Portfolio Integration](#7-phase-5-portfolio-integration)
8. [Appendix: Troubleshooting](#8-appendix-troubleshooting)

---

## 1. Project Overview

### 1.1 Project Name
**Care Management Readmissions Dashboard**

### 1.2 Target Audience
Healthcare payer organizations (e.g., Centene) - specifically care management and quality teams

### 1.3 Business Problem
Health plans need to identify high-risk members before discharge to coordinate post-discharge care, reducing readmissions and HEDIS penalties while improving member outcomes.

### 1.4 Technical Goal
Build a data analysis pipeline and interactive web dashboard that demonstrates:
- Predictive analytics capabilities
- Data visualization expertise
- Business value quantification
- Full-stack development skills

### 1.5 Success Criteria

| Criterion | Description |
|-----------|-------------|
| Analysis Component | Jupyter notebooks showing data cleaning, feature engineering, and predictive modeling with clear documentation |
| Web Dashboard | Professional Next.js application hosted on Vercel with zero sleep issues |
| Business Value | Clear demonstration of ROI through savings calculator and risk stratification |
| Portfolio Ready | GitHub repo with comprehensive README, live demo link, and professional presentation |

---

## 2. Architecture

### 2.1 Pre-Computed Static Intelligence Pattern

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Raw Data      │     │  Python/Jupyter │     │  Static JSON    │
│   (CSV files)   │ ──► │  (Analysis &    │ ──► │  Exports        │
│                 │     │   ML Model)     │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel        │ ◄── │   Next.js       │ ◄── │  Import JSON    │
│   (Hosting)     │     │   (Dashboard)   │     │  at Build Time  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 2.2 Why This Approach?

| Benefit | Explanation |
|---------|-------------|
| No backend server | No sleep/cold start issues on Vercel free tier |
| Fast performance | All data pre-computed, no runtime calculations |
| Free hosting | Vercel's free tier handles everything |
| Demo reliable | Cannot crash during a presentation |
| Easy updates | Re-run notebooks, export new JSON, redeploy |

### 2.3 Data Flow Summary

1. **Input**: UCI Diabetes dataset (patient-level) + CMS Hospital data (geographic)
2. **Processing**: Python cleans data, trains ML model, generates risk scores
3. **Output**: Static JSON files with pre-computed analytics
4. **Display**: Next.js imports JSON at build time, renders interactive dashboard

---

## 3. Phase 1: Environment Setup

### 3.1 Download Datasets

#### Dataset 1: UCI Diabetes 130-US Hospitals (Patient-Level)

| Field | Value |
|-------|-------|
| Primary Source | https://archive.ics.uci.edu/dataset/296/diabetes+130+us+hospitals+for+years+1999+2008 |
| Alternative | https://www.kaggle.com/datasets/brandao/diabetes |
| Contents | 100K+ patient encounters, 50+ features including demographics, diagnoses, medications, and readmission status |
| Purpose | Build patient-level risk prediction model |
| Key File | `diabetic_data.csv` |

#### Dataset 2: CMS Hospital Readmissions Reduction Program (Hospital-Level)

| Field | Value |
|-------|-------|
| Source | https://data.cms.gov/provider-data/dataset/9n3s-kdb3 |
| Contents | Hospital-level readmission rates, excess readmission ratios, payment penalties |
| Purpose | Geographic/provider network analysis |
| Key File | Download as CSV, rename to `hospital_readmissions.csv` |

### 3.2 Project Structure Setup

Execute these commands in your terminal:

```bash
# Create project directory
mkdir hospital-readmissions-project
cd hospital-readmissions-project

# Create folder structure
mkdir -p data/raw
mkdir -p data/processed
mkdir -p notebooks

# Set up Python virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install Python dependencies
pip install pandas numpy scikit-learn imbalanced-learn jupyter matplotlib seaborn

# Verify installation
python -c "import pandas; import sklearn; import imblearn; print('All packages installed successfully')"
```

### 3.3 Complete File Organization

```
hospital-readmissions-project/
├── data/
│   ├── raw/
│   │   ├── diabetic_data.csv          # UCI dataset (download)
│   │   ├── hospital_readmissions.csv  # CMS dataset (download)
│   │   └── IDs_mapping.csv            # UCI data dictionary (download)
│   └── processed/
│       ├── patient_risks.json         # Generated by notebook 2
│       ├── risk_summary.json          # Generated by notebook 2
│       ├── hospital_metrics.json      # Generated by notebook 3
│       └── state_summary.json         # Generated by notebook 3
├── notebooks/
│   ├── 01_data_exploration.ipynb
│   ├── 02_patient_risk_modeling.ipynb
│   └── 03_hospital_analytics.ipynb
├── dashboard/                          # Next.js app (created in Phase 3)
└── README.md
```

### 3.4 Place Downloaded Data

After downloading, move files to the correct locations:

```bash
# Move downloaded files to data/raw/
mv ~/Downloads/diabetic_data.csv data/raw/
mv ~/Downloads/hospital_readmissions.csv data/raw/
mv ~/Downloads/IDs_mapping.csv data/raw/
```

---

## 4. Phase 2: Data Analysis & Modeling

### 4.1 Notebook 1: Data Exploration

**File**: `notebooks/01_data_exploration.ipynb`

**Objective**: Understand the data structure, quality, and relationships before modeling.

#### Cell 1: Setup and Imports

```python
# Cell 1: Setup and Imports
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import warnings

# Configuration
warnings.filterwarnings('ignore')
pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', 100)
plt.style.use('seaborn-v0_8-whitegrid')

print("Libraries loaded successfully")
```

#### Cell 2: Load UCI Diabetes Data

```python
# Cell 2: Load UCI Diabetes Data
df = pd.read_csv('../data/raw/diabetic_data.csv')

print("=" * 60)
print("UCI DIABETES 130-US HOSPITALS DATASET")
print("=" * 60)
print(f"\nDataset Shape: {df.shape[0]:,} rows × {df.shape[1]} columns")
print(f"\nColumn Names:\n{df.columns.tolist()}")
```

#### Cell 3: Data Types and Missing Values

```python
# Cell 3: Data Types and Missing Values Analysis
print("\n" + "=" * 60)
print("DATA TYPES")
print("=" * 60)
print(df.dtypes)

print("\n" + "=" * 60)
print("MISSING VALUES ANALYSIS")
print("=" * 60)

# Count '?' as missing (UCI dataset uses '?' for missing)
missing_counts = {}
for col in df.columns:
    missing_count = (df[col] == '?').sum() if df[col].dtype == 'object' else df[col].isnull().sum()
    if missing_count > 0:
        missing_pct = (missing_count / len(df)) * 100
        missing_counts[col] = {'count': missing_count, 'percent': missing_pct}

missing_df = pd.DataFrame(missing_counts).T.sort_values('percent', ascending=False)
print(missing_df)
```

#### Cell 4: Target Variable Analysis

```python
# Cell 4: Target Variable Analysis
print("\n" + "=" * 60)
print("TARGET VARIABLE: READMISSION STATUS")
print("=" * 60)

readmission_counts = df['readmitted'].value_counts()
readmission_pcts = df['readmitted'].value_counts(normalize=True) * 100

print("\nReadmission Distribution:")
for val, count in readmission_counts.items():
    pct = readmission_pcts[val]
    print(f"  {val}: {count:,} ({pct:.1f}%)")

# Visualize
fig, ax = plt.subplots(figsize=(8, 5))
colors = ['#2ecc71', '#f39c12', '#e74c3c']
readmission_counts.plot(kind='bar', color=colors, ax=ax)
ax.set_title('Readmission Status Distribution', fontsize=14, fontweight='bold')
ax.set_xlabel('Readmission Status')
ax.set_ylabel('Count')
ax.set_xticklabels(['Not Readmitted', 'After 30 Days', 'Within 30 Days'], rotation=0)

for i, (val, count) in enumerate(readmission_counts.items()):
    ax.annotate(f'{count:,}\n({readmission_pcts[val]:.1f}%)', 
                xy=(i, count), ha='center', va='bottom', fontsize=10)

plt.tight_layout()
plt.savefig('../data/processed/readmission_distribution.png', dpi=150, bbox_inches='tight')
plt.show()

print(f"\n*** KEY INSIGHT: Only {readmission_pcts['<30']:.1f}% readmitted within 30 days ***")
print("*** This class imbalance MUST be addressed in modeling ***")
```

#### Cell 5: Key Feature Distributions

```python
# Cell 5: Key Feature Distributions
print("\n" + "=" * 60)
print("KEY FEATURE ANALYSIS")
print("=" * 60)

# Age distribution
print("\nAge Distribution:")
print(df['age'].value_counts().sort_index())

# Time in hospital
print(f"\nTime in Hospital: Mean={df['time_in_hospital'].mean():.1f}, Median={df['time_in_hospital'].median():.0f}")

# Number of medications
print(f"Number of Medications: Mean={df['num_medications'].mean():.1f}, Median={df['num_medications'].median():.0f}")

# Number of diagnoses
print(f"Number of Diagnoses: Mean={df['number_diagnoses'].mean():.1f}, Median={df['number_diagnoses'].median():.0f}")
```

#### Cell 6: Correlation with Readmission

```python
# Cell 6: Feature Correlation with 30-Day Readmission
print("\n" + "=" * 60)
print("FEATURES CORRELATED WITH 30-DAY READMISSION")
print("=" * 60)

# Create binary target
df_temp = df.copy()
df_temp['readmitted_30day'] = (df_temp['readmitted'] == '<30').astype(int)

# Calculate readmission rates by key features
print("\nReadmission Rate by Age Group:")
age_readmit = df_temp.groupby('age')['readmitted_30day'].mean().sort_index()
for age, rate in age_readmit.items():
    print(f"  {age}: {rate*100:.1f}%")

print("\nReadmission Rate by Number of Prior Inpatient Visits:")
inpatient_readmit = df_temp.groupby('number_inpatient')['readmitted_30day'].mean()
for visits in [0, 1, 2, 3]:
    if visits in inpatient_readmit.index:
        print(f"  {visits} visits: {inpatient_readmit[visits]*100:.1f}%")
print(f"  4+ visits: {df_temp[df_temp['number_inpatient']>=4]['readmitted_30day'].mean()*100:.1f}%")
```

#### Cell 7: Summary Statistics for Documentation

```python
# Cell 7: Summary Statistics for Documentation
print("\n" + "=" * 60)
print("SUMMARY STATISTICS FOR README/DOCUMENTATION")
print("=" * 60)

summary_stats = {
    'total_encounters': len(df),
    'unique_patients': df['patient_nbr'].nunique(),
    'readmit_30day_rate': (df['readmitted'] == '<30').mean() * 100,
    'readmit_any_rate': (df['readmitted'] != 'NO').mean() * 100,
    'avg_time_in_hospital': df['time_in_hospital'].mean(),
    'avg_num_medications': df['num_medications'].mean(),
    'avg_num_diagnoses': df['number_diagnoses'].mean(),
}

for key, value in summary_stats.items():
    if isinstance(value, float):
        print(f"  {key}: {value:.2f}")
    else:
        print(f"  {key}: {value:,}")

print("\n*** SAVE THESE STATS FOR YOUR README ***")
```

---

### 4.2 Notebook 2: Patient Risk Modeling

**File**: `notebooks/02_patient_risk_modeling.ipynb`

**Objective**: Build a predictive model and generate risk scores for each patient.

> **CRITICAL FIX FROM V1**: This notebook corrects the bug where `patient_nbr` was dropped before being used for deduplication. It also adds proper class imbalance handling using SMOTE.

#### Cell 1: Imports and Setup

```python
# Cell 1: Imports and Setup
import pandas as pd
import numpy as np
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix, roc_curve
from imblearn.over_sampling import SMOTE  # For handling class imbalance
import matplotlib.pyplot as plt
import seaborn as sns
import warnings

warnings.filterwarnings('ignore')
print("All libraries loaded successfully")
```

#### Cell 2: Load and Initial Clean

```python
# Cell 2: Load and Initial Clean
df = pd.read_csv('../data/raw/diabetic_data.csv')
print(f"Original dataset shape: {df.shape}")

# Replace '?' with NaN for proper handling
df = df.replace('?', np.nan)

# Create binary target FIRST (before any filtering)
# 1 = readmitted within 30 days, 0 = not readmitted within 30 days
df['readmitted_30day'] = (df['readmitted'] == '<30').astype(int)

print(f"\nTarget distribution:")
print(df['readmitted_30day'].value_counts())
print(f"\n30-day readmission rate: {df['readmitted_30day'].mean()*100:.2f}%")
```

#### Cell 3: Handle Duplicate Patients (CORRECTED)

```python
# Cell 3: Handle Duplicate Patients
# CRITICAL: Keep patient_nbr for deduplication, drop AFTER

print(f"\nUnique patients: {df['patient_nbr'].nunique():,}")
print(f"Total encounters: {len(df):,}")
print(f"Average encounters per patient: {len(df)/df['patient_nbr'].nunique():.2f}")

# Keep only the FIRST encounter for each patient to avoid data leakage
# (A patient's second visit would have information about their first readmission)
df = df.sort_values('encounter_id').drop_duplicates(subset=['patient_nbr'], keep='first')
print(f"\nAfter keeping first encounter per patient: {len(df):,} rows")

# NOW we can drop patient identifiers (after deduplication)
df = df.drop(columns=['encounter_id', 'patient_nbr'])
```

#### Cell 4: Feature Engineering

```python
# Cell 4: Feature Engineering
print("=" * 60)
print("FEATURE ENGINEERING")
print("=" * 60)

# 4a: Handle columns with too many missing values (>40%)
high_missing_cols = ['weight', 'payer_code', 'medical_specialty']
print(f"\nDropping high-missing columns: {high_missing_cols}")
df = df.drop(columns=high_missing_cols)

# 4b: Encode age ranges to numeric midpoints
age_mapping = {
    '[0-10)': 5, '[10-20)': 15, '[20-30)': 25, '[30-40)': 35,
    '[40-50)': 45, '[50-60)': 55, '[60-70)': 65, '[70-80)': 75,
    '[80-90)': 85, '[90-100)': 95
}
df['age_numeric'] = df['age'].map(age_mapping)
print(f"Encoded age to numeric (n={df['age_numeric'].notna().sum():,})")

# 4c: Create summary features
df['total_visits'] = df['number_outpatient'] + df['number_emergency'] + df['number_inpatient']
df['medication_intensity'] = df['num_medications'] / (df['time_in_hospital'] + 1)
print("Created derived features: total_visits, medication_intensity")

# 4d: Medication change indicator (any medication changed during stay)
med_cols = ['metformin', 'repaglinide', 'nateglinide', 'chlorpropamide', 
            'glimepiride', 'acetohexamide', 'glipizide', 'glyburide', 
            'tolbutamide', 'pioglitazone', 'rosiglitazone', 'acarbose', 
            'miglitol', 'troglitazone', 'tolazamide', 'insulin', 
            'glyburide-metformin', 'glipizide-metformin']

# Count medications that were changed (Up, Down, or Steady but not 'No')
def count_med_changes(row):
    changes = 0
    for col in med_cols:
        if col in row.index and row[col] in ['Up', 'Down']:
            changes += 1
    return changes

df['num_med_changes'] = df.apply(count_med_changes, axis=1)
print(f"Created num_med_changes feature")

# 4e: A1C result indicator
df['A1Cresult_abnormal'] = df['A1Cresult'].apply(
    lambda x: 1 if x in ['>7', '>8'] else 0
)
print("Created A1Cresult_abnormal feature")
```

#### Cell 5: Select and Encode Features

```python
# Cell 5: Select and Encode Features
print("\n" + "=" * 60)
print("FEATURE SELECTION AND ENCODING")
print("=" * 60)

# Define feature groups
numeric_features = [
    'time_in_hospital', 'num_lab_procedures', 'num_procedures',
    'num_medications', 'number_outpatient', 'number_emergency',
    'number_inpatient', 'number_diagnoses', 'age_numeric',
    'total_visits', 'medication_intensity', 'num_med_changes'
]

categorical_features = [
    'race', 'gender', 'admission_type_id', 'discharge_disposition_id',
    'admission_source_id', 'diabetesMed', 'change', 'A1Cresult_abnormal'
]

# Keep only selected features plus target
keep_cols = numeric_features + categorical_features + ['readmitted_30day']
df_model = df[keep_cols].copy()

print(f"Selected {len(numeric_features)} numeric features")
print(f"Selected {len(categorical_features)} categorical features")

# Handle any remaining missing values in numeric features
for col in numeric_features:
    if df_model[col].isnull().any():
        median_val = df_model[col].median()
        df_model[col] = df_model[col].fillna(median_val)
        print(f"  Filled {col} missing with median: {median_val:.2f}")

# Handle missing in categorical features
for col in categorical_features:
    if df_model[col].isnull().any():
        df_model[col] = df_model[col].fillna('Unknown')
        print(f"  Filled {col} missing with 'Unknown'")

# One-hot encode categorical features
df_encoded = pd.get_dummies(df_model, columns=categorical_features, drop_first=True)
print(f"\nAfter encoding: {df_encoded.shape[1]} total features")

# Prepare X and y
feature_cols = [col for col in df_encoded.columns if col != 'readmitted_30day']
X = df_encoded[feature_cols]
y = df_encoded['readmitted_30day']

print(f"\nFinal X shape: {X.shape}")
print(f"Final y shape: {y.shape}")
print(f"Class balance: {y.value_counts().to_dict()}")
```

#### Cell 6: Train-Test Split and SMOTE

```python
# Cell 6: Train-Test Split with Class Imbalance Handling
print("\n" + "=" * 60)
print("HANDLING CLASS IMBALANCE WITH SMOTE")
print("=" * 60)

# Split BEFORE applying SMOTE (to avoid data leakage)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"Training set: {X_train.shape[0]:,} samples")
print(f"Test set: {X_test.shape[0]:,} samples")
print(f"\nBefore SMOTE - Training class distribution:")
print(y_train.value_counts())

# Apply SMOTE to training data only
smote = SMOTE(random_state=42)
X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)

print(f"\nAfter SMOTE - Training class distribution:")
print(pd.Series(y_train_balanced).value_counts())
print(f"\nBalanced training set size: {X_train_balanced.shape[0]:,} samples")
```

#### Cell 7: Model Training and Evaluation

```python
# Cell 7: Model Training and Evaluation
print("\n" + "=" * 60)
print("MODEL TRAINING")
print("=" * 60)

# Scale features for Logistic Regression
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train_balanced)
X_test_scaled = scaler.transform(X_test)

# Train Logistic Regression (interpretable, good for healthcare)
print("\nTraining Logistic Regression...")
lr_model = LogisticRegression(max_iter=1000, random_state=42, C=0.1)
lr_model.fit(X_train_scaled, y_train_balanced)

# Predictions
y_pred = lr_model.predict(X_test_scaled)
y_pred_proba = lr_model.predict_proba(X_test_scaled)[:, 1]

# Evaluation
print("\n" + "=" * 60)
print("MODEL EVALUATION")
print("=" * 60)

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

roc_auc = roc_auc_score(y_test, y_pred_proba)
print(f"\nROC-AUC Score: {roc_auc:.4f}")

# Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
print(f"\nConfusion Matrix:")
print(cm)

# Plot ROC Curve
fpr, tpr, _ = roc_curve(y_test, y_pred_proba)
plt.figure(figsize=(8, 6))
plt.plot(fpr, tpr, color='#3498db', lw=2, label=f'ROC curve (AUC = {roc_auc:.3f})')
plt.plot([0, 1], [0, 1], color='gray', lw=1, linestyle='--')
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('Receiver Operating Characteristic (ROC) Curve')
plt.legend(loc='lower right')
plt.tight_layout()
plt.savefig('../data/processed/roc_curve.png', dpi=150, bbox_inches='tight')
plt.show()
```

#### Cell 8: Feature Importance Analysis

```python
# Cell 8: Feature Importance Analysis
print("\n" + "=" * 60)
print("FEATURE IMPORTANCE")
print("=" * 60)

# Get coefficients from logistic regression
feature_importance = pd.DataFrame({
    'feature': feature_cols,
    'coefficient': lr_model.coef_[0]
}).sort_values('coefficient', ascending=False)

print("\nTop 10 RISK FACTORS (increase readmission risk):")
print(feature_importance.head(10).to_string(index=False))

print("\nTop 10 PROTECTIVE FACTORS (decrease readmission risk):")
print(feature_importance.tail(10).to_string(index=False))

# Visualize top features
top_features = pd.concat([
    feature_importance.head(10),
    feature_importance.tail(10)
]).sort_values('coefficient')

plt.figure(figsize=(10, 8))
colors = ['#e74c3c' if x > 0 else '#27ae60' for x in top_features['coefficient']]
plt.barh(top_features['feature'], top_features['coefficient'], color=colors)
plt.xlabel('Coefficient (Impact on Readmission Risk)')
plt.title('Top Risk & Protective Factors for 30-Day Readmission')
plt.tight_layout()
plt.savefig('../data/processed/feature_importance.png', dpi=150, bbox_inches='tight')
plt.show()
```

#### Cell 9: Generate Risk Scores and Export

```python
# Cell 9: Generate Risk Scores and Export JSON
print("\n" + "=" * 60)
print("GENERATING RISK SCORES AND EXPORTING DATA")
print("=" * 60)

# Score ALL patients (using unbalanced original data)
X_all_scaled = scaler.transform(X)
all_risk_scores = lr_model.predict_proba(X_all_scaled)[:, 1] * 100  # Convert to percentage

# Add risk scores to original dataframe
df_scored = df_model.copy()
df_scored['risk_score'] = all_risk_scores

# Calculate estimated cost per readmission
AVG_READMISSION_COST = 15000
df_scored['estimated_cost'] = (df_scored['risk_score'] / 100) * AVG_READMISSION_COST

# Add patient ID for reference
df_scored['patient_id'] = range(1, len(df_scored) + 1)

# Select top 1000 highest risk patients for dashboard (performance optimization)
df_high_risk = df_scored.nlargest(1000, 'risk_score')

print(f"Total patients scored: {len(df_scored):,}")
print(f"High-risk patients exported: {len(df_high_risk):,}")
print(f"Risk score range: {df_scored['risk_score'].min():.1f}% - {df_scored['risk_score'].max():.1f}%")
print(f"Total estimated cost exposure: ${df_high_risk['estimated_cost'].sum():,.0f}")

# Prepare export data with clean column names
export_columns = [
    'patient_id', 'age_numeric', 'time_in_hospital', 'num_medications',
    'number_diagnoses', 'number_inpatient', 'number_emergency',
    'total_visits', 'num_med_changes', 'risk_score', 'estimated_cost',
    'readmitted_30day'
]

# Rename age_numeric to age for cleaner export
export_df = df_high_risk[export_columns].copy()
export_df = export_df.rename(columns={'age_numeric': 'age'})

# Convert to list of dictionaries for JSON
patient_risks = export_df.to_dict('records')

# Export to JSON
with open('../data/processed/patient_risks.json', 'w') as f:
    json.dump(patient_risks, f, indent=2)

print(f"\n✓ Exported patient_risks.json ({len(patient_risks)} records)")
```

#### Cell 10: Generate Summary Statistics

```python
# Cell 10: Generate Summary Statistics for Dashboard
print("\n" + "=" * 60)
print("GENERATING SUMMARY STATISTICS")
print("=" * 60)

# Risk distribution by bins
bins = [0, 20, 40, 60, 80, 100]
labels = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%']
df_scored['risk_bin'] = pd.cut(df_scored['risk_score'], bins=bins, labels=labels)
risk_distribution = df_scored['risk_bin'].value_counts().sort_index().to_dict()

# Age group analysis
age_bins = [0, 30, 50, 70, 100]
age_labels = ['Under 30', '30-49', '50-69', '70+']
df_scored['age_group'] = pd.cut(df_scored['age_numeric'], bins=age_bins, labels=age_labels)
age_risk = df_scored.groupby('age_group')['risk_score'].mean().to_dict()

# Summary object
risk_summary = {
    'total_patients': int(len(df_scored)),
    'high_risk_count': int(len(df_high_risk)),
    'total_cost_exposure': float(df_high_risk['estimated_cost'].sum()),
    'avg_risk_score': float(df_high_risk['risk_score'].mean()),
    'median_risk_score': float(df_high_risk['risk_score'].median()),
    'risk_distribution': {k: int(v) for k, v in risk_distribution.items()},
    'avg_risk_by_age': {k: float(v) for k, v in age_risk.items()},
    'model_auc': float(roc_auc),
    'readmission_rate_overall': float(df_scored['readmitted_30day'].mean() * 100)
}

# Export summary
with open('../data/processed/risk_summary.json', 'w') as f:
    json.dump(risk_summary, f, indent=2)

print("Summary Statistics:")
for key, value in risk_summary.items():
    if isinstance(value, dict):
        print(f"  {key}:")
        for k, v in value.items():
            print(f"    {k}: {v}")
    elif isinstance(value, float):
        print(f"  {key}: {value:,.2f}")
    else:
        print(f"  {key}: {value:,}")

print(f"\n✓ Exported risk_summary.json")
```

---

### 4.3 Notebook 3: Hospital & Geographic Analytics

**File**: `notebooks/03_hospital_analytics.ipynb`

**Objective**: Analyze CMS hospital data for geographic patterns and provider performance.

#### Cell 1: Setup

```python
# Cell 1: Setup
import pandas as pd
import numpy as np
import json
import warnings

warnings.filterwarnings('ignore')
pd.set_option('display.max_columns', None)

print("Libraries loaded successfully")
```

#### Cell 2: Load CMS Data

```python
# Cell 2: Load CMS Hospital Readmissions Data
# Note: Column names may vary based on the exact CMS file downloaded
# Adjust column names below if needed

df_hosp = pd.read_csv('../data/raw/hospital_readmissions.csv')

print("=" * 60)
print("CMS HOSPITAL READMISSIONS DATA")
print("=" * 60)
print(f"\nDataset shape: {df_hosp.shape}")
print(f"\nColumn names:\n{df_hosp.columns.tolist()}")
print(f"\nFirst 3 rows:")
print(df_hosp.head(3))

# Identify key columns (adjust these based on actual column names in downloaded file)
# Common column names in CMS data:
# 'Facility Name', 'State', 'Measure Name', 'Score', 'Payment Reduction Percentage'
# Or: 'Hospital Name', 'State', 'Excess Readmission Ratio', 'Predicted Readmission Rate'
```

#### Cell 3: Data Cleaning

```python
# Cell 3: Data Cleaning
# NOTE: Adjust column names below based on your actual CMS file

# Example mapping - modify based on your actual columns
column_mapping = {
    'Facility Name': 'hospital_name',
    'Hospital Name': 'hospital_name',
    'State': 'state',
    'City': 'city',
    'Score': 'readmission_rate',
    'Excess Readmission Ratio': 'excess_ratio',
    'Payment Reduction Percentage': 'penalty_pct',
    'Number of Patients': 'patient_count'
}

# Rename columns that exist
for old_name, new_name in column_mapping.items():
    if old_name in df_hosp.columns:
        df_hosp = df_hosp.rename(columns={old_name: new_name})

# Convert numeric columns
numeric_cols = ['readmission_rate', 'excess_ratio', 'penalty_pct', 'patient_count']
for col in numeric_cols:
    if col in df_hosp.columns:
        df_hosp[col] = pd.to_numeric(df_hosp[col], errors='coerce')

# Drop rows with missing state
if 'state' in df_hosp.columns:
    df_hosp = df_hosp.dropna(subset=['state'])

print(f"\nCleaned dataset shape: {df_hosp.shape}")
print(f"\nColumns available: {df_hosp.columns.tolist()}")
```

#### Cell 4: State-Level Aggregation

```python
# Cell 4: State-Level Aggregation
print("\n" + "=" * 60)
print("STATE-LEVEL AGGREGATION")
print("=" * 60)

# Determine which rate column to use
rate_col = 'readmission_rate' if 'readmission_rate' in df_hosp.columns else 'excess_ratio'
penalty_col = 'penalty_pct' if 'penalty_pct' in df_hosp.columns else None

# Build aggregation dictionary
agg_dict = {
    rate_col: 'mean',
    'hospital_name': 'count'
}
if penalty_col:
    agg_dict[penalty_col] = 'mean'

# Aggregate by state
state_summary = df_hosp.groupby('state').agg(agg_dict).reset_index()

# Rename columns for clarity
state_summary.columns = ['state', 'avg_readmission_rate', 'hospital_count'] + \
                        (['avg_penalty_pct'] if penalty_col else [])

# Calculate estimated total penalty (using national average if available)
AVG_MEDICARE_PAYMENTS_PER_HOSPITAL = 5000000  # $5M example
if 'avg_penalty_pct' in state_summary.columns:
    state_summary['total_penalty_estimate'] = (
        state_summary['hospital_count'] * 
        AVG_MEDICARE_PAYMENTS_PER_HOSPITAL * 
        state_summary['avg_penalty_pct'] / 100
    )
else:
    state_summary['total_penalty_estimate'] = 0

# Sort by readmission rate
state_summary = state_summary.sort_values('avg_readmission_rate', ascending=False)

print(f"\nTop 10 states by readmission rate:")
print(state_summary.head(10).to_string(index=False))

print(f"\nBottom 10 states by readmission rate:")
print(state_summary.tail(10).to_string(index=False))
```

#### Cell 5: Export State Summary

```python
# Cell 5: Export State Summary JSON
# US State coordinates for map visualization
STATE_COORDS = {
    'AL': {'lat': 32.806671, 'lng': -86.791130, 'name': 'Alabama'},
    'AK': {'lat': 61.370716, 'lng': -152.404419, 'name': 'Alaska'},
    'AZ': {'lat': 33.729759, 'lng': -111.431221, 'name': 'Arizona'},
    'AR': {'lat': 34.969704, 'lng': -92.373123, 'name': 'Arkansas'},
    'CA': {'lat': 36.116203, 'lng': -119.681564, 'name': 'California'},
    'CO': {'lat': 39.059811, 'lng': -105.311104, 'name': 'Colorado'},
    'CT': {'lat': 41.597782, 'lng': -72.755371, 'name': 'Connecticut'},
    'DE': {'lat': 39.318523, 'lng': -75.507141, 'name': 'Delaware'},
    'FL': {'lat': 27.766279, 'lng': -81.686783, 'name': 'Florida'},
    'GA': {'lat': 33.040619, 'lng': -83.643074, 'name': 'Georgia'},
    'HI': {'lat': 21.094318, 'lng': -157.498337, 'name': 'Hawaii'},
    'ID': {'lat': 44.240459, 'lng': -114.478828, 'name': 'Idaho'},
    'IL': {'lat': 40.349457, 'lng': -88.986137, 'name': 'Illinois'},
    'IN': {'lat': 39.849426, 'lng': -86.258278, 'name': 'Indiana'},
    'IA': {'lat': 42.011539, 'lng': -93.210526, 'name': 'Iowa'},
    'KS': {'lat': 38.526600, 'lng': -96.726486, 'name': 'Kansas'},
    'KY': {'lat': 37.668140, 'lng': -84.670067, 'name': 'Kentucky'},
    'LA': {'lat': 31.169546, 'lng': -91.867805, 'name': 'Louisiana'},
    'ME': {'lat': 44.693947, 'lng': -69.381927, 'name': 'Maine'},
    'MD': {'lat': 39.063946, 'lng': -76.802101, 'name': 'Maryland'},
    'MA': {'lat': 42.230171, 'lng': -71.530106, 'name': 'Massachusetts'},
    'MI': {'lat': 43.326618, 'lng': -84.536095, 'name': 'Michigan'},
    'MN': {'lat': 45.694454, 'lng': -93.900192, 'name': 'Minnesota'},
    'MS': {'lat': 32.741646, 'lng': -89.678696, 'name': 'Mississippi'},
    'MO': {'lat': 38.456085, 'lng': -92.288368, 'name': 'Missouri'},
    'MT': {'lat': 46.921925, 'lng': -110.454353, 'name': 'Montana'},
    'NE': {'lat': 41.125370, 'lng': -98.268082, 'name': 'Nebraska'},
    'NV': {'lat': 38.313515, 'lng': -117.055374, 'name': 'Nevada'},
    'NH': {'lat': 43.452492, 'lng': -71.563896, 'name': 'New Hampshire'},
    'NJ': {'lat': 40.298904, 'lng': -74.521011, 'name': 'New Jersey'},
    'NM': {'lat': 34.840515, 'lng': -106.248482, 'name': 'New Mexico'},
    'NY': {'lat': 42.165726, 'lng': -74.948051, 'name': 'New York'},
    'NC': {'lat': 35.630066, 'lng': -79.806419, 'name': 'North Carolina'},
    'ND': {'lat': 47.528912, 'lng': -99.784012, 'name': 'North Dakota'},
    'OH': {'lat': 40.388783, 'lng': -82.764915, 'name': 'Ohio'},
    'OK': {'lat': 35.565342, 'lng': -96.928917, 'name': 'Oklahoma'},
    'OR': {'lat': 44.572021, 'lng': -122.070938, 'name': 'Oregon'},
    'PA': {'lat': 40.590752, 'lng': -77.209755, 'name': 'Pennsylvania'},
    'RI': {'lat': 41.680893, 'lng': -71.511780, 'name': 'Rhode Island'},
    'SC': {'lat': 33.856892, 'lng': -80.945007, 'name': 'South Carolina'},
    'SD': {'lat': 44.299782, 'lng': -99.438828, 'name': 'South Dakota'},
    'TN': {'lat': 35.747845, 'lng': -86.692345, 'name': 'Tennessee'},
    'TX': {'lat': 31.054487, 'lng': -97.563461, 'name': 'Texas'},
    'UT': {'lat': 40.150032, 'lng': -111.862434, 'name': 'Utah'},
    'VT': {'lat': 44.045876, 'lng': -72.710686, 'name': 'Vermont'},
    'VA': {'lat': 37.769337, 'lng': -78.169968, 'name': 'Virginia'},
    'WA': {'lat': 47.400902, 'lng': -121.490494, 'name': 'Washington'},
    'WV': {'lat': 38.491226, 'lng': -80.954453, 'name': 'West Virginia'},
    'WI': {'lat': 44.268543, 'lng': -89.616508, 'name': 'Wisconsin'},
    'WY': {'lat': 42.755966, 'lng': -107.302490, 'name': 'Wyoming'},
    'DC': {'lat': 38.897438, 'lng': -77.026817, 'name': 'District of Columbia'}
}

# Enrich state summary with coordinates
state_data = []
for _, row in state_summary.iterrows():
    state_code = row['state']
    coords = STATE_COORDS.get(state_code, {'lat': 0, 'lng': 0, 'name': state_code})
    
    state_data.append({
        'state': state_code,
        'name': coords['name'],
        'lat': coords['lat'],
        'lng': coords['lng'],
        'avg_readmission_rate': round(row['avg_readmission_rate'], 2),
        'hospital_count': int(row['hospital_count']),
        'total_penalty_estimate': round(row.get('total_penalty_estimate', 0), 0)
    })

# Export to JSON
with open('../data/processed/state_summary.json', 'w') as f:
    json.dump(state_data, f, indent=2)

print(f"\n✓ Exported state_summary.json ({len(state_data)} states)")
```

#### Cell 6: Hospital-Level Export

```python
# Cell 6: Hospital-Level Export
print("\n" + "=" * 60)
print("HOSPITAL-LEVEL EXPORT")
print("=" * 60)

# Select top 500 hospitals by readmission rate for dashboard
if rate_col in df_hosp.columns:
    df_hosp_clean = df_hosp.dropna(subset=[rate_col])
    df_top_hospitals = df_hosp_clean.nlargest(500, rate_col)
else:
    df_top_hospitals = df_hosp.head(500)

# Prepare export
hospital_export_cols = ['hospital_name', 'state', 'city', rate_col]
if penalty_col and penalty_col in df_hosp.columns:
    hospital_export_cols.append(penalty_col)

hospital_data = []
for _, row in df_top_hospitals.iterrows():
    hospital_entry = {
        'name': str(row.get('hospital_name', 'Unknown')),
        'state': str(row.get('state', 'Unknown')),
        'city': str(row.get('city', 'Unknown')),
        'readmission_rate': float(row.get(rate_col, 0)),
        'penalty_pct': float(row.get(penalty_col, 0)) if penalty_col else 0
    }
    hospital_data.append(hospital_entry)

# Export to JSON
with open('../data/processed/hospital_metrics.json', 'w') as f:
    json.dump(hospital_data, f, indent=2)

print(f"✓ Exported hospital_metrics.json ({len(hospital_data)} hospitals)")
```

#### Cell 7: Verify All Exports

```python
# Cell 7: Verify All Exports
print("\n" + "=" * 60)
print("VERIFICATION OF ALL EXPORTED FILES")
print("=" * 60)

import os

export_files = [
    '../data/processed/patient_risks.json',
    '../data/processed/risk_summary.json', 
    '../data/processed/state_summary.json',
    '../data/processed/hospital_metrics.json'
]

for filepath in export_files:
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            data = json.load(f)
        if isinstance(data, list):
            print(f"✓ {os.path.basename(filepath)}: {len(data)} records")
        else:
            print(f"✓ {os.path.basename(filepath)}: {len(data.keys())} keys")
    else:
        print(f"✗ {os.path.basename(filepath)}: FILE NOT FOUND")

print("\n*** ALL DATA READY FOR DASHBOARD ***")
```

---

## 5. Phase 3: Dashboard Development

### 5.1 Initialize Next.js Project

```bash
# Navigate to project root
cd hospital-readmissions-project

# Create Next.js app with TypeScript and Tailwind
npx create-next-app@latest dashboard --typescript --tailwind --app --no-src-dir --no-import-alias

# Navigate to dashboard
cd dashboard

# Install dependencies
npm install recharts

# Create necessary directories
mkdir -p lib
mkdir -p components
```

### 5.2 Copy Processed Data

> **CRITICAL FIX**: In Next.js App Router, you cannot directly import from `public/`. Instead, place JSON in `lib/` or `app/` directories.

```bash
# Copy processed JSON files to lib directory (NOT public)
cp ../data/processed/patient_risks.json lib/
cp ../data/processed/risk_summary.json lib/
cp ../data/processed/state_summary.json lib/
cp ../data/processed/hospital_metrics.json lib/
```

### 5.3 Project Structure

```
dashboard/
├── app/
│   ├── layout.tsx              # Root layout with navigation
│   ├── page.tsx                # Landing page
│   ├── dashboard/
│   │   └── page.tsx            # Main dashboard
│   ├── members/
│   │   └── page.tsx            # Member risk list
│   └── geography/
│       └── page.tsx            # Geographic analysis
├── components/
│   ├── Navigation.tsx
│   ├── KPICard.tsx
│   ├── SavingsCalculator.tsx
│   ├── RiskDistributionChart.tsx
│   ├── MemberTable.tsx
│   ├── StateHeatmap.tsx
│   └── LoadingSpinner.tsx
├── lib/
│   ├── patient_risks.json      # Pre-computed patient data
│   ├── risk_summary.json       # Summary statistics
│   ├── state_summary.json      # State-level data
│   ├── hospital_metrics.json   # Hospital data
│   └── data.ts                 # Data loading utilities
└── package.json
```

### 5.4 Data Loading Utility

**File**: `lib/data.ts`

```typescript
// lib/data.ts
// Centralized data loading with type safety

import patientRisksData from './patient_risks.json';
import riskSummaryData from './risk_summary.json';
import stateSummaryData from './state_summary.json';
import hospitalMetricsData from './hospital_metrics.json';

// Type definitions
export interface Patient {
  patient_id: number;
  age: number;
  time_in_hospital: number;
  num_medications: number;
  number_diagnoses: number;
  number_inpatient: number;
  number_emergency: number;
  total_visits: number;
  num_med_changes: number;
  risk_score: number;
  estimated_cost: number;
  readmitted_30day: number;
}

export interface RiskSummary {
  total_patients: number;
  high_risk_count: number;
  total_cost_exposure: number;
  avg_risk_score: number;
  median_risk_score: number;
  risk_distribution: Record<string, number>;
  avg_risk_by_age: Record<string, number>;
  model_auc: number;
  readmission_rate_overall: number;
}

export interface StateData {
  state: string;
  name: string;
  lat: number;
  lng: number;
  avg_readmission_rate: number;
  hospital_count: number;
  total_penalty_estimate: number;
}

export interface Hospital {
  name: string;
  state: string;
  city: string;
  readmission_rate: number;
  penalty_pct: number;
}

// Export typed data
export const patientRisks: Patient[] = patientRisksData as Patient[];
export const riskSummary: RiskSummary = riskSummaryData as RiskSummary;
export const stateSummary: StateData[] = stateSummaryData as StateData[];
export const hospitalMetrics: Hospital[] = hospitalMetricsData as Hospital[];

// Utility functions
export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString();
}

export function getRiskLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}
```

### 5.5 Components

#### Navigation Component

**File**: `components/Navigation.tsx`

```typescript
// components/Navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/members', label: 'Members' },
  { href: '/geography', label: 'Geography' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              ReadmitRisk
            </Link>
          </div>
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

#### KPI Card Component

**File**: `components/KPICard.tsx`

```typescript
// components/KPICard.tsx

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
}

export default function KPICard({ title, value, subtitle, icon, trend }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          {title}
        </h3>
        {icon && <div className="text-blue-500">{icon}</div>}
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && (
        <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
      )}
      {trend && (
        <div className="mt-2 flex items-center">
          <span
            className={`text-sm font-medium ${
              trend.positive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="ml-2 text-sm text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
```

#### Savings Calculator Component

**File**: `components/SavingsCalculator.tsx`

```typescript
// components/SavingsCalculator.tsx
'use client';

import { useState, useMemo } from 'react';

interface SavingsCalculatorProps {
  totalHighRiskPatients: number;
  avgCostPerReadmission?: number;
}

export default function SavingsCalculator({
  totalHighRiskPatients,
  avgCostPerReadmission = 15000,
}: SavingsCalculatorProps) {
  const [effectiveness, setEffectiveness] = useState(20);
  const [costPerIntervention, setCostPerIntervention] = useState(100);

  const calculations = useMemo(() => {
    const readmissionsAvoided = Math.round(
      totalHighRiskPatients * (effectiveness / 100)
    );
    const grossSavings = readmissionsAvoided * avgCostPerReadmission;
    const totalInterventionCost = totalHighRiskPatients * costPerIntervention;
    const netSavings = grossSavings - totalInterventionCost;
    const roi = totalInterventionCost > 0 
      ? ((netSavings / totalInterventionCost) * 100).toFixed(0)
      : 0;

    return {
      readmissionsAvoided,
      grossSavings,
      totalInterventionCost,
      netSavings,
      roi,
    };
  }, [totalHighRiskPatients, effectiveness, costPerIntervention, avgCostPerReadmission]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Intervention ROI Calculator
      </h2>

      {/* Sliders */}
      <div className="space-y-6 mb-8">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Intervention Effectiveness
            </label>
            <span className="text-sm font-bold text-blue-600">
              {effectiveness}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={effectiveness}
            onChange={(e) => setEffectiveness(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>Conservative (10-15%)</span>
            <span>50%</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Cost per Intervention
            </label>
            <span className="text-sm font-bold text-blue-600">
              ${costPerIntervention}
            </span>
          </div>
          <input
            type="range"
            min="25"
            max="500"
            step="25"
            value={costPerIntervention}
            onChange={(e) => setCostPerIntervention(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>$25</span>
            <span>Phone call: $50-100</span>
            <span>$500</span>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">Readmissions Avoided</p>
          <p className="text-2xl font-bold text-green-600">
            {calculations.readmissionsAvoided.toLocaleString()}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">Gross Savings</p>
          <p className="text-2xl font-bold text-green-600">
            ${(calculations.grossSavings / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">Intervention Cost</p>
          <p className="text-2xl font-bold text-red-600">
            ${(calculations.totalInterventionCost / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-700 font-medium">Net Savings</p>
          <p className="text-2xl font-bold text-blue-600">
            ${(calculations.netSavings / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>

      {/* ROI Highlight */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-center">
        <p className="text-blue-100 text-sm font-medium mb-1">
          Return on Investment
        </p>
        <p className="text-4xl font-bold text-white">{calculations.roi}%</p>
      </div>

      {/* Methodology Note */}
      <p className="mt-4 text-xs text-gray-400 text-center">
        Based on {totalHighRiskPatients.toLocaleString()} high-risk members × 
        ${avgCostPerReadmission.toLocaleString()} avg readmission cost
      </p>
    </div>
  );
}
```

#### Risk Distribution Chart Component

**File**: `components/RiskDistributionChart.tsx`

```typescript
// components/RiskDistributionChart.tsx
'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Patient } from '@/lib/data';

interface RiskDistributionChartProps {
  patients: Patient[];
}

export default function RiskDistributionChart({ patients }: RiskDistributionChartProps) {
  // Bin patients by risk score
  const bins = [
    { range: '0-20%', min: 0, max: 20, color: '#22c55e' },
    { range: '20-40%', min: 20, max: 40, color: '#84cc16' },
    { range: '40-60%', min: 40, max: 60, color: '#eab308' },
    { range: '60-80%', min: 60, max: 80, color: '#f97316' },
    { range: '80-100%', min: 80, max: 101, color: '#ef4444' },
  ];

  const chartData = bins.map((bin) => ({
    range: bin.range,
    count: patients.filter(
      (p) => p.risk_score >= bin.min && p.risk_score < bin.max
    ).length,
    color: bin.color,
  }));

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Risk Score Distribution
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="range" 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e0e0e0' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e0e0e0' }}
            label={{ 
              value: 'Number of Patients', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#666' }
            }}
          />
          <Tooltip
            formatter={(value: number) => [value.toLocaleString(), 'Patients']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 text-center mt-4">
        Higher risk scores indicate greater likelihood of 30-day readmission
      </p>
    </div>
  );
}
```

#### Member Table Component

**File**: `components/MemberTable.tsx`

```typescript
// components/MemberTable.tsx
'use client';

import { useState, useMemo } from 'react';
import { Patient, getRiskLevel, formatCurrency } from '@/lib/data';

interface MemberTableProps {
  members: Patient[];
  initialLimit?: number;
}

export default function MemberTable({ members, initialLimit = 25 }: MemberTableProps) {
  const [sortField, setSortField] = useState<keyof Patient>('risk_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [displayCount, setDisplayCount] = useState(initialLimit);

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
  }, [members, sortField, sortOrder]);

  const displayedMembers = sortedMembers.slice(0, displayCount);

  const handleSort = (field: keyof Patient) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ field }: { field: keyof Patient }) => {
    if (field !== sortField) return <span className="text-gray-300">↕</span>;
    return sortOrder === 'desc' ? '↓' : '↑';
  };

  const getRiskBadgeStyle = (score: number) => {
    const level = getRiskLevel(score);
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">High-Risk Members</h2>
        <p className="text-sm text-gray-500 mt-1">
          Showing {displayedMembers.length} of {members.length} members
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: 'patient_id', label: 'ID' },
                { key: 'age', label: 'Age' },
                { key: 'time_in_hospital', label: 'Days Hospitalized' },
                { key: 'num_medications', label: 'Medications' },
                { key: 'number_diagnoses', label: 'Diagnoses' },
                { key: 'risk_score', label: 'Risk Score' },
                { key: 'estimated_cost', label: 'Est. Cost' },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key as keyof Patient)}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <SortIcon field={col.key as keyof Patient} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayedMembers.map((member) => (
              <tr
                key={member.patient_id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  #{member.patient_id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {member.age}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {member.time_in_hospital}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {member.num_medications}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {member.number_diagnoses}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${getRiskBadgeStyle(
                      member.risk_score
                    )}`}
                  >
                    {member.risk_score.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {formatCurrency(member.estimated_cost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {displayCount < members.length && (
        <div className="px-6 py-4 border-t border-gray-100 text-center">
          <button
            onClick={() => setDisplayCount((prev) => prev + 25)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Load more members
          </button>
        </div>
      )}
    </div>
  );
}
```

#### State Heatmap Component (Simplified - No External Map Library)

**File**: `components/StateHeatmap.tsx`

```typescript
// components/StateHeatmap.tsx
'use client';

import { useState, useMemo } from 'react';
import { StateData, formatCurrency } from '@/lib/data';

interface StateHeatmapProps {
  stateData: StateData[];
}

export default function StateHeatmap({ stateData }: StateHeatmapProps) {
  const [selectedState, setSelectedState] = useState<StateData | null>(null);
  const [sortBy, setSortBy] = useState<'rate' | 'penalty'>('rate');

  const sortedStates = useMemo(() => {
    return [...stateData].sort((a, b) => {
      if (sortBy === 'rate') {
        return b.avg_readmission_rate - a.avg_readmission_rate;
      }
      return b.total_penalty_estimate - a.total_penalty_estimate;
    });
  }, [stateData, sortBy]);

  const maxRate = Math.max(...stateData.map((s) => s.avg_readmission_rate));
  const minRate = Math.min(...stateData.map((s) => s.avg_readmission_rate));

  const getHeatColor = (rate: number) => {
    const normalized = (rate - minRate) / (maxRate - minRate);
    if (normalized > 0.8) return 'bg-red-500';
    if (normalized > 0.6) return 'bg-orange-500';
    if (normalized > 0.4) return 'bg-yellow-500';
    if (normalized > 0.2) return 'bg-lime-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          State Readmission Analysis
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('rate')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              sortBy === 'rate'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            By Rate
          </button>
          <button
            onClick={() => setSortBy('penalty')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              sortBy === 'penalty'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            By Penalty
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 text-sm">
        <span className="text-gray-500">Readmission Rate:</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>High</span>
        </div>
      </div>

      {/* State Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-6">
        {sortedStates.map((state) => (
          <button
            key={state.state}
            onClick={() => setSelectedState(state)}
            className={`
              ${getHeatColor(state.avg_readmission_rate)} 
              p-2 rounded-lg text-white text-sm font-bold
              hover:ring-2 hover:ring-blue-400 hover:ring-offset-2
              transition-all duration-200
              ${selectedState?.state === state.state ? 'ring-2 ring-blue-600 ring-offset-2' : ''}
            `}
            title={`${state.name}: ${state.avg_readmission_rate.toFixed(1)}%`}
          >
            {state.state}
          </button>
        ))}
      </div>

      {/* Selected State Details */}
      {selectedState ? (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-3">
            {selectedState.name}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Avg Readmission Rate</p>
              <p className="text-xl font-bold text-gray-900">
                {selectedState.avg_readmission_rate.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hospitals</p>
              <p className="text-xl font-bold text-gray-900">
                {selectedState.hospital_count.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Est. Total Penalty</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(selectedState.total_penalty_estimate)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
          Click a state to see details
        </div>
      )}
    </div>
  );
}
```

#### Loading Spinner Component

**File**: `components/LoadingSpinner.tsx`

```typescript
// components/LoadingSpinner.tsx

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
```

### 5.6 Page Files

#### Root Layout

**File**: `app/layout.tsx`

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ReadmitRisk - Hospital Readmissions Dashboard',
  description: 'Care management risk stratification platform for reducing preventable 30-day hospital readmissions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <footer className="bg-white border-t py-6 text-center text-sm text-gray-500">
          <p>Built with Python, Scikit-learn, Next.js, and Recharts</p>
          <p className="mt-1">
            <a 
              href="https://github.com/yourusername/readmissions-project" 
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
```

#### Landing Page

**File**: `app/page.tsx`

```typescript
// app/page.tsx
import Link from 'next/link';
import { riskSummary, formatCurrency } from '@/lib/data';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <h1 className="text-5xl font-bold mb-6">
            Care Management Readmissions Dashboard
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl">
            Identify high-risk members and reduce preventable 30-day hospital 
            readmissions using predictive analytics and data-driven insights.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
          >
            Explore Dashboard →
          </Link>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">The Challenge</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Hospital readmissions within 30 days cost Medicare over{' '}
                <strong className="text-gray-900">$17 billion annually</strong>. 
                Health plans face penalties and poor quality ratings when 
                readmission rates exceed benchmarks.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Care management teams need to prioritize which members receive 
                post-discharge interventions to maximize impact with limited resources.
              </p>
            </div>
            <div className="bg-red-50 rounded-xl p-6">
              <h3 className="font-bold text-red-800 mb-4">Cost Impact</h3>
              <ul className="space-y-3 text-red-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  Average readmission cost: $15,000+
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  CMS penalties up to 3% of Medicare payments
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  HEDIS scores impact Star Ratings
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  Member health deterioration
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Findings */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Insights</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {riskSummary.readmission_rate_overall.toFixed(1)}%
              </p>
              <p className="text-gray-600">Readmission Rate</p>
            </div>
            <div className="text-center p-4">
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {riskSummary.high_risk_count.toLocaleString()}
              </p>
              <p className="text-gray-600">High-Risk Members</p>
            </div>
            <div className="text-center p-4">
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {formatCurrency(riskSummary.total_cost_exposure)}
              </p>
              <p className="text-gray-600">Cost Exposure</p>
            </div>
            <div className="text-center p-4">
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {(riskSummary.model_auc * 100).toFixed(0)}%
              </p>
              <p className="text-gray-600">Model AUC</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View Full Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
```

#### Dashboard Page

**File**: `app/dashboard/page.tsx`

```typescript
// app/dashboard/page.tsx
import KPICard from '@/components/KPICard';
import SavingsCalculator from '@/components/SavingsCalculator';
import RiskDistributionChart from '@/components/RiskDistributionChart';
import MemberTable from '@/components/MemberTable';
import { patientRisks, riskSummary, formatCurrency } from '@/lib/data';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Real-time risk stratification and intervention planning
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="High-Risk Members"
          value={riskSummary.high_risk_count.toLocaleString()}
          subtitle="Requiring intervention"
        />
        <KPICard
          title="Total Cost Exposure"
          value={formatCurrency(riskSummary.total_cost_exposure)}
          subtitle="Preventable readmission costs"
        />
        <KPICard
          title="Average Risk Score"
          value={`${riskSummary.avg_risk_score.toFixed(1)}%`}
          subtitle="Across high-risk cohort"
        />
        <KPICard
          title="Model Performance"
          value={`${(riskSummary.model_auc * 100).toFixed(0)}%`}
          subtitle="ROC-AUC score"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RiskDistributionChart patients={patientRisks} />
        <SavingsCalculator
          totalHighRiskPatients={riskSummary.high_risk_count}
          avgCostPerReadmission={15000}
        />
      </div>

      {/* Member Table (limited view) */}
      <MemberTable members={patientRisks} initialLimit={10} />
    </div>
  );
}
```

#### Members Page

**File**: `app/members/page.tsx`

```typescript
// app/members/page.tsx
import MemberTable from '@/components/MemberTable';
import { patientRisks, riskSummary } from '@/lib/data';

export default function MembersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Member Risk List</h1>
        <p className="text-gray-500 mt-1">
          Complete list of {riskSummary.high_risk_count.toLocaleString()} high-risk 
          members sorted by risk score
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Avg Risk Score</p>
          <p className="text-2xl font-bold">{riskSummary.avg_risk_score.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Median Risk Score</p>
          <p className="text-2xl font-bold">{riskSummary.median_risk_score.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Critical (80%+)</p>
          <p className="text-2xl font-bold text-red-600">
            {patientRisks.filter(p => p.risk_score >= 80).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">High (60-80%)</p>
          <p className="text-2xl font-bold text-orange-600">
            {patientRisks.filter(p => p.risk_score >= 60 && p.risk_score < 80).length}
          </p>
        </div>
      </div>

      {/* Full Member Table */}
      <MemberTable members={patientRisks} initialLimit={50} />
    </div>
  );
}
```

#### Geography Page

**File**: `app/geography/page.tsx`

```typescript
// app/geography/page.tsx
import StateHeatmap from '@/components/StateHeatmap';
import { stateSummary, hospitalMetrics, formatCurrency } from '@/lib/data';

export default function GeographyPage() {
  // Calculate national stats
  const totalHospitals = stateSummary.reduce((sum, s) => sum + s.hospital_count, 0);
  const totalPenalties = stateSummary.reduce((sum, s) => sum + s.total_penalty_estimate, 0);
  const avgRate = stateSummary.reduce((sum, s) => sum + s.avg_readmission_rate, 0) / stateSummary.length;

  // Top 10 hospitals by readmission rate
  const topHospitals = [...hospitalMetrics]
    .sort((a, b) => b.readmission_rate - a.readmission_rate)
    .slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Geographic Analysis</h1>
        <p className="text-gray-500 mt-1">
          State-by-state readmission rates and provider network performance
        </p>
      </div>

      {/* National Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">States Analyzed</p>
          <p className="text-2xl font-bold">{stateSummary.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Total Hospitals</p>
          <p className="text-2xl font-bold">{totalHospitals.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">National Avg Rate</p>
          <p className="text-2xl font-bold">{avgRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Est. Total Penalties</p>
          <p className="text-2xl font-bold">{formatCurrency(totalPenalties)}</p>
        </div>
      </div>

      {/* State Heatmap */}
      <div className="mb-8">
        <StateHeatmap stateData={stateSummary} />
      </div>

      {/* Top Hospitals Table */}
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Highest Readmission Rate Hospitals
          </h2>
          <p className="text-sm text-gray-500">Top 10 hospitals requiring attention</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Hospital
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Readmission Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Penalty %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {topHospitals.map((hospital, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {hospital.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {hospital.city}, {hospital.state}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                      {hospital.readmission_rate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {hospital.penalty_pct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

### 5.7 TypeScript Configuration

**File**: `tsconfig.json` (update the paths section)

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 6. Phase 4: Deployment & Documentation

### 6.1 Deploy to Vercel

```bash
# From dashboard directory
cd dashboard

# Option 1: Using Vercel CLI
npm i -g vercel
vercel login
vercel --prod

# Option 2: Connect GitHub repo to Vercel
# 1. Push code to GitHub
# 2. Go to vercel.com
# 3. Import repository
# 4. Vercel auto-detects Next.js and deploys
```

### 6.2 GitHub Repository Setup

```bash
# From project root (hospital-readmissions-project)
cd ..

# Initialize git
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# Python
venv/
__pycache__/
*.pyc
.ipynb_checkpoints/

# Node
node_modules/
.next/
.vercel/

# Environment
.env
.env.local

# OS
.DS_Store
Thumbs.db

# Data (optional - include processed, exclude raw if large)
# data/raw/
EOF

# Add files
git add .

# Commit
git commit -m "Initial commit: Hospital readmissions analysis platform"

# Add remote and push
git remote add origin https://github.com/yourusername/hospital-readmissions-project.git
git branch -M main
git push -u origin main
```

### 6.3 README Template

**File**: `README.md`

```markdown
# Care Management Readmissions Dashboard

A predictive analytics platform that identifies high-risk members for post-discharge intervention, helping health plans reduce preventable 30-day hospital readmissions.

## 🎯 Business Problem

Hospital readmissions cost Medicare **$17+ billion annually**. Health plans face:
- CMS penalties for high readmission rates (up to 3% of Medicare payments)
- Poor HEDIS quality scores affecting Star Ratings
- Member health deterioration and increased costs

Care management teams need to **prioritize limited resources** on members most likely to benefit from intervention.

## 💡 Solution

This platform combines:
1. **Patient-level risk prediction** - ML model identifies high-risk members
2. **ROI calculator** - Quantifies financial impact of intervention strategies  
3. **Geographic analysis** - Identifies provider network hotspots

## 📊 Key Findings

| Metric | Value |
|--------|-------|
| Overall readmission rate | 11.2% |
| High-risk members identified | 1,000 |
| Total cost exposure | $15M+ |
| Model ROC-AUC | 0.68 |
| Projected ROI at 25% effectiveness | 300%+ |

## 🛠️ Technical Stack

**Data Analysis:**
- Python 3.11+
- Pandas, NumPy, Scikit-learn
- SMOTE for class imbalance handling
- Jupyter Notebooks

**Web Dashboard:**
- Next.js 14 (React, TypeScript)
- Tailwind CSS
- Recharts for visualizations
- Vercel (hosting)

**Data Sources:**
- UCI Diabetes 130-US Hospitals dataset (100K+ patient encounters)
- CMS Hospital Readmissions Reduction Program data

## 🚀 Live Demo

**Dashboard**: [https://your-app.vercel.app](https://your-app.vercel.app)

## 📁 Project Structure

```
hospital-readmissions-project/
├── notebooks/           # Jupyter analysis notebooks
│   ├── 01_data_exploration.ipynb
│   ├── 02_patient_risk_modeling.ipynb
│   └── 03_hospital_analytics.ipynb
├── data/               
│   ├── raw/            # Source datasets
│   └── processed/      # Generated JSON files
├── dashboard/          # Next.js web application
└── README.md
```

## 🔍 Methodology

1. **Data Cleaning**: Handled missing values, encoded categorical variables, deduplicated patients
2. **Feature Engineering**: Created risk indicators from clinical data (medication changes, visit history, etc.)
3. **Class Imbalance**: Applied SMOTE to address 11% readmission rate imbalance
4. **Modeling**: Logistic regression for interpretability (ROC-AUC: 0.68)
5. **Deployment**: Pre-computed risk scores exported as static JSON for fast dashboard performance

## 💼 Business Impact

For a health plan with 100,000 Medicare Advantage members:

| Scenario | Value |
|----------|-------|
| At-risk members identified | 11,000 |
| Intervention effectiveness | 25% |
| Readmissions prevented | 2,750 |
| Gross savings | $41.25M |
| Intervention cost | $1.1M |
| Net savings | $40.15M |
| **ROI** | **3,650%** |

## 🎓 Skills Demonstrated

- Healthcare analytics & domain knowledge
- Predictive modeling (classification with imbalanced data)
- Data visualization & business storytelling
- Full-stack web development (React/Next.js)
- Business value quantification

## 🏃 Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/hospital-readmissions-project.git
cd hospital-readmissions-project

# Set up Python environment
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run notebooks (in order)
jupyter notebook

# Start dashboard locally
cd dashboard
npm install
npm run dev
```

## 📧 Contact

**Your Name** - [your.email@example.com](mailto:your.email@example.com) - [LinkedIn](https://linkedin.com/in/yourprofile)

---

*This project uses historical clinical data (1999-2008) as a modeling sandbox to demonstrate analytical methodology. In production, this methodology would be applied to current claims data from the health plan's data warehouse.*
```

---

## 7. Phase 5: Portfolio Integration

### 7.1 Create Portfolio Project Card

Use these details for your portfolio website:

**Title**: Care Management Readmissions Dashboard

**One-Liner**: Built a risk stratification platform that identifies $15M+ in preventable readmission costs across 1,000+ high-risk members using predictive analytics.

**Tags**: `Healthcare Analytics` `Machine Learning` `Data Visualization` `React` `Python` `Next.js`

**Links**:
- Live Demo: [Vercel URL]
- GitHub: [Repository URL]

### 7.2 Interview Preparation

**Elevator Pitch (30 seconds)**:
> "I built a care management dashboard that helps health plans identify which patients are most likely to be readmitted within 30 days. Using machine learning on 100,000+ patient records, the system predicts risk scores and calculates ROI for different intervention strategies. The dashboard shows that targeting high-risk members with a 25% effective intervention program could save over $40 million annually."

**Technical Deep Dive Questions**:

| Question | Answer |
|----------|--------|
| Why logistic regression over more complex models? | Interpretability is critical in healthcare - stakeholders need to understand why a patient is flagged as high-risk. Logistic regression coefficients directly show risk factors. |
| How did you handle class imbalance? | Used SMOTE (Synthetic Minority Oversampling Technique) on training data only to avoid data leakage. Also considered class weights but SMOTE performed better in cross-validation. |
| Why pre-compute everything vs. real-time API? | For a portfolio demo, pre-computed data means zero cold starts, free hosting, and reliable demos. In production, you'd connect to a data warehouse with scheduled batch scoring. |
| What would you do differently in production? | Add A/B testing for interventions, integrate with EHR systems, add member contact information, implement proper authentication, and use a real-time scoring API. |

**For Centene Specifically**:
> "This approach is directly applicable to Centene's Medicare Advantage and Medicaid populations. The dashboard could integrate with your care management workflows to prioritize member outreach, and the ROI calculator helps justify intervention program investments to leadership."

---

## 8. Appendix: Troubleshooting

### 8.1 Common Issues

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: imblearn` | Run `pip install imbalanced-learn` |
| JSON import error in Next.js | Ensure JSON files are in `lib/` not `public/`, and `resolveJsonModule: true` is in tsconfig |
| Vercel build fails | Check that all imports resolve, no missing dependencies in package.json |
| Charts not rendering | Ensure Recharts is installed: `npm install recharts` |
| Type errors on JSON imports | Create type definitions in `lib/data.ts` as shown |

### 8.2 Data Validation Checklist

Before building the dashboard, verify:

```python
# Run in Python to validate exports
import json
import os

files = [
    'data/processed/patient_risks.json',
    'data/processed/risk_summary.json',
    'data/processed/state_summary.json', 
    'data/processed/hospital_metrics.json'
]

for f in files:
    if os.path.exists(f):
        with open(f) as file:
            data = json.load(file)
            if isinstance(data, list):
                print(f"✓ {f}: {len(data)} records")
            else:
                print(f"✓ {f}: {len(data.keys())} keys")
    else:
        print(f"✗ {f}: MISSING")
```

### 8.3 Timeline Estimate

| Phase | Duration | Hours/Day |
|-------|----------|-----------|
| Phase 1: Setup | 1 day | 2-3 |
| Phase 2: Analysis | 4-5 days | 2-3 |
| Phase 3: Dashboard | 5-6 days | 2-3 |
| Phase 4: Deploy | 1 day | 2 |
| Phase 5: Polish | 1-2 days | 2 |
| **Total** | **12-15 days** | **2-3 hrs/day** |

---

## Document Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Original | Initial SOP |
| 2.0 | January 2026 | Fixed patient_nbr bug, corrected Next.js data imports, added all missing components, implemented class imbalance handling, added comprehensive error handling and types |

---

**END OF SOP**
