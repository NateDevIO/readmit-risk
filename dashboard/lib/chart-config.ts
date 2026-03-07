// lib/chart-config.ts
// Shared Recharts configuration extracted from chart components.
// Source components are NOT yet updated to import from here --
// this file is created first so the refactor can proceed incrementally.

import type { CSSProperties } from 'react';

// ---------------------------------------------------------------------------
// Tooltip styles
// ---------------------------------------------------------------------------

/** Light tooltip used by most charts (RiskDistribution, HighRiskBreakdown,
 *  AgeRisk, CostImpact, RiskFactors). */
export const TOOLTIP_STYLE: CSSProperties = {
  backgroundColor: 'white',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
};

/** Dark tooltip used by FeatureImportanceChart. */
export const TOOLTIP_STYLE_DARK: CSSProperties = {
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  color: '#ffffff',
};

/** Label style for the dark tooltip variant. */
export const TOOLTIP_LABEL_STYLE_DARK: CSSProperties = {
  color: '#ffffff',
  fontWeight: 600,
};

/** Item style for the dark tooltip variant. */
export const TOOLTIP_ITEM_STYLE_DARK: CSSProperties = {
  color: '#ffffff',
};

// ---------------------------------------------------------------------------
// CartesianGrid defaults
// ---------------------------------------------------------------------------

/** Standard CartesianGrid props shared by all bar charts. */
export const CARTESIAN_GRID_PROPS = {
  strokeDasharray: '3 3',
  stroke: '#f0f0f0',
} as const;

// ---------------------------------------------------------------------------
// Axis styles
// ---------------------------------------------------------------------------

/** Standard axis line style. */
export const AXIS_LINE_STYLE = { stroke: '#e0e0e0' } as const;

/** Standard tick style (12px). */
export const AXIS_TICK_STYLE = { fontSize: 12 } as const;

/** Smaller tick style (10-11px) used on denser axes. */
export const AXIS_TICK_STYLE_SMALL = { fontSize: 10 } as const;

/** Standard rotated Y-axis label style. */
export const Y_AXIS_LABEL_STYLE: CSSProperties = {
  fontSize: 12,
  fill: '#666',
};

/**
 * Helper that returns a complete Y-axis `label` prop object.
 *
 * @example
 * <YAxis label={yAxisLabel('Number of Patients')} />
 */
export function yAxisLabel(text: string) {
  return {
    value: text,
    angle: -90,
    position: 'insideLeft' as const,
    style: Y_AXIS_LABEL_STYLE,
  };
}

// ---------------------------------------------------------------------------
// Standard chart margins
// ---------------------------------------------------------------------------

/** Default margin used by most vertical bar charts. */
export const CHART_MARGIN = { top: 20, right: 30, left: 20, bottom: 5 } as const;

/** Margin used by horizontal bar charts with a left-side category axis. */
export const CHART_MARGIN_HORIZONTAL = { top: 5, right: 30, left: 120, bottom: 5 } as const;

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

/**
 * Format a number as a compact currency string.
 * - Values >= 1 000 000 are shown as "$XM" (millions).
 * - Values >= 1 000 are shown as "$XK" (thousands).
 * - Smaller values are shown as "$X".
 *
 * This mirrors `formatCurrency` in `lib/data.ts` but is designed for use as
 * a Recharts `tickFormatter` or inside tooltip callbacks.
 */
export function formatCurrencyCompact(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

/**
 * Recharts tickFormatter for currency axes showing millions.
 *
 * @example
 * <YAxis tickFormatter={currencyMillionsFormatter} />
 */
export function currencyMillionsFormatter(value: number): string {
  return `$${(value / 1_000_000).toFixed(0)}M`;
}

/**
 * Recharts tickFormatter for percentage axes.
 *
 * @example
 * <XAxis tickFormatter={percentageFormatter} />
 */
export function percentageFormatter(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Recharts tickFormatter that abbreviates large patient counts.
 *
 * @example
 * <YAxis tickFormatter={patientCountFormatter} />
 */
export function patientCountFormatter(value: number): string {
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  }
  return String(value);
}

// ---------------------------------------------------------------------------
// Color palettes
// ---------------------------------------------------------------------------

/** 10-color palette used for multi-series / feature importance charts. */
export const CHART_COLORS_10 = [
  '#3B82F6', // blue-500
  '#10B981', // green-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#F97316', // orange-500
  '#14B8A6', // teal-500
  '#6366F1', // indigo-500
] as const;

/** Colors for cost-tier charts (Critical, Very High, High). */
export const COST_TIER_COLORS = ['#dc2626', '#ea580c', '#f97316'] as const;

/** Semantic colors for risk-increase vs risk-decrease. */
export const RISK_DIRECTION_COLORS = {
  increase: '#ef4444',
  decrease: '#22c55e',
} as const;
