// components/AgeRiskChart.tsx
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
  LabelList,
} from 'recharts';

interface AgeRiskChartProps {
  avgRiskByAge: Record<string, number>;
}

export default function AgeRiskChart({ avgRiskByAge }: AgeRiskChartProps) {
  // Order ages properly
  const ageOrder = ['Under 30', '30-49', '50-69', '70+'];

  const chartData = ageOrder.map((age) => ({
    age,
    risk: avgRiskByAge[age] || 0,
  }));

  // Color gradient based on risk
  const getColor = (risk: number) => {
    if (risk >= 27) return '#ef4444';
    if (risk >= 25) return '#f97316';
    if (risk >= 23) return '#eab308';
    return '#22c55e';
  };

  const overallAvg = Object.values(avgRiskByAge).reduce((a, b) => a + b, 0) / Object.values(avgRiskByAge).length;

  // Calculate dynamic Y-axis domain
  const maxRisk = Math.max(...chartData.map(d => d.risk));
  const yAxisMax = Math.ceil(maxRisk / 10) * 10 + 10; // Round up to nearest 10, plus padding

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Risk by Age Group
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Average risk score across all {Object.keys(avgRiskByAge).length} age cohorts
      </p>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="age"
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e0e0e0' }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e0e0e0' }}
            domain={[0, yAxisMax]}
            ticks={[0, Math.round(yAxisMax * 0.25), Math.round(yAxisMax * 0.5), Math.round(yAxisMax * 0.75), yAxisMax]}
            tickFormatter={(value) => `${Math.round(value)}`}
            label={{
              value: 'Avg Risk Score (%)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#666' }
            }}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Average Risk']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="risk" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.risk)} />
            ))}
            <LabelList
              dataKey="risk"
              position="top"
              formatter={(value: number) => `${value.toFixed(1)}%`}
              style={{ fontSize: 11, fill: '#666' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Population Average</p>
          <p className="text-xl font-bold text-gray-900">{overallAvg.toFixed(1)}%</p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-600">Highest Risk Group</p>
          <p className="text-xl font-bold text-red-700">70+ years</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500 text-center">
        Note: Elderly patients (70+) show elevated risk, indicating need for targeted post-discharge support programs.
      </p>
    </div>
  );
}
