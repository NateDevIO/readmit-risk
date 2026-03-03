"""Train and save ML models for the predict_risk MCP tool.

Usage:
    python -m mcp_server.train_model          # Train both
    python -m mcp_server.train_model --uci    # UCI only
    python -m mcp_server.train_model --mimic  # MIMIC only
"""

import argparse
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = Path(__file__).resolve().parent / "models"


def train_uci() -> None:
    """Replicate the UCI training pipeline from run_analysis_v2.py."""
    print("=" * 60)
    print("Training UCI Diabetes model")
    print("=" * 60)

    csv_path = PROJECT_ROOT / "data" / "raw" / "diabetic_data.csv"
    if not csv_path.exists():
        print(f"ERROR: {csv_path} not found. Skipping UCI training.")
        return

    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df):,} records")

    # Replace '?' with NaN
    df = df.replace("?", np.nan)

    # Binary target
    df["readmitted_30day"] = (df["readmitted"] == "<30").astype(int)

    # Deduplicate patients (keep first encounter)
    df = df.sort_values("encounter_id").drop_duplicates(
        subset=["patient_nbr"], keep="first"
    )
    print(f"After deduplication: {len(df):,} patients")

    # Drop identifiers and high-missing columns
    df = df.drop(columns=["encounter_id", "patient_nbr"])
    df = df.drop(columns=["weight", "payer_code", "medical_specialty"])

    # Age mapping
    age_mapping = {
        "[0-10)": 5, "[10-20)": 15, "[20-30)": 25, "[30-40)": 35,
        "[40-50)": 45, "[50-60)": 55, "[60-70)": 65, "[70-80)": 75,
        "[80-90)": 85, "[90-100)": 95,
    }
    df["age_numeric"] = df["age"].map(age_mapping)

    # Engineered features
    df["total_visits"] = (
        df["number_outpatient"] + df["number_emergency"] + df["number_inpatient"]
    )
    df["medication_intensity"] = df["num_medications"] / (df["time_in_hospital"] + 1)

    med_cols = [
        "metformin", "repaglinide", "nateglinide", "chlorpropamide",
        "glimepiride", "acetohexamide", "glipizide", "glyburide",
        "tolbutamide", "pioglitazone", "rosiglitazone", "acarbose",
        "miglitol", "troglitazone", "tolazamide", "insulin",
        "glyburide-metformin", "glipizide-metformin",
    ]
    df["num_med_changes"] = df.apply(
        lambda row: sum(
            1 for col in med_cols if col in row.index and row[col] in ["Up", "Down"]
        ),
        axis=1,
    )
    df["A1Cresult_abnormal"] = df["A1Cresult"].apply(
        lambda x: 1 if x in [">7", ">8"] else 0
    )

    # Feature selection
    numeric_features = [
        "time_in_hospital", "num_lab_procedures", "num_procedures",
        "num_medications", "number_outpatient", "number_emergency",
        "number_inpatient", "number_diagnoses", "age_numeric",
        "total_visits", "medication_intensity", "num_med_changes",
    ]
    categorical_features = [
        "race", "gender", "admission_type_id", "discharge_disposition_id",
        "admission_source_id", "diabetesMed", "change", "A1Cresult_abnormal",
    ]

    keep_cols = numeric_features + categorical_features + ["readmitted_30day"]
    df_model = df[keep_cols].copy()

    # Handle missing values
    for col in numeric_features:
        if df_model[col].isnull().any():
            df_model[col] = df_model[col].fillna(df_model[col].median())
    for col in categorical_features:
        if df_model[col].isnull().any():
            df_model[col] = df_model[col].fillna("Unknown")

    # One-hot encode
    df_encoded = pd.get_dummies(
        df_model, columns=categorical_features, drop_first=True
    )

    feature_cols = [c for c in df_encoded.columns if c != "readmitted_30day"]
    X = df_encoded[feature_cols]
    y = df_encoded["readmitted_30day"]

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # SMOTE
    smote = SMOTE(random_state=42)
    X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)
    print(f"Training samples after SMOTE: {len(X_train_balanced):,}")

    # Scale and train
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_balanced)
    X_test_scaled = scaler.transform(X_test)

    model = LogisticRegression(max_iter=1000, random_state=42, C=0.1)
    model.fit(X_train_scaled, y_train_balanced)

    # Evaluate
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
    auc = roc_auc_score(y_test, y_pred_proba)
    print(f"ROC-AUC: {auc:.4f}")

    # Save artifacts
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODELS_DIR / "uci_model.joblib")
    joblib.dump(scaler, MODELS_DIR / "uci_scaler.joblib")
    (MODELS_DIR / "uci_feature_columns.json").write_text(
        json.dumps(feature_cols), encoding="utf-8"
    )
    print(f"Saved UCI model artifacts to {MODELS_DIR}")
    print(f"  Features: {len(feature_cols)}")


def train_mimic() -> None:
    """Replicate the MIMIC training pipeline from generate_full_mimic_dashboard_data.py."""
    print("=" * 60)
    print("Training MIMIC-IV model")
    print("=" * 60)

    parquet_path = PROJECT_ROOT / "data" / "mimic_processed" / "mimic_features_latest.parquet"
    if not parquet_path.exists():
        print(f"ERROR: {parquet_path} not found. Skipping MIMIC training.")
        return

    df = pd.read_parquet(parquet_path)
    print(f"Loaded {len(df):,} admissions")

    # Exclude non-feature columns
    exclude_cols = [
        "hadm_id", "readmitted_30day", "subject_id", "admittime", "dischtime",
        "gender", "race", "insurance", "marital_status", "language",
        "admission_type", "admission_location", "discharge_location",
        "days_to_readmission", "next_hadm_id",
    ]
    feature_cols = [c for c in df.columns if c not in exclude_cols]

    # Numeric features only
    X = df[feature_cols].select_dtypes(include=[np.number]).fillna(0)
    X = X.replace([np.inf, -np.inf], 0)
    y = df["readmitted_30day"]

    actual_feature_cols = list(X.columns)
    print(f"Features: {len(actual_feature_cols)}")
    print(f"Readmission rate: {y.mean()*100:.2f}%")

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Scale
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # SMOTE
    smote = SMOTE(random_state=42)
    X_train_balanced, y_train_balanced = smote.fit_resample(X_train_scaled, y_train)
    print(f"Training samples after SMOTE: {len(X_train_balanced):,}")

    # Train model
    model = GradientBoostingClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42,
        verbose=0,
    )
    model.fit(X_train_balanced, y_train_balanced)

    # Evaluate
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
    auc = roc_auc_score(y_test, y_pred_proba)
    print(f"ROC-AUC: {auc:.4f}")

    # Save artifacts
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODELS_DIR / "mimic_model.joblib")
    joblib.dump(scaler, MODELS_DIR / "mimic_scaler.joblib")
    (MODELS_DIR / "mimic_feature_columns.json").write_text(
        json.dumps(actual_feature_cols), encoding="utf-8"
    )
    print(f"Saved MIMIC model artifacts to {MODELS_DIR}")
    print(f"  Features: {len(actual_feature_cols)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train ReadmitRisk ML models")
    parser.add_argument("--uci", action="store_true", help="Train UCI model only")
    parser.add_argument("--mimic", action="store_true", help="Train MIMIC model only")
    args = parser.parse_args()

    # If neither flag is set, train both
    train_both = not args.uci and not args.mimic

    if args.uci or train_both:
        train_uci()
        print()

    if args.mimic or train_both:
        train_mimic()

    print("\nDone.")
