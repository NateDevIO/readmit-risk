"""ReadmitRisk MCP Server — exposes patient risk data and ML models as tools."""

import json
import os
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings

from .data_loader import store

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = Path(__file__).resolve().parent / "models"

mcp = FastMCP(
    "ReadmitRisk",
    instructions=(
        "Hospital readmission risk analytics for UCI Diabetes (71K patients) "
        "and MIMIC-IV (211K admissions). Query patient risk scores, hospital "
        "metrics, feature importance, and run live predictions.\n\n"
        "Known limitations:\n"
        "- UCI model AUC is 0.56 (barely above random). Scores are useful "
        "for relative ranking but are not clinically validated predictions.\n"
        "- MIMIC model AUC is 0.63 — better but still modest.\n"
        "- UCI age values are decade-bucket midpoints (5, 15, 25...), not "
        "exact ages. The original data uses ranges like [0-10).\n"
        "- The two datasets use different algorithms and feature sets, so "
        "cross-dataset score comparisons should be interpreted carefully.\n"
        "- predict_risk uses a numeric-only model and quantile-maps its "
        "output to match the stored-score distribution. Scores approximate "
        "but may not exactly match pre-computed patient lookups."
    ),
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_stored_score_cdf(summary: dict) -> tuple[list[float], list[float]]:
    """Build a CDF from the pre-computed risk distribution.

    Returns (cumulative_percentiles, score_boundaries) for use with
    np.interp to map a percentile rank to the stored-score scale.
    """
    dist = summary.get("risk_distribution", {})
    high_dist = summary.get("high_risk_distribution", {})
    total = summary.get("total_patients", 1)

    cum_pct = [0.0]
    scores = [0.0]

    # Coarse bins 0-60
    cum = 0.0
    for label, hi in [("0-20%", 20), ("20-40%", 40), ("40-60%", 60)]:
        cum += dist.get(label, 0) / total * 100
        cum_pct.append(cum)
        scores.append(hi)

    # Fine bins 60-100
    for label, hi in [("60-70%", 70), ("70-80%", 80), ("80-90%", 90), ("90-100%", 100)]:
        cum += high_dist.get(label, 0) / total * 100
        cum_pct.append(cum)
        scores.append(hi)

    return cum_pct, scores


def _risk_tier(score: float) -> str:
    if score >= 80:
        return "Critical"
    if score >= 70:
        return "Very High"
    if score >= 60:
        return "High"
    if score >= 40:
        return "Moderate"
    return "Low"


def _df_to_json(df: pd.DataFrame, limit: int | None = None) -> str:
    if limit is not None:
        df = df.head(limit)
    return df.to_json(orient="records", default_handler=str)


def _validate_dataset(dataset: str) -> str:
    d = dataset.strip().lower()
    if d not in ("uci", "mimic", "both"):
        raise ValueError(f"dataset must be 'uci', 'mimic', or 'both' — got '{dataset}'")
    return d


# ---------------------------------------------------------------------------
# Tools
# ---------------------------------------------------------------------------


@mcp.tool()
def get_patient_risk_score(patient_id: int, dataset: str = "uci") -> str:
    """Look up the risk score, tier, estimated cost, and contributing factors
    for a specific patient.

    Args:
        patient_id: The patient identifier (patient_id for UCI, subject_id for MIMIC).
        dataset: Which dataset to search — "uci" or "mimic".
    """
    ds = _validate_dataset(dataset)
    if ds == "both":
        raise ValueError("Specify 'uci' or 'mimic', not 'both'.")

    df = store.patient_risks(ds)
    matches = df[df["patient_id"] == patient_id]

    if matches.empty:
        summary = store.risk_summary_for(ds)
        return json.dumps({
            "error": f"Patient {patient_id} not found in {ds} high-risk dataset.",
            "note": (
                "Only patients with risk scores >= 60% are stored in the "
                "pre-computed files. This patient may exist with a lower score."
            ),
            "total_patients_in_dataset": summary.get("total_patients"),
            "high_risk_count": summary.get("high_risk_count"),
        })

    # MIMIC patients can have multiple admissions
    records = []
    for _, row in matches.iterrows():
        rec: dict = row.to_dict()
        rec["risk_tier"] = _risk_tier(rec["risk_score"])
        records.append(rec)

    # Attach top risk factors from summary
    summary = store.risk_summary_for(ds)
    risk_factors = summary.get("risk_factors", [])[:5]

    result = {
        "patient_id": patient_id,
        "dataset": ds,
        "admissions": records if len(records) > 1 else records[0],
        "top_risk_factors": risk_factors,
    }
    return json.dumps(result, default=str)


@mcp.tool()
def get_high_risk_patients(
    dataset: str = "uci",
    threshold: float = 80.0,
    limit: int = 20,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None,
) -> str:
    """Return patients above a risk-score threshold, sorted highest first.

    Args:
        dataset: "uci" or "mimic".
        threshold: Minimum risk score (0-100). Default 80.
        limit: Max rows to return (default 20).
        min_age: Optional lower bound on patient age.
        max_age: Optional upper bound on patient age.
    """
    ds = _validate_dataset(dataset)
    if ds == "both":
        raise ValueError("Specify 'uci' or 'mimic', not 'both'.")

    df = store.patient_risks(ds)
    filtered = df[df["risk_score"] >= threshold]

    if "age" in filtered.columns:
        if min_age is not None:
            filtered = filtered[filtered["age"] >= min_age]
        if max_age is not None:
            filtered = filtered[filtered["age"] <= max_age]

    filtered = filtered.sort_values("risk_score", ascending=False)
    total_matching = len(filtered)
    filtered = filtered.head(limit)

    # Add tier column
    filtered = filtered.copy()
    filtered["risk_tier"] = filtered["risk_score"].apply(_risk_tier)

    return json.dumps({
        "dataset": ds,
        "threshold": threshold,
        "total_matching": total_matching,
        "returned": len(filtered),
        "patients": json.loads(_df_to_json(filtered)),
    }, default=str)


@mcp.tool()
def get_hospital_metrics(
    hospital_name: Optional[str] = None,
    state: Optional[str] = None,
    limit: int = 20,
) -> str:
    """Query hospital readmission performance metrics.

    Returns hospital-level readmission rates, CMS penalties, and optional
    state-level summary when a state filter is used.

    Args:
        hospital_name: Partial name to search (case-insensitive).
        state: Two-letter state code to filter by.
        limit: Max hospitals to return (default 20).
    """
    df = store.hospital_metrics

    if hospital_name:
        mask = df["name"].str.contains(hospital_name, case=False, na=False)
        df = df[mask]

    if state:
        state_upper = state.strip().upper()
        df = df[df["state"] == state_upper]

    total_matching = len(df)
    hospitals = json.loads(_df_to_json(df, limit=limit))

    result: dict = {
        "total_matching": total_matching,
        "returned": len(hospitals),
        "hospitals": hospitals,
    }

    # Include state-level summary when a state filter is used
    if state:
        state_upper = state.strip().upper()
        state_df = store.state_summary
        state_match = state_df[state_df["state"] == state_upper]
        if not state_match.empty:
            result["state_summary"] = json.loads(
                state_match.to_json(orient="records", default_handler=str)
            )[0]

    return json.dumps(result, default=str)


@mcp.tool()
def get_risk_distribution(dataset: str = "uci") -> str:
    """Get pre-computed risk-score distribution, tier counts, age breakdowns,
    and cost-by-tier data.

    Args:
        dataset: "uci", "mimic", or "both" for side-by-side.
    """
    ds = _validate_dataset(dataset)

    def _extract(summary: dict, label: str) -> dict:
        return {
            "dataset": label,
            "total_patients": summary.get("total_patients"),
            "high_risk_count": summary.get("high_risk_count"),
            "readmission_rate_overall": summary.get("readmission_rate_overall")
                or summary.get("readmission_rate"),
            "avg_risk_score": summary.get("avg_risk_score"),
            "median_risk_score": summary.get("median_risk_score"),
            "risk_distribution": summary.get("risk_distribution"),
            "high_risk_distribution": summary.get("high_risk_distribution"),
            "avg_risk_by_age": summary.get("avg_risk_by_age"),
            "cost_by_tier": summary.get("cost_by_tier"),
            "model_auc": summary.get("model_auc"),
            "critical_count": summary.get("critical_count"),
            "very_high_count": summary.get("very_high_count"),
            "high_count": summary.get("high_count"),
        }

    if ds == "both":
        return json.dumps({
            "uci": _extract(store.risk_summary, "uci"),
            "mimic": _extract(store.risk_summary_mimic, "mimic"),
        }, default=str)

    summary = store.risk_summary_for(ds)
    return json.dumps(_extract(summary, ds), default=str)


@mcp.tool()
def compare_datasets() -> str:
    """Side-by-side comparison of UCI vs MIMIC-IV datasets.

    Returns key metrics, model performance, risk-factor rankings, and a
    structured comparison table from the CSV report.
    """
    uci = store.risk_summary
    mimic = store.risk_summary_mimic

    comparison_table = json.loads(
        store.dataset_comparison.to_json(orient="records", default_handler=str)
    )

    uci_factors = uci.get("risk_factors", [])[:5]
    mimic_factors = mimic.get("risk_factors", [])[:5]

    return json.dumps({
        "comparison_table": comparison_table,
        "uci_summary": {
            "total_patients": uci.get("total_patients"),
            "readmission_rate": uci.get("readmission_rate_overall"),
            "model_auc": uci.get("model_auc"),
            "avg_risk_score": uci.get("avg_risk_score"),
            "top_risk_factors": uci_factors,
        },
        "mimic_summary": {
            "total_patients": mimic.get("total_patients"),
            "readmission_rate": mimic.get("readmission_rate_overall")
                or mimic.get("readmission_rate"),
            "model_auc": mimic.get("model_auc"),
            "avg_risk_score": mimic.get("avg_risk_score"),
            "top_risk_factors": mimic_factors,
        },
        "key_differences": [
            "MIMIC-IV has 3x more patients (211K vs 72K).",
            "MIMIC readmission rate is much higher (20.5% vs 8.8%).",
            "Pre-computed scores: UCI uses LogisticRegression, MIMIC uses GradientBoosting.",
            "MIMIC-IV has richer features (labs, vitals, ICU) vs UCI (diabetes-specific).",
            "MIMIC model AUC is higher (0.63 vs 0.56). Both are modest.",
            "UCI avg risk score (~26) reflects mostly low-risk diabetes patients; MIMIC avg (~61) reflects sicker ICU population.",
        ],
    }, default=str)


@mcp.tool()
def get_feature_importance(dataset: str = "uci", top_n: int = 10) -> str:
    """Return the most important features driving readmission risk.

    Args:
        dataset: "uci", "mimic", or "both".
        top_n: Number of top features to return (default 10).
    """
    ds = _validate_dataset(dataset)
    fi = store.feature_importance

    def _extract(key: str, n: int) -> dict:
        section = fi.get(key, {})
        features = section.get("features", [])[:n]
        result: dict = {"dataset": key, "top_features": features}
        if "groups" in section:
            result["feature_groups"] = section["groups"]
        if "top_10" in section:
            result["canonical_top_10"] = section["top_10"]
        return result

    if ds == "both":
        return json.dumps({
            "uci": _extract("uci", top_n),
            "mimic": _extract("mimic", top_n),
        }, default=str)

    return json.dumps(_extract(ds, top_n), default=str)


@mcp.tool()
def predict_risk(
    dataset: str = "uci",
    age: float = 65,
    time_in_hospital: float = 5,
    num_medications: float = 15,
    number_diagnoses: float = 7,
    number_inpatient: float = 1,
    number_emergency: float = 0,
    number_outpatient: float = 0,
    num_lab_procedures: float = 40,
    num_procedures: float = 1,
    additional_features: Optional[str] = None,
) -> str:
    """Run a live risk prediction using a trained numeric-only model.

    Scores are quantile-mapped to match the pre-computed score distribution,
    so they are on the same 0-100 scale as get_patient_risk_score. However,
    this model uses only numeric features (not categorical), so scores are
    approximate and may not exactly match stored patient lookups.

    For MIMIC, pass clinical features via `additional_features` as a JSON
    object, e.g. '{"creatinine_max": 4.0, "bilirubin_max": 5.0,
    "vital_instability": 1}'. MIMIC predictions improve significantly when
    lab values and clinical flags are provided.

    Args:
        dataset: "uci" or "mimic".
        age: Patient age in years.
        time_in_hospital: Days in hospital (UCI only — not used for MIMIC).
        num_medications: Total medications prescribed.
        number_diagnoses: Count of distinct diagnoses (UCI only).
        number_inpatient: Prior inpatient visits (UCI only).
        number_emergency: Prior emergency visits (UCI only).
        number_outpatient: Prior outpatient visits (UCI only).
        num_lab_procedures: Number of lab procedures (UCI only).
        num_procedures: Number of procedures performed.
        additional_features: JSON string of extra features (mainly for MIMIC).
    """
    ds = _validate_dataset(dataset)
    if ds == "both":
        raise ValueError("Specify 'uci' or 'mimic', not 'both'.")

    # Locate model artifacts
    model_path = MODELS_DIR / f"{ds}_model.joblib"
    scaler_path = MODELS_DIR / f"{ds}_scaler.joblib"
    columns_path = MODELS_DIR / f"{ds}_feature_columns.json"

    if not model_path.exists():
        return json.dumps({
            "error": f"No trained {ds} model found at {model_path}.",
            "instructions": (
                "Train the model first:\n"
                f"  python -m mcp_server.train_model --{ds}"
            ),
        })

    import joblib

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    feature_columns: list[str] = json.loads(columns_path.read_text(encoding="utf-8"))

    # Build feature vector from explicit params
    base = {
        "age_numeric": age,
        "time_in_hospital": time_in_hospital,
        "num_medications": num_medications,
        "number_diagnoses": number_diagnoses,
        "number_inpatient": number_inpatient,
        "number_emergency": number_emergency,
        "number_outpatient": number_outpatient,
        "num_lab_procedures": num_lab_procedures,
        "num_procedures": num_procedures,
    }

    if additional_features:
        extra = json.loads(additional_features)
        base.update(extra)

    # Load population-median defaults for features not provided
    defaults_path = MODELS_DIR / f"{ds}_feature_defaults.json"
    defaults = {}
    if defaults_path.exists():
        defaults = json.loads(defaults_path.read_text(encoding="utf-8"))

    row = {col: base.get(col, defaults.get(col, 0.0)) for col in feature_columns}
    X = pd.DataFrame([row])[feature_columns]
    X_scaled = scaler.transform(X)
    prob = float(model.predict_proba(X_scaled)[0, 1])

    # Map probability to the 0-100 risk scale:
    # 1. Calibration CDF: model probability → percentile rank (0-100)
    # 2. Stored-score mapping: percentile → pre-computed score scale
    # This ensures predict_risk outputs match the distribution of
    # scores returned by get_patient_risk_score.
    calibration_path = MODELS_DIR / f"{ds}_calibration.json"
    if calibration_path.exists():
        calibration = json.loads(calibration_path.read_text(encoding="utf-8"))
        grid = np.linspace(0, 100, len(calibration))
        percentile = float(np.interp(prob, calibration, grid))

        # Map percentile to stored-score scale
        summary = store.risk_summary_for(ds)
        cum_pct, score_bounds = _build_stored_score_cdf(summary)
        risk_score = round(float(np.interp(percentile, cum_pct, score_bounds)), 2)
    else:
        risk_score = round(prob * 100, 2)

    tier = _risk_tier(risk_score)
    estimated_cost = round(risk_score / 100 * 15000, 2)

    return json.dumps({
        "dataset": ds,
        "risk_score": risk_score,
        "risk_tier": tier,
        "estimated_cost": estimated_cost,
        "readmission_probability": round(prob, 4),
        "model_type": type(model).__name__,
    }, default=str)


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    transport = os.environ.get("MCP_TRANSPORT", "stdio")
    if transport in ("sse", "streamable-http"):
        port = int(os.environ.get("PORT", "8000"))
        mcp.settings.host = "0.0.0.0"
        mcp.settings.port = port
        mcp.settings.transport_security = TransportSecuritySettings(
            enable_dns_rebinding_protection=False
        )
    mcp.run(transport=transport)
