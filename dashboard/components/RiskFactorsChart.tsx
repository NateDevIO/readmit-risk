// components/RiskFactorsChart.tsx
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
  ReferenceLine,
} from 'recharts';
import { RiskFactor } from '@/lib/data';

interface RiskFactorsChartProps {
  riskFactors: RiskFactor[];
}

export default function RiskFactorsChart({ riskFactors }: RiskFactorsChartProps) {
  // Sort by absolute coefficient value for visual impact
  const sortedFactors = [...riskFactors].sort(
    (a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient)
  );

  const chartData = sortedFactors.map((factor) => ({
    name: factor.name,
    value: factor.coefficient,
    direction: factor.direction,
  }));

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Key Risk Factors
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        ML model coefficients showing what drives readmission risk
      </p>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11 }}
            axisLine={{ stroke: '#e0e0e0' }}
            domain={['dataMin - 0.5', 'dataMax + 0.5']}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e0e0e0' }}
            width={110}
          />
          <Tooltip
            formatter={(value: number) => [
              `${value > 0 ? '+' : ''}${value.toFixed(3)}`,
              'Impact Score'
            ]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}
          />
          <ReferenceLine x={0} stroke="#666" strokeWidth={1} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value > 0 ? '#ef4444' : '#22c55e'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex justify-center gap-6 text-sm">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-red-500"></span>
          <span className="text-gray-600">Increases Risk</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-green-500"></span>
          <span className="text-gray-600">Decreases Risk</span>
        </span>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Interpretation:</strong> Higher positive values indicate stronger association
          with readmission. Prior visits and medication count are key drivers.
          Outpatient care appears protective, suggesting continuity of care helps prevent readmissions.
        </p>
      </div>
    </div>
  );
}
