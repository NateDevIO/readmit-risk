// app/geography/page.tsx
'use client';

import { useState } from 'react';
import StateHeatmap from '@/components/StateHeatmap';
import HospitalDetailModal from '@/components/HospitalDetailModal';
import { stateSummary, hospitalMetrics, formatCurrency, Hospital } from '@/lib/data';

export default function GeographyPage() {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Calculate national stats
  const totalHospitals = stateSummary.reduce((sum, s) => sum + (s.hospital_count || 0), 0);
  const totalPenalties = stateSummary.reduce((sum, s) => sum + (s.total_penalty_estimate || 0), 0);
  const avgRate = stateSummary.length > 0
    ? stateSummary.reduce((sum, s) => sum + (s.avg_readmission_rate || 0), 0) / stateSummary.length
    : 0;

  // Top 10 hospitals by readmission rate
  const topHospitals = [...hospitalMetrics]
    .sort((a, b) => (b.readmission_rate || 0) - (a.readmission_rate || 0))
    .slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Geographic Analysis</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          State-by-state readmission rates and provider network performance
        </p>
      </div>

      {/* National Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">States Analyzed</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stateSummary.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Hospitals</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalHospitals.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">National Avg Rate</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Est. Total Penalties</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPenalties)}</p>
        </div>
      </div>

      {/* State Heatmap */}
      <div className="mb-8">
        <StateHeatmap stateData={stateSummary} />
      </div>

      {/* Top Hospitals Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Highest Readmission Rate Hospitals
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Click a hospital for detailed analysis</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Hospital
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Readmission Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Penalty %
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {topHospitals.map((hospital, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => setSelectedHospital(hospital)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {hospital.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {hospital.city}, {hospital.state}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                      {(hospital.readmission_rate || 0).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {(hospital.penalty_pct || 0).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHospital(hospital);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hospital Detail Modal */}
      {selectedHospital && (
        <HospitalDetailModal
          hospital={selectedHospital}
          onClose={() => setSelectedHospital(null)}
        />
      )}
    </div>
  );
}
