'use client';

import { Dataset, featureImportance } from '@/lib/data';

interface DatasetInfoProps {
  dataset: Dataset;
  totalPatients: number;
  readmissionRate: number;
  modelAuc: number;
}

export default function DatasetInfo({
  dataset,
  totalPatients,
  readmissionRate,
  modelAuc,
}: DatasetInfoProps) {
  const isUCI = dataset === 'uci';
  const topFeatures = isUCI
    ? featureImportance.uci.top_10.slice(0, 5)
    : featureImportance.mimic.top_15.slice(0, 5);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-blue-100 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isUCI ? 'UCI Diabetes Dataset' : 'MIMIC-IV Clinical Dataset'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {isUCI
              ? 'Diabetes patient readmissions (1999-2008)'
              : 'ICU patient readmissions (2008-2019)'}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isUCI
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
          }`}
        >
          {isUCI ? 'Historical' : 'Modern ICU'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Patients</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalPatients.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Readmission Rate</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {(readmissionRate * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Model AUC</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {(modelAuc * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="border-t border-blue-200 dark:border-gray-700 pt-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Top Predictive Features:
        </p>
        <div className="space-y-2">
          {topFeatures.map((feature, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold">
                  {idx + 1}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {feature.feature.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {(feature.importance * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
