// components/HighRiskBreakdownChart.tsx
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

interface HighRiskBreakdownChartProps {
  riskSummary: RiskSummary;
}

export default function HighRiskBreakdownChart({ riskSummary }: HighRiskBreakdownChartProps) {
  // Detailed breakdown of high-risk patients (60%+)
  const bins = [
    { range: '60-70%', color: '#f97316', label: 'High' },
    { range: '70-80%', color: '#ea580c', label: 'Very High' },
    { range: '80-90%', color: '#dc2626', label: 'Critical' },
    { range: '90-100%', color: '#991b1b', label: 'Severe' },
  ];

  const chartData = bins.map((bin) => ({
    range: bin.range,
    label: bin.label,
    count: riskSummary.high_risk_distribution?.[bin.range] || 0,
    color: bin.color,
  }));

  const totalHighRisk = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        High-Risk Cohort Breakdown
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        {totalHighRisk.toLocaleString()} patients with 60%+ risk score
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
            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}K` : value}
            label={{
              value: 'Number of Patients',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#666' }
            }}
          />
          <Tooltip
            formatter={(value: number, name: string, props: any) => [
              `${value.toLocaleString()} patients`,
              props.payload.label
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
      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
        {chartData.map((bin) => (
          <div key={bin.range} className="p-2 rounded" style={{ backgroundColor: `${bin.color}20` }}>
            <p className="font-semibold" style={{ color: bin.color }}>{bin.count.toLocaleString()}</p>
            <p className="text-gray-600">{bin.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
