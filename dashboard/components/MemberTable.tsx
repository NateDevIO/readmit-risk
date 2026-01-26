// components/MemberTable.tsx
'use client';

import { useState, useMemo } from 'react';
import { Patient, Dataset, getRiskLevel, formatCurrency, calculateCostRange } from '@/lib/data';
import PatientDetailModal from './PatientDetailModal';

interface MemberTableProps {
  members: Patient[];
  initialLimit?: number;
  dataset?: Dataset;
}

type RiskTier = 'all' | 'critical' | 'very-high' | 'high';
type AgeGroup = 'all' | 'under50' | '50-69' | '70plus';

export default function MemberTable({ members, initialLimit = 25, dataset = 'uci' }: MemberTableProps) {
  const [sortField, setSortField] = useState<keyof Patient>('risk_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [displayCount, setDisplayCount] = useState(initialLimit);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskTier>('all');
  const [ageFilter, setAgeFilter] = useState<AgeGroup>('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!member.patient_id.toString().includes(searchLower)) {
          return false;
        }
      }

      // Risk tier filter
      if (riskFilter !== 'all') {
        if (riskFilter === 'critical' && member.risk_score < 80) return false;
        if (riskFilter === 'very-high' && (member.risk_score < 70 || member.risk_score >= 80)) return false;
        if (riskFilter === 'high' && (member.risk_score < 60 || member.risk_score >= 70)) return false;
      }

      // Age filter
      if (ageFilter !== 'all') {
        if (ageFilter === 'under50' && member.age >= 50) return false;
        if (ageFilter === '50-69' && (member.age < 50 || member.age >= 70)) return false;
        if (ageFilter === '70plus' && member.age < 70) return false;
      }

      return true;
    });
  }, [members, searchTerm, riskFilter, ageFilter]);

  const sortedMembers = useMemo(() => {
    return [...filteredMembers].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      // Handle undefined/null values - always push to end
      const aIsEmpty = aVal === undefined || aVal === null;
      const bIsEmpty = bVal === undefined || bVal === null;

      if (aIsEmpty && bIsEmpty) return 0;
      if (aIsEmpty) return 1;  // Always push undefined to end
      if (bIsEmpty) return -1; // Always push undefined to end

      // Determine if we're comparing numbers or strings
      const aNum = typeof aVal === 'number' ? aVal : parseFloat(aVal as string);
      const bNum = typeof bVal === 'number' ? bVal : parseFloat(bVal as string);

      let comparison = 0;

      // If both can be parsed as numbers, do numeric comparison
      if (!isNaN(aNum) && !isNaN(bNum)) {
        comparison = aNum - bNum;
      } else {
        // Otherwise, do string comparison
        const aStr = String(aVal);
        const bStr = String(bVal);
        comparison = aStr.localeCompare(bStr);
      }

      // Apply sort order
      const result = sortOrder === 'asc' ? comparison : -comparison;

      // Stable sort: if values are equal, maintain original order by unique ID
      if (result === 0) {
        // Use hadm_id for MIMIC (unique per admission), patient_id for UCI
        const aId = dataset === 'mimic' && a.hadm_id ? a.hadm_id : a.patient_id;
        const bId = dataset === 'mimic' && b.hadm_id ? b.hadm_id : b.patient_id;
        return aId - bId;
      }

      return result;
    });
  }, [filteredMembers, sortField, sortOrder]);

  const displayedMembers = sortedMembers.slice(0, displayCount);

  const handleSort = (field: keyof Patient) => {
    if (field === sortField) {
      // Toggle sort order using callback to ensure we have latest state
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field - set to descending and update field
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const exportToCSV = (count: number = 100) => {
    const exportData = sortedMembers.slice(0, count);

    const headers = dataset === 'uci'
      ? ['Patient ID', 'Age', 'Days Hospitalized', 'Medications', 'Diagnoses', 'Total Visits', 'Risk Score', 'Cost Low', 'Cost Mid', 'Cost High']
      : ['Patient ID', 'Admission ID', 'Age', 'Medication Count', 'ICU Stay', 'Risk Score', 'Cost Low', 'Cost Mid', 'Cost High'];

    const csvContent = [
      headers.join(','),
      ...exportData.map(m => {
        const costRange = calculateCostRange(m.risk_score);
        if (dataset === 'uci') {
          return [
            m.patient_id,
            m.age,
            m.time_in_hospital || '',
            m.num_medications || '',
            m.number_diagnoses || '',
            m.total_visits || '',
            m.risk_score.toFixed(1),
            costRange.low.toFixed(2),
            costRange.mid.toFixed(2),
            costRange.high.toFixed(2)
          ].join(',');
        } else {
          return [
            m.patient_id,
            m.hadm_id || '',
            m.age,
            m.medication_count || '',
            m.had_icu_stay === 1 ? 'Yes' : 'No',
            m.risk_score.toFixed(1),
            costRange.low.toFixed(2),
            costRange.mid.toFixed(2),
            costRange.high.toFixed(2)
          ].join(',');
        }
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `high-risk-patients-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: keyof Patient }) => {
    if (field !== sortField) return <span className="text-gray-300 ml-1">&#8597;</span>;
    return <span className="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>;
  };

  const getRiskBadgeStyle = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 70) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRiskFilter('all');
    setAgeFilter('all');
  };

  const hasActiveFilters = searchTerm || riskFilter !== 'all' || ageFilter !== 'all';

  return (
    <>
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">High-Risk Members</h2>
              <p className="text-sm text-gray-500 mt-1">
                Showing {displayedMembers.length} of {filteredMembers.length} members
                {hasActiveFilters && ` (${members.length} total)`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportToCSV(100)}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Top 100
              </button>
              <button
                onClick={() => exportToCSV(sortedMembers.length)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Export All
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Risk Tier Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as RiskTier)}
              className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Risk Tiers</option>
              <option value="critical">Critical (80%+)</option>
              <option value="very-high">Very High (70-80%)</option>
              <option value="high">High (60-70%)</option>
            </select>

            {/* Age Filter */}
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value as AgeGroup)}
              className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Ages</option>
              <option value="under50">Under 50</option>
              <option value="50-69">50-69</option>
              <option value="70plus">70+</option>
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear filters
              </button>
            )}

            {/* Quick Stats */}
            <div className="ml-auto flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Critical: {filteredMembers.filter(m => m.risk_score >= 80).length}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Very High: {filteredMembers.filter(m => m.risk_score >= 70 && m.risk_score < 80).length}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                High: {filteredMembers.filter(m => m.risk_score >= 60 && m.risk_score < 70).length}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {(dataset === 'uci' ? [
                  { key: 'patient_id', label: 'ID' },
                  { key: 'age', label: 'Age' },
                  { key: 'time_in_hospital', label: 'Days' },
                  { key: 'num_medications', label: 'Meds' },
                  { key: 'number_diagnoses', label: 'Dx' },
                  { key: 'total_visits', label: 'Visits' },
                  { key: 'risk_score', label: 'Risk Score' },
                  { key: 'estimated_cost', label: 'Cost Exposure' },
                ] : [
                  { key: 'patient_id', label: 'ID' },
                  { key: 'hadm_id', label: 'Admission' },
                  { key: 'age', label: 'Age' },
                  { key: 'medication_count', label: 'Meds' },
                  { key: 'had_icu_stay', label: 'ICU' },
                  { key: 'risk_score', label: 'Risk Score' },
                  { key: 'estimated_cost', label: 'Cost Exposure' },
                ]).map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key as keyof Patient)}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      {col.label}
                      <SortIcon field={col.key as keyof Patient} />
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedMembers.map((member, index) => (
                <tr
                  key={dataset === 'mimic' && member.hadm_id ? `${member.hadm_id}` : `${member.patient_id}-${index}`}
                  className="hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedPatient(member)}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    #{member.patient_id}
                  </td>
                  {dataset === 'mimic' && (
                    <td className="px-4 py-3 text-sm text-gray-600">
                      #{member.hadm_id}
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {member.age}
                  </td>
                  {dataset === 'uci' ? (
                    <>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {member.time_in_hospital || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {member.num_medications || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {member.number_diagnoses || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {member.total_visits || '-'}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {member.medication_count || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {member.had_icu_stay === 1 ? 'Yes' : 'No'}
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${getRiskBadgeStyle(
                        member.risk_score
                      )}`}
                    >
                      {member.risk_score.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {(() => {
                      const range = calculateCostRange(member.risk_score);
                      return `${formatCurrency(range.low)} - ${formatCurrency(range.high)}`;
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPatient(member);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayCount < filteredMembers.length && (
          <div className="px-6 py-4 border-t border-gray-100 text-center">
            <button
              onClick={() => setDisplayCount((prev) => prev + 25)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Load more members ({filteredMembers.length - displayCount} remaining)
            </button>
          </div>
        )}
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          dataset={dataset}
        />
      )}
    </>
  );
}
