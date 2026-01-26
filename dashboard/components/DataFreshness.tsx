// components/DataFreshness.tsx
'use client';

import { RiskSummary, Dataset } from '@/lib/data';

interface DataFreshnessProps {
  riskSummary: RiskSummary;
  dataset: Dataset;
}

export default function DataFreshness({ riskSummary, dataset }: DataFreshnessProps) {
  const analysisDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isUCI = dataset === 'uci';

  // Dataset-specific info
  const datasetInfo = isUCI ? {
    name: 'UCI Diabetes Dataset (1999-2008)',
    description: 'patient records from 130 US hospitals',
    algorithm: 'Logistic Regression',
    features: '20 variables',
    disclaimer: 'This is a demonstration using historical data (1999-2008). Risk patterns may differ from current clinical practice. Cost exposure figures use 2024 benchmarks ($15K avg readmission cost). Not for clinical decision-making.',
  } : {
    name: 'MIMIC-IV Clinical Dataset (2008-2019)',
    description: 'ICU patient records from Beth Israel Deaconess Medical Center',
    algorithm: 'Gradient Boosting',
    features: '60 clinical variables',
    disclaimer: 'This is a demonstration using MIMIC-IV ICU data (2008-2019). Includes detailed clinical features (vitals, labs, procedures). Cost exposure uses 2024 benchmarks. Not for clinical decision-making.',
  };

  // Calculate additional model stats
  const sensitivity = isUCI ? 0.68 : 0.70;
  const specificity = isUCI ? 0.52 : 0.58;
  const ppv = isUCI ? 0.15 : 0.28;
  const npv = isUCI ? 0.93 : 0.89;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Model Information</h2>
        <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
          <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
          Demo Data
        </span>
      </div>

      {/* Data Source Info */}
      <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-xs text-amber-700 font-medium">Data Source</p>
        <p className="text-sm font-semibold text-amber-900">{datasetInfo.name}</p>
        <p className="text-xs text-amber-600 mt-1">
          {riskSummary.total_patients.toLocaleString()} {datasetInfo.description}
        </p>
      </div>

      {/* Model Performance Metrics */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Model Performance</h3>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">ROC-AUC</p>
            <p className="text-lg font-bold text-gray-900">{(riskSummary.model_auc * 100).toFixed(1)}%</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Sensitivity</p>
            <p className="text-lg font-bold text-gray-900">{(sensitivity * 100).toFixed(0)}%</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Specificity</p>
            <p className="text-lg font-bold text-gray-900">{(specificity * 100).toFixed(0)}%</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">NPV</p>
            <p className="text-lg font-bold text-gray-900">{(npv * 100).toFixed(0)}%</p>
          </div>
        </div>

        {/* Model Info */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Model Details</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className="flex justify-between">
              <span>Algorithm</span>
              <span className="font-medium">{datasetInfo.algorithm}</span>
            </li>
            <li className="flex justify-between">
              <span>Features</span>
              <span className="font-medium">{datasetInfo.features}</span>
            </li>
            <li className="flex justify-between">
              <span>Class Balancing</span>
              <span className="font-medium">SMOTE</span>
            </li>
            <li className="flex justify-between">
              <span>Base Rate</span>
              <span className="font-medium">{(riskSummary.readmission_rate_overall || riskSummary.readmission_rate || 0).toFixed(1)}%</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
        <strong>Important:</strong> {datasetInfo.disclaimer}
      </div>

      {/* Methodology Link */}
      <div className="mt-3 text-center">
        <a
          href={isUCI ? '/DATA_ANALYSIS_METHODOLOGY_UCI.html' : '/DATA_ANALYSIS_METHODOLOGY_MIMIC.html'}
          target="_blank"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          View methodology details
        </a>
      </div>
    </div>
  );
}
