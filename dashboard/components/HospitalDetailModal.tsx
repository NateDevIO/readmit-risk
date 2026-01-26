// components/HospitalDetailModal.tsx
'use client';

import { Hospital, formatCurrency } from '@/lib/data';

interface HospitalDetailModalProps {
  hospital: Hospital | null;
  onClose: () => void;
}

export default function HospitalDetailModal({ hospital, onClose }: HospitalDetailModalProps) {
  if (!hospital) return null;

  // Determine performance level
  const getPerformanceLevel = (rate: number) => {
    if (rate < 14) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (rate < 15.5) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (rate < 17) return { level: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const performance = getPerformanceLevel(hospital.readmission_rate);

  // Use penalty amount from data (based on $100M avg Medicare payments)
  const estimatedPenalty = hospital.penalty_amount || 0;

  // Generate recommendations based on rate
  const getRecommendations = (rate: number) => {
    const recommendations: string[] = [];

    if (rate > 16) {
      recommendations.push('Implement transitional care management program');
      recommendations.push('Establish post-discharge phone call protocol within 48 hours');
      recommendations.push('Review discharge planning processes');
    }
    if (rate > 15) {
      recommendations.push('Enhance medication reconciliation at discharge');
      recommendations.push('Improve patient education materials');
    }
    if (rate > 14) {
      recommendations.push('Consider care coordination services for high-risk patients');
      recommendations.push('Evaluate follow-up appointment scheduling processes');
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain current care transition protocols');
      recommendations.push('Continue monitoring readmission trends');
    }

    return recommendations;
  };

  const recommendations = getRecommendations(hospital.readmission_rate);

  // National benchmarks
  const nationalAvg = 15.5;
  const topQuartile = 12.8;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hospital Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{hospital.city}, {hospital.state}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Hospital Name */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{hospital.name}</h3>

          {/* Performance Banner */}
          <div className={`rounded-lg p-4 mb-6 ${performance.bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${performance.color}`}>Performance Rating</p>
                <p className={`text-2xl font-bold ${performance.color}`}>{performance.level}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Readmission Rate</p>
                <p className="text-2xl font-bold text-gray-900">{hospital.readmission_rate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">CMS Penalty</p>
              <p className="text-lg font-semibold text-red-600">{hospital.penalty_pct.toFixed(2)}%</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Est. Penalty Amount</p>
              <p className="text-lg font-semibold text-red-600">{formatCurrency(estimatedPenalty)}</p>
            </div>
          </div>

          {/* Comparison to Benchmarks */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Benchmark Comparison</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">National Average</span>
                <span className="font-medium dark:text-white">{nationalAvg}%</span>
                <span className={hospital.readmission_rate <= nationalAvg ? 'text-green-600' : 'text-red-600'}>
                  {hospital.readmission_rate <= nationalAvg ? '✓ Below' : '✗ Above'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Top Quartile</span>
                <span className="font-medium dark:text-white">{topQuartile}%</span>
                <span className={hospital.readmission_rate <= topQuartile ? 'text-green-600' : 'text-yellow-600'}>
                  {hospital.readmission_rate <= topQuartile ? '✓ Achieved' : '○ Target'}
                </span>
              </div>
            </div>

            {/* Visual comparison bar */}
            <div className="mt-3 relative h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full rounded-full ${
                  hospital.readmission_rate <= topQuartile ? 'bg-green-500' :
                  hospital.readmission_rate <= nationalAvg ? 'bg-blue-500' :
                  hospital.readmission_rate <= 17 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((hospital.readmission_rate / 25) * 100, 100)}%` }}
              />
              {/* Benchmark markers */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
                style={{ left: `${(topQuartile / 25) * 100}%` }}
                title="Top Quartile"
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-gray-600"
                style={{ left: `${(nationalAvg / 25) * 100}%` }}
                title="National Average"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span>
              <span>25%</span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <span className="text-blue-500">💡</span>
              Recommended Actions
            </h4>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
              Add to Watch List
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
