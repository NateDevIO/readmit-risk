// components/CostImpactChart.tsx
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
import { CostByTier, formatCurrency } from '@/lib/data';

interface CostImpactChartProps {
  costByTier: CostByTier[];
}

export default function CostImpactChart({ costByTier }: CostImpactChartProps) {
  const colors = ['#dc2626', '#ea580c', '#f97316'];

  const chartData = costByTier.map((tier, index) => ({
    ...tier,
    color: colors[index] || '#f97316',
    shortTier: tier.tier.split(' ')[0], // Get "Critical", "Very", "High"
  }));

  const totalCost = costByTier.reduce((sum, t) => sum + t.total_cost, 0);
  const totalPatients = costByTier.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Cost Exposure by Risk Tier
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Potential savings if readmissions are prevented
      </p>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="tier"
            tick={{ fontSize: 11 }}
            axisLine={{ stroke: '#e0e0e0' }}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e0e0e0' }}
            tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
            label={{
              value: 'Total Cost Exposure',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#666' }
            }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'total_cost') return [formatCurrency(value), 'Total Exposure'];
              if (name === 'count') return [value.toLocaleString(), 'Patients'];
              return [value, name];
            }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="total_cost" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {costByTier.map((tier, index) => (
          <div
            key={tier.tier}
            className="p-3 rounded-lg text-center"
            style={{ backgroundColor: `${colors[index]}15` }}
          >
            <p className="text-xs font-medium" style={{ color: colors[index] }}>
              {tier.tier.split(' ')[0]}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(tier.total_cost)}
            </p>
            <p className="text-xs text-gray-500">
              {tier.count.toLocaleString()} patients
            </p>
          </div>
        ))}
      </div>

      {/* Total Summary */}
      <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Total High-Risk Exposure</p>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(totalCost)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Patients at Risk</p>
            <p className="text-2xl font-bold text-gray-900">{totalPatients.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
