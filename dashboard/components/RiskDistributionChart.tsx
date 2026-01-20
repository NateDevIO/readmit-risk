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
import { RiskSummary } from '@/lib/data';

interface RiskDistributionChartProps {
  riskSummary: RiskSummary;
}

export default function RiskDistributionChart({ riskSummary }: RiskDistributionChartProps) {
  // Use the full population distribution from risk_summary
  const bins = [
    { range: '0-20%', color: '#22c55e' },
    { range: '20-40%', color: '#84cc16' },
    { range: '40-60%', color: '#eab308' },
    { range: '60-80%', color: '#f97316' },
    { range: '80-100%', color: '#ef4444' },
  ];

  const chartData = bins.map((bin) => ({
    range: bin.range,
    count: riskSummary.risk_distribution[bin.range] || 0,
    color: bin.color,
    percentage: ((riskSummary.risk_distribution[bin.range] || 0) / riskSummary.total_patients * 100).toFixed(1),
  }));

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Population Risk Distribution
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        All {riskSummary.total_patients.toLocaleString()} patients analyzed
      </p>
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
            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}K` : value}
            label={{
              value: 'Number of Patients',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#666' }
            }}
          />
          <Tooltip
            formatter={(value: number, name: string, props: any) => [
              `${value.toLocaleString()} (${props.payload.percentage}%)`,
              'Patients'
            ]}
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
      <div className="mt-4 flex justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500"></span> Low Risk
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-500"></span> Medium
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-500"></span> High Risk
        </span>
      </div>
    </div>
  );
}
