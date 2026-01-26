// components/NationalBenchmarks.tsx
'use client';

import { RiskSummary } from '@/lib/data';

interface NationalBenchmarksProps {
  riskSummary: RiskSummary;
}

// CMS National Benchmarks (based on actual HRRP data)
const NATIONAL_BENCHMARKS = {
  readmissionRate: 15.5, // National avg 30-day readmission rate
  highRiskPercentage: 9.2, // Typical high-risk population %
  avgCostPerReadmission: 15000,
  topQuartileRate: 12.8, // Top performers
  bottomQuartileRate: 18.2, // Lagging performers
};

export default function NationalBenchmarks({ riskSummary }: NationalBenchmarksProps) {
  const yourHighRiskPct = (riskSummary.high_risk_count / riskSummary.total_patients) * 100;
  // Handle both readmission_rate_overall (UCI) and readmission_rate (MIMIC)
  const yourReadmissionRate = riskSummary.readmission_rate_overall || riskSummary.readmission_rate || 0;

  const getPerformanceLevel = (value: number, benchmark: number, lowerIsBetter: boolean = true) => {
    const diff = lowerIsBetter ? benchmark - value : value - benchmark;
    const pctDiff = (diff / benchmark) * 100;

    if (pctDiff > 15) return { level: 'excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (pctDiff > 0) return { level: 'good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (pctDiff > -15) return { level: 'average', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'needs improvement', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const readmissionPerf = getPerformanceLevel(yourReadmissionRate, NATIONAL_BENCHMARKS.readmissionRate);

  const metrics = [
    {
      label: 'Your Readmission Rate',
      value: yourReadmissionRate.toFixed(1),
      suffix: '%',
      benchmark: NATIONAL_BENCHMARKS.readmissionRate,
      benchmarkLabel: 'National Avg',
      performance: readmissionPerf,
      lowerIsBetter: true,
    },
    {
      label: 'High-Risk Population',
      value: yourHighRiskPct.toFixed(1),
      suffix: '%',
      benchmark: NATIONAL_BENCHMARKS.highRiskPercentage,
      benchmarkLabel: 'Typical Range',
      performance: getPerformanceLevel(yourHighRiskPct, NATIONAL_BENCHMARKS.highRiskPercentage),
      lowerIsBetter: true,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">National Benchmarks</h2>
          <p className="text-sm text-gray-500">Compare against CMS HRRP standards</p>
        </div>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
          CMS 2024 Data
        </span>
      </div>

      <div className="space-y-4">
        {metrics.map((metric, index) => {
          const diff = metric.lowerIsBetter
            ? metric.benchmark - parseFloat(metric.value)
            : parseFloat(metric.value) - metric.benchmark;
          const isPositive = diff > 0;

          return (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${metric.performance.bg} ${metric.performance.color}`}>
                  {metric.performance.level}
                </span>
              </div>

              {/* Comparison Bar */}
              <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden mb-2">
                {/* Benchmark line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10"
                  style={{ left: `${Math.min((metric.benchmark / 25) * 100, 100)}%` }}
                />

                {/* Your value bar */}
                <div
                  className={`absolute top-1 bottom-1 rounded-full transition-all duration-1000 ${
                    isPositive ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((parseFloat(metric.value) / 25) * 100, 100)}%` }}
                />

                {/* Value label */}
                <div className="absolute inset-0 flex items-center justify-between px-3">
                  <span className="text-sm font-bold text-white drop-shadow">
                    {metric.value}{metric.suffix}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {metric.benchmarkLabel}: {metric.benchmark}{metric.suffix}
                </span>
                <span className={isPositive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {isPositive ? '▼' : '▲'} {Math.abs(diff).toFixed(1)} pts {isPositive ? 'better' : 'higher'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quartile Reference */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 mb-2 font-medium">Readmission Rate Quartiles</p>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded"></span>
            Top 25%: &lt;{NATIONAL_BENCHMARKS.topQuartileRate}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-500 rounded"></span>
            Middle: {NATIONAL_BENCHMARKS.topQuartileRate}-{NATIONAL_BENCHMARKS.bottomQuartileRate}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded"></span>
            Bottom 25%: &gt;{NATIONAL_BENCHMARKS.bottomQuartileRate}%
          </span>
        </div>
      </div>
    </div>
  );
}
