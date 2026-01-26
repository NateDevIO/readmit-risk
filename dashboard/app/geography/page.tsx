// app/geography/page.tsx
'use client';

import { useState, useMemo } from 'react';
import StateHeatmap from '@/components/StateHeatmap';
import HospitalDetailModal from '@/components/HospitalDetailModal';
import { stateSummary, hospitalMetrics, formatCurrency, Hospital } from '@/lib/data';

export default function GeographyPage() {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [displayLimit, setDisplayLimit] = useState(15);
  const [sortField, setSortField] = useState<keyof Hospital>('readmission_rate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedState, setSelectedState] = useState<string>('all');

  // Calculate national stats
  const totalHospitals = stateSummary.reduce((sum, s) => sum + (s.hospital_count || 0), 0);
  const totalPenalties = stateSummary.reduce((sum, s) => sum + (s.total_penalty_estimate || 0), 0);
  const avgRate = stateSummary.length > 0
    ? stateSummary.reduce((sum, s) => sum + (s.avg_readmission_rate || 0), 0) / stateSummary.length
    : 0;

  // Get unique states for filter
  const uniqueStates = useMemo(() => {
    const states = new Set(hospitalMetrics.map(h => h.state).filter(Boolean));
    return Array.from(states).sort();
  }, []);

  // Filter by state
  const filteredHospitals = useMemo(() => {
    if (selectedState === 'all') return hospitalMetrics;
    return hospitalMetrics.filter(h => h.state === selectedState);
  }, [selectedState]);

  // Sorting logic
  const sortedHospitals = useMemo(() => {
    return [...filteredHospitals].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      // Handle undefined/null
      const aIsEmpty = aVal === undefined || aVal === null;
      const bIsEmpty = bVal === undefined || bVal === null;
      if (aIsEmpty && bIsEmpty) return 0;
      if (aIsEmpty) return 1;
      if (bIsEmpty) return -1;

      // Numeric comparison
      const aNum = typeof aVal === 'number' ? aVal : parseFloat(aVal as string);
      const bNum = typeof bVal === 'number' ? bVal : parseFloat(bVal as string);

      let comparison = 0;
      if (!isNaN(aNum) && !isNaN(bNum)) {
        comparison = aNum - bNum;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      const result = sortOrder === 'asc' ? comparison : -comparison;

      // Stable sort by name
      if (result === 0) {
        return (a.name || '').localeCompare(b.name || '');
      }
      return result;
    });
  }, [filteredHospitals, sortField, sortOrder]);

  const displayedHospitals = sortedHospitals.slice(0, displayLimit);

  const handleSort = (field: keyof Hospital) => {
    if (field === sortField) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Geographic Analysis</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          State-by-state readmission rates and provider network performance
        </p>
        <a
          href="/EXECUTIVE_REPORT_GEOGRAPHY.html"
          target="_blank"
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors inline-block mt-1"
        >
          Export Report →
        </a>
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

      {/* Methodology Link */}
      <div className="text-center mb-6">
        <a
          href="/DATA_ANALYSIS_METHODOLOGY_GEOGRAPHY.html"
          target="_blank"
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          View methodology details
        </a>
      </div>

      {/* State Heatmap */}
      <div className="mb-8">
        <StateHeatmap stateData={stateSummary} />
      </div>

      {/* Hospitals Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Hospital Performance Analysis
            </h2>
            <div className="flex items-center gap-2">
              <label htmlFor="state-filter" className="text-sm text-gray-600 dark:text-gray-400">
                Filter by State:
              </label>
              <select
                id="state-filter"
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setDisplayLimit(15); // Reset display limit when filtering
                }}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All States ({hospitalMetrics.length})</option>
                {uniqueStates.map(state => {
                  const stateCount = hospitalMetrics.filter(h => h.state === state).length;
                  return (
                    <option key={state} value={state}>
                      {state} ({stateCount})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {displayedHospitals.length} of {filteredHospitals.length} hospitals{selectedState !== 'all' ? ` in ${selectedState}` : ' nationwide'} · Click column headers to sort
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  Hospital {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('state')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  Location {sortField === 'state' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('readmission_rate')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  Readmission Rate {sortField === 'readmission_rate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('penalty_pct')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  Penalty % {sortField === 'penalty_pct' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {displayedHospitals.map((hospital, index) => (
                <tr
                  key={`${hospital.name}-${hospital.state}-${index}`}
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

        {/* Load More Button */}
        {displayLimit < filteredHospitals.length && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600 text-center">
            <button
              onClick={() => setDisplayLimit(prev => Math.min(prev + 25, filteredHospitals.length))}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Load More ({Math.min(25, filteredHospitals.length - displayLimit)} more)
            </button>
            <button
              onClick={() => setDisplayLimit(filteredHospitals.length)}
              className="ml-3 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Show All ({filteredHospitals.length})
            </button>
          </div>
        )}
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
