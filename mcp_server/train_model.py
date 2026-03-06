"""Train and save ML models for the predict_risk MCP tool.

Usage:
    python -m mcp_server.train_model          # Train both
    python -m mcp_server.train_model --uci    # UCI only
    python -m mcp_server.train_model --mimic  # MIMIC only

These models use ONLY the numeric features that predict_risk can accept,
so predictions respond correctly to changes in age, medications, visits, etc.
"""

import argparse
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = Path(__file__).resolve().parent / "models"

# The numeric features predict_risk exposes as parameters.
# No derived/redundant features — avoids multicollinearity.
PREDICT_FEATURES = [
    "age_numeric",
    "time_in_hospital",
    "num_medications",
    "number_diagnoses",
    "number_inpatient",
    "number_emergency",
    "number_outpatient",
    "num_lab_procedures",
    "num_procedures",
]


def train_uci() -> None:
    """Train a numeric-only UCI model for predict_risk."""
    print("=" * 60)
    print("Training UCI Diabetes model (numeric-only)")
    print("=" * 60)

    csv_path = PROJECT_ROOT / "data" / "raw" / "diabetic_data.csv"
    if not csv_path.exists():
        print(f"ERROR: {csv_path} not found. Skipping UCI training.")
        return

    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df):,} records")

    df = df.replace("?", np.nan)
    df["readmitted_30day"] = (df["readmitted"] == "<30").astype(int)

    df = df.sort_values("encounter_id").drop_duplicates(
        subset=["patient_nbr"], keep="first"
    )
    print(f"After deduplication: {len(df):,} patients")

    # Feature engineering
    age_mapping = {
        "[0-10)": 5, "[10-20)": 15, "[20-30)": 25, "[30-40)": 35,
        "[40-50)": 45, "[50-60)": 55, "[60-70)": 65, "[70-80)": 75,
        "[80-90)": 85, "[90-100)": 95,
    }
    df["age_numeric"] = df["age"].map(age_mapping)

    feature_cols = [f for f in PREDICT_FEATURES if f in df.columns]
    X = df[feature_cols].fillna(0).replace([np.inf, -np.inf], 0)
    y = df["readmitted_30day"]

    print(f"Features: {feature_cols}")
    print(f"Readmission rate: {y.mean()*100:.2f}%")

    _train_and_save(X, y, feature_cols, "uci")


def train_mimic() -> None:
    """Train a MIMIC model for predict_risk using clinically relevant features."""
    print("=" * 60)
    print("Training MIMIC-IV model")
    print("=" * 60)

    parquet_path = PROJECT_ROOT / "data" / "mimic_processed" / "mimic_features_latest.parquet"
    if not parquet_path.exists():
        print(f"ERROR: {parquet_path} not found. Skipping MIMIC training.")
        return

    df = pd.read_parquet(parquet_path)
    print(f"Loaded {len(df):,} admissions")

    # Rename MIMIC columns to match predict_risk parameter names
    df = df.rename(columns={
        "medication_count": "num_medications",
        "procedure_count": "num_procedures",
    })

    # Use predict_risk base features + clinically relevant MIMIC features
    mimic_features = [
        # predict_risk base params (mapped above)
        "age_numeric",
        "num_medications",
        "num_procedures",
        # MIMIC-specific ICU/stay features
        "icu_los_days",
        "icu_count",
        # MIMIC-specific (available via additional_features)
        "had_mechanical_vent",
        "polypharmacy",
        "creatinine_max",
        "bilirubin_max",
        "lactate_max",
        "glucose_max",
        "wbc_max",
        "hgb_min",
        "vital_instability",
        "high_acuity_flag",
        "had_hypotension",
        "had_hypoxia",
        "elevated_creatinine",
    ]
    feature_cols = [f for f in mimic_features if f in df.columns]
    X = df[feature_cols].fillna(0).replace([np.inf, -np.inf], 0)
    y = df["readmitted_30day"]

    print(f"Features: {feature_cols}")
    print(f"Readmission rate: {y.mean()*100:.2f}%")

    # Save feature defaults (population medians) for unspecified features
    defaults = X.median().to_dict()
    (MODELS_DIR / "mimic_feature_defaults.json").write_text(
        json.dumps(defaults), encoding="utf-8"
    )

    _train_and_save(X, y, feature_cols, "mimic")


def _train_and_save(
    X: pd.DataFrame,
    y: pd.Series,
    feature_cols: list[str],
    prefix: str,
) -> None:
    """Train GradientBoosting, build calibration CDF, save artifacts."""

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # No SMOTE — natural class distribution avoids distorting feature relationships.
    model = GradientBoostingClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=4,
        min_samples_leaf=50,
        subsample=0.8,
        random_state=42,
        verbose=0,
    )
    model.fit(X_train_scaled, y_train)

    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
    auc = roc_auc_score(y_test, y_pred_proba)
    print(f"ROC-AUC: {auc:.4f}")

    # Feature importances
    for feat, imp in sorted(
        zip(feature_cols, model.feature_importances_), key=lambda x: -x[1]
    ):
        print(f"  {feat:25s}: {imp:.4f}")

    # Build calibration CDF from the full training population.
    # No profile averaging needed — model uses only the features we provide.
    X_all_scaled = scaler.transform(X)
    all_probs = model.predict_proba(X_all_scaled)[:, 1]
    percentile_grid = np.linspace(0, 100, 1001)
    calibration = np.percentile(all_probs, percentile_grid).tolist()
    print(f"Calibration range: {all_probs.min():.4f} – {all_probs.max():.4f}")

    # Save artifacts
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODELS_DIR / f"{prefix}_model.joblib")
    joblib.dump(scaler, MODELS_DIR / f"{prefix}_scaler.joblib")
    (MODELS_DIR / f"{prefix}_feature_columns.json").write_text(
        json.dumps(feature_cols), encoding="utf-8"
    )
    (MODELS_DIR / f"{prefix}_calibration.json").write_text(
        json.dumps(calibration), encoding="utf-8"
    )
    print(f"Saved {prefix} model artifacts to {MODELS_DIR}")
    print(f"  Features: {len(feature_cols)}")


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
