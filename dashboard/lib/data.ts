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

export interface RiskFactor {
  name: string;
  coefficient: number;
  direction: 'risk' | 'protective';
}

export interface CostByTier {
  tier: string;
  count: number;
  total_cost: number;
  avg_cost: number;
  avg_risk: number;
}

export interface RiskSummary {
  total_patients: number;
  high_risk_count: number;
  total_cost_exposure: number;
  avg_risk_score: number;
  median_risk_score: number;
  risk_distribution: Record<string, number>;
  high_risk_distribution: Record<string, number>;
  avg_risk_by_age: Record<string, number>;
  model_auc: number;
  readmission_rate_overall: number;
  critical_count: number;
  very_high_count: number;
  high_count: number;
  risk_factors: RiskFactor[];
  cost_by_tier: CostByTier[];
}

export interface StateData {
  state: string;
  name: string;
  lat: number;
  lng: number;
  avg_readmission_rate: number;
  avg_penalty_pct: number;
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

// Cost range calculation based on industry benchmarks
// Base costs: $10K (low) to $25K (high) with $15K midpoint
const COST_LOW_BASE = 10000;
const COST_MID_BASE = 15000;
const COST_HIGH_BASE = 25000;

export interface CostRange {
  low: number;
  mid: number;
  high: number;
}

export function calculateCostRange(riskScore: number): CostRange {
  const riskFactor = riskScore / 100;
  return {
    low: riskFactor * COST_LOW_BASE,
    mid: riskFactor * COST_MID_BASE,
    high: riskFactor * COST_HIGH_BASE,
  };
}

export function formatCostRange(range: CostRange): string {
  return `${formatCurrency(range.low)} - ${formatCurrency(range.high)}`;
}

// Calculate total cost range for a group of patients
export function calculateTotalCostRange(patients: Patient[]): CostRange {
  return patients.reduce(
    (acc, patient) => {
      const range = calculateCostRange(patient.risk_score);
      return {
        low: acc.low + range.low,
        mid: acc.mid + range.mid,
        high: acc.high + range.high,
      };
    },
    { low: 0, mid: 0, high: 0 }
  );
}
