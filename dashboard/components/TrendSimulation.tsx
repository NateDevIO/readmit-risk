// components/TrendSimulation.tsx
'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/data';

interface TrendSimulationProps {
  currentHighRiskCount: number;
  currentCostExposure: number;
}

export default function TrendSimulation({
  currentHighRiskCount,
  currentCostExposure,
}: TrendSimulationProps) {
  const [reductionTarget, setReductionTarget] = useState(20);
  const [timeframeMonths, setTimeframeMonths] = useState(12);

  const projectionData = useMemo(() => {
    const data = [];
    const monthlyReduction = reductionTarget / timeframeMonths;

    for (let month = 0; month <= timeframeMonths; month++) {
      const cumulativeReduction = Math.min(month * monthlyReduction, reductionTarget);
      const remainingHighRisk = Math.round(currentHighRiskCount * (1 - cumulativeReduction / 100));
      const projectedCost = currentCostExposure * (1 - cumulativeReduction / 100);
      const savings = currentCostExposure - projectedCost;

      data.push({
        month: month === 0 ? 'Now' : `M${month}`,
        monthNum: month,
        highRiskCount: remainingHighRisk,
        costExposure: projectedCost,
        cumulativeSavings: savings,
        baselineCost: currentCostExposure,
      });
    }

    return data;
  }, [currentHighRiskCount, currentCostExposure, reductionTarget, timeframeMonths]);

  const finalSavings = projectionData[projectionData.length - 1]?.cumulativeSavings || 0;
  const finalHighRisk = projectionData[projectionData.length - 1]?.highRiskCount || 0;
  const readmissionsAvoided = currentHighRiskCount - finalHighRisk;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Impact Projection</h2>
          <p className="text-sm text-gray-500">Model outcomes over time</p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reduction Target: {reductionTarget}%
          </label>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={reductionTarget}
            onChange={(e) => setReductionTarget(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timeframe: {timeframeMonths} months
          </label>
          <input
            type="range"
            min="6"
            max="24"
            step="6"
            value={timeframeMonths}
            onChange={(e) => setTimeframeMonths(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'costExposure') return [formatCurrency(value), 'Cost Exposure'];
              if (name === 'cumulativeSavings') return [formatCurrency(value), 'Cumulative Savings'];
              if (name === 'highRiskCount') return [value.toLocaleString(), 'High-Risk Patients'];
              return [value, name];
            }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="cumulativeSavings"
            fill="#22c55e"
            fillOpacity={0.2}
            stroke="#22c55e"
            strokeWidth={2}
            name="Cumulative Savings"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="costExposure"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            name="Cost Exposure"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="highRiskCount"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="High-Risk Count"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Projected Outcomes */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-green-700 font-medium">Projected Savings</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(finalSavings)}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-700 font-medium">Readmissions Avoided</p>
          <p className="text-xl font-bold text-blue-600">{readmissionsAvoided.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <p className="text-xs text-purple-700 font-medium">Remaining High-Risk</p>
          <p className="text-xl font-bold text-purple-600">{finalHighRisk.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
