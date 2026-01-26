'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Dataset, featureImportance } from '@/lib/data';

interface FeatureImportanceChartProps {
  dataset: Dataset;
}

export default function FeatureImportanceChart({ dataset }: FeatureImportanceChartProps) {
  const isUCI = dataset === 'uci';
  const topFeatures = isUCI
    ? featureImportance.uci.top_10
    : featureImportance.mimic.top_15.slice(0, 10);

  const chartData = topFeatures.map((f) => ({
    name: f.feature
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .substring(0, 25),
    importance: (f.importance * 100),
    fullName: f.feature.replace(/_/g, ' '),
  }));

  // Colors
  const colors = [
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
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 sm:p-6 border border-gray-100 dark:border-gray-700">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Top 10 Predictive Features
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Features with highest importance scores from Gradient Boosting model
        </p>
      </div>

      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <div className="min-w-[500px]">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                type="number"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
                domain={[0, 'auto']}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10 }}
                width={100}
              />
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value.toFixed(2)}%`,
                  props.payload.fullName,
                ]}
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#ffffff',
                }}
                labelStyle={{
                  color: '#ffffff',
                  fontWeight: 600,
                }}
                itemStyle={{
                  color: '#ffffff',
                }}
              />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isUCI
            ? 'UCI dataset has 12 core features focused on diabetes care metrics'
            : 'MIMIC-IV dataset has 61 clinical features including vitals, labs, and procedures'}
        </p>
      </div>
    </div>
  );
}
