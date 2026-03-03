"""Singleton data store that lazy-loads project JSON/CSV into pandas DataFrames."""

import json
from pathlib import Path
from typing import Any

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent


class DataStore:
    """Lazy-loading singleton for all ReadmitRisk data files."""

    _instance: "DataStore | None" = None

    def __new__(cls) -> "DataStore":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._loaded = False
        return cls._instance

    # -- patient risks -------------------------------------------------------

    _patient_risks_uci: pd.DataFrame | None = None
    _patient_risks_mimic: pd.DataFrame | None = None

    @property
    def patient_risks_uci(self) -> pd.DataFrame:
        if self._patient_risks_uci is None:
            path = PROJECT_ROOT / "data" / "processed" / "patient_risks.json"
            self._patient_risks_uci = pd.read_json(path)
        return self._patient_risks_uci

    @property
    def patient_risks_mimic(self) -> pd.DataFrame:
        if self._patient_risks_mimic is None:
            path = PROJECT_ROOT / "data" / "processed" / "patient_risks_mimic.json"
            self._patient_risks_mimic = pd.read_json(path)
        return self._patient_risks_mimic

    def patient_risks(self, dataset: str = "uci") -> pd.DataFrame:
        if dataset == "mimic":
            return self.patient_risks_mimic
        return self.patient_risks_uci

    # -- risk summaries -------------------------------------------------------

    _risk_summary: dict[str, Any] | None = None
    _risk_summary_mimic: dict[str, Any] | None = None
    _risk_summary_uci: dict[str, Any] | None = None

    @property
    def risk_summary(self) -> dict[str, Any]:
        if self._risk_summary is None:
            path = PROJECT_ROOT / "data" / "processed" / "risk_summary.json"
            self._risk_summary = json.loads(path.read_text(encoding="utf-8"))
        return self._risk_summary

    @property
    def risk_summary_mimic(self) -> dict[str, Any]:
        if self._risk_summary_mimic is None:
            path = PROJECT_ROOT / "data" / "processed" / "risk_summary_mimic.json"
            self._risk_summary_mimic = json.loads(path.read_text(encoding="utf-8"))
        return self._risk_summary_mimic

    @property
    def risk_summary_uci(self) -> dict[str, Any]:
        if self._risk_summary_uci is None:
            path = PROJECT_ROOT / "data" / "processed" / "risk_summary_uci.json"
            self._risk_summary_uci = json.loads(path.read_text(encoding="utf-8"))
        return self._risk_summary_uci

    def risk_summary_for(self, dataset: str = "uci") -> dict[str, Any]:
        if dataset == "mimic":
            return self.risk_summary_mimic
        return self.risk_summary

    # -- hospital / geography -------------------------------------------------

    _hospital_metrics: pd.DataFrame | None = None
    _state_summary: pd.DataFrame | None = None

    @property
    def hospital_metrics(self) -> pd.DataFrame:
        if self._hospital_metrics is None:
            path = PROJECT_ROOT / "data" / "processed" / "hospital_metrics.json"
            self._hospital_metrics = pd.read_json(path)
        return self._hospital_metrics

    @property
    def state_summary(self) -> pd.DataFrame:
        if self._state_summary is None:
            path = PROJECT_ROOT / "data" / "processed" / "state_summary.json"
            self._state_summary = pd.read_json(path)
        return self._state_summary

    # -- feature importance ---------------------------------------------------

    _feature_importance: dict[str, Any] | None = None

    @property
    def feature_importance(self) -> dict[str, Any]:
        if self._feature_importance is None:
            path = PROJECT_ROOT / "data" / "feature_importance" / "feature_importance.json"
            self._feature_importance = json.loads(path.read_text(encoding="utf-8"))
        return self._feature_importance

    # -- dataset comparison ---------------------------------------------------

    _dataset_comparison: pd.DataFrame | None = None

    @property
    def dataset_comparison(self) -> pd.DataFrame:
        if self._dataset_comparison is None:
            path = PROJECT_ROOT / "data" / "comparison_reports" / "dataset_comparison.csv"
            self._dataset_comparison = pd.read_csv(path)
        return self._dataset_comparison


# Module-level convenience accessor
store = DataStore()
