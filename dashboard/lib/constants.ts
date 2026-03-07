// lib/constants.ts
// Shared constants extracted from dashboard components.
// Source components are NOT yet updated to import from here --
// this file is created first so the refactor can proceed incrementally.

// ---------------------------------------------------------------------------
// Risk tier definitions
// ---------------------------------------------------------------------------

export interface RiskTier {
  /** Machine-readable key used in filters and URL params. */
  key: string;
  /** Human-readable label shown in the UI. */
  label: string;
  /** Minimum risk score (inclusive). */
  min: number;
  /** Maximum risk score (exclusive). Use Infinity for the top tier. */
  max: number;
  /** Tailwind-compatible dot / badge color class (e.g. "bg-red-500"). */
  dotColor: string;
  /** Tailwind badge classes: background, text, and border. */
  badgeClasses: string;
  /** Gradient classes used on tier cards (dashboard page). */
  cardGradient: string;
  /** Short action urgency text shown in the care queue. */
  urgency: string;
}

export const RISK_TIERS: readonly RiskTier[] = [
  {
    key: 'critical',
    label: 'Critical',
    min: 80,
    max: Infinity,
    dotColor: 'bg-red-500',
    badgeClasses: 'bg-red-100 text-red-800 border-red-200',
    cardGradient: 'from-red-700 to-red-800',
    urgency: 'Act today',
  },
  {
    key: 'very-high',
    label: 'Very High',
    min: 70,
    max: 80,
    dotColor: 'bg-orange-500',
    badgeClasses: 'bg-orange-100 text-orange-800 border-orange-200',
    cardGradient: 'from-red-500 to-red-600',
    urgency: 'Act within 48hrs',
  },
  {
    key: 'high',
    label: 'High',
    min: 60,
    max: 70,
    dotColor: 'bg-yellow-500',
    badgeClasses: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    cardGradient: 'from-orange-500 to-orange-600',
    urgency: 'Act this week',
  },
  {
    key: 'moderate',
    label: 'Moderate',
    min: 40,
    max: 60,
    dotColor: 'bg-blue-500',
    badgeClasses: 'bg-blue-100 text-blue-800 border-blue-200',
    cardGradient: 'from-blue-500 to-blue-600',
    urgency: 'Monitor',
  },
  {
    key: 'low',
    label: 'Low',
    min: 0,
    max: 40,
    dotColor: 'bg-green-500',
    badgeClasses: 'bg-green-100 text-green-800 border-green-200',
    cardGradient: 'from-green-500 to-green-600',
    urgency: 'Routine',
  },
] as const;

/** The minimum risk score that qualifies a patient as "high risk". */
export const HIGH_RISK_THRESHOLD = 60;

/**
 * Look up the tier for a given risk score.
 * Tiers are checked from highest to lowest so the first match wins.
 */
export function getTierForScore(score: number): RiskTier {
  for (const tier of RISK_TIERS) {
    if (score >= tier.min && score < tier.max) {
      return tier;
    }
  }
  // Fallback (should never happen for valid 0-100 scores)
  return RISK_TIERS[RISK_TIERS.length - 1];
}

// ---------------------------------------------------------------------------
// Cost-per-readmission constants
// ---------------------------------------------------------------------------

export const COST_PER_READMISSION = {
  /** Low-end estimate (dollars). */
  min: 10_000,
  /** High-end estimate (dollars). */
  max: 25_000,
  /** Midpoint used as the default in calculators and reports. */
  default: 15_000,
} as const;

// ---------------------------------------------------------------------------
// Intervention presets (used by SavingsCalculator)
// ---------------------------------------------------------------------------

export interface InterventionPreset {
  name: string;
  description: string;
  costRange: [number, number];
  effectivenessRange: [number, number];
  source: string;
}

export const INTERVENTION_PRESETS: readonly InterventionPreset[] = [
  {
    name: 'Post-Discharge Phone Calls',
    description: 'Nurse-led follow-up calls within 48-72 hours',
    costRange: [50, 100],
    effectivenessRange: [10, 15],
    source: 'CMS Care Transitions',
  },
  {
    name: 'Transitional Care Management',
    description: 'Comprehensive 30-day post-discharge program',
    costRange: [200, 400],
    effectivenessRange: [20, 30],
    source: 'TCM Studies',
  },
  {
    name: 'Medication Reconciliation',
    description: 'Pharmacist-led medication review and education',
    costRange: [75, 150],
    effectivenessRange: [15, 20],
    source: 'AHRQ Guidelines',
  },
  {
    name: 'Home Health Visits',
    description: 'In-home nursing assessment and monitoring',
    costRange: [300, 500],
    effectivenessRange: [25, 35],
    source: 'SNF Data',
  },
  {
    name: 'Care Coordination',
    description: 'Dedicated care manager for high-risk patients',
    costRange: [150, 250],
    effectivenessRange: [15, 25],
    source: 'ACO Models',
  },
  {
    name: 'Custom',
    description: 'Define your own intervention parameters',
    costRange: [100, 100],
    effectivenessRange: [20, 20],
    source: 'User-defined',
  },
] as const;

// ---------------------------------------------------------------------------
// Age filter groups (used by MemberTable)
// ---------------------------------------------------------------------------

export interface AgeGroup {
  key: string;
  label: string;
  min: number;
  max: number;
}

export const AGE_GROUPS: readonly AgeGroup[] = [
  { key: 'under50', label: 'Under 50', min: 0, max: 50 },
  { key: '50-69', label: '50-69', min: 50, max: 70 },
  { key: '70plus', label: '70+', min: 70, max: Infinity },
] as const;

// ---------------------------------------------------------------------------
// Risk distribution bin definitions
// ---------------------------------------------------------------------------

export interface RiskBin {
  range: string;
  color: string;
  label?: string;
}

/** Full-population risk distribution bins (0-100). */
export const RISK_DISTRIBUTION_BINS: readonly RiskBin[] = [
  { range: '0-20%', color: '#22c55e', label: 'Very Low' },
  { range: '20-40%', color: '#84cc16', label: 'Low' },
  { range: '40-60%', color: '#eab308', label: 'Moderate' },
  { range: '60-80%', color: '#f97316', label: 'High' },
  { range: '80-100%', color: '#ef4444', label: 'Critical' },
] as const;

/** High-risk cohort breakdown bins (60-100). */
export const HIGH_RISK_BREAKDOWN_BINS: readonly RiskBin[] = [
  { range: '60-70%', color: '#f97316', label: 'High' },
  { range: '70-80%', color: '#ea580c', label: 'Very High' },
  { range: '80-90%', color: '#dc2626', label: 'Critical' },
  { range: '90-100%', color: '#991b1b', label: 'Severe' },
] as const;

// ---------------------------------------------------------------------------
// Care queue cost formula constants
// Used in care-queue/page.tsx to compute estimated_cost per patient.
// ---------------------------------------------------------------------------

export const CARE_QUEUE_COST = {
  baseCost: 10_000,
  riskMultiplier: 80,
  medicationCost: 120,
  diagnosisCost: 250,
  inpatientCost: 800,
  elderlyPremiumAge: 75,
  elderlyPremiumAmount: 1_500,
  seedModulus: 2_000,
  seedOffset: 1_000,
} as const;
