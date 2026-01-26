// app/care-queue/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { patientRisks, formatCurrency } from '@/lib/data';

export default function CareQueue() {
  const [sortBy, setSortBy] = useState<'risk' | 'cost'>('risk');
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);

  // Get high-risk patients (>60%) and sort
  const highRiskPatients = useMemo(() => {
    return patientRisks
      .filter(p => p.risk_score >= 60)
      .map(p => {
        // Seeded random variation based on patient_id for consistency
        const seed = p.patient_id % 2000 - 1000;

        return {
          ...p,
          // Calculate more realistic cost based on multiple factors
          estimated_cost: Math.round(
            10000 + // Base cost
            (p.risk_score * 80) + // Risk component ($0-$8000)
            (p.num_medications || 0) * 120 + // Medication complexity ($120 per med)
            (p.number_diagnoses || 0) * 250 + // Comorbidity burden ($250 per diagnosis)
            (p.number_inpatient || 0) * 800 + // Prior hospitalization history ($800 per admission)
            (p.age >= 75 ? 1500 : 0) + // Elderly premium
            seed // Consistent variation per patient (+/- $1000)
          )
        };
      })
      .sort((a, b) => {
        if (sortBy === 'risk') {
          return b.risk_score - a.risk_score;
        }
        return b.estimated_cost - a.estimated_cost;
      })
      .slice(0, 50); // Top 50 for performance
  }, [sortBy]);

  const selectedPatientData = selectedPatient
    ? highRiskPatients.find(p => p.patient_id === selectedPatient)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Care Management Queue
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Prioritized patient worklist for post-discharge interventions
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="text-sm text-red-600 dark:text-red-400 mb-1">Critical Priority</div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {highRiskPatients.filter(p => p.risk_score >= 80).length}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">Act today (80%+ risk)</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="text-sm text-orange-600 dark:text-orange-400 mb-1">Very High Priority</div>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {highRiskPatients.filter(p => p.risk_score >= 70 && p.risk_score < 80).length}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400">Act within 48hrs (70-80%)</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">High Priority</div>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {highRiskPatients.filter(p => p.risk_score >= 60 && p.risk_score < 70).length}
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">Act this week (60-70%)</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Cost Exposure</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {formatCurrency(highRiskPatients.reduce((sum, p) => sum + p.estimated_cost, 0))}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Top 50 patients</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <button
              onClick={() => setSortBy('risk')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                sortBy === 'risk'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Risk Score
            </button>
            <button
              onClick={() => setSortBy('cost')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                sortBy === 'cost'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Cost Exposure
            </button>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
            Export to CSV
          </button>
        </div>

        {/* Patient Queue */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Patient List */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white">High-Risk Patients (Top 50)</h2>
            </div>
            <div className="divide-y dark:divide-gray-700 max-h-[800px] overflow-y-auto">
              {highRiskPatients.map((patient, index) => {
                const priorityLevel = patient.risk_score >= 80 ? 'critical' : patient.risk_score >= 70 ? 'very-high' : 'high';
                const priorityColors = {
                  critical: 'bg-red-100 dark:bg-red-900/30 border-red-500',
                  'very-high': 'bg-orange-100 dark:bg-orange-900/30 border-orange-500',
                  high: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500',
                };
                const priorityLabels = {
                  critical: 'CRITICAL',
                  'very-high': 'VERY HIGH',
                  high: 'HIGH',
                };

                return (
                  <button
                    key={patient.patient_id}
                    onClick={() => setSelectedPatient(patient.patient_id)}
                    className={`w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left ${
                      selectedPatient === patient.patient_id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          priorityLevel === 'critical' ? 'bg-red-500' :
                          priorityLevel === 'very-high' ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              Patient #{patient.patient_id}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded border ${priorityColors[priorityLevel]}`}>
                              {priorityLabels[priorityLevel]}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">#{index + 1}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Age:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">{patient.age}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Risk:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">{patient.risk_score.toFixed(0)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Cost:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">{formatCurrency(patient.estimated_cost)}</span>
                          </div>
                        </div>
                        {patient.num_medications && (
                          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                            {patient.num_medications} medications • {patient.number_diagnoses} diagnoses
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Patient Detail & Action Plan */}
          <div className="lg:col-span-1">
            {selectedPatientData ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Patient #{selectedPatientData.patient_id}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Age</div>
                      <div className="font-medium text-gray-900 dark:text-white">{selectedPatientData.age} years</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Risk Score</div>
                      <div className="font-medium text-gray-900 dark:text-white">{selectedPatientData.risk_score.toFixed(1)}%</div>
                    </div>
                    {selectedPatientData.num_medications && (
                      <>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Medications</div>
                          <div className="font-medium text-gray-900 dark:text-white">{selectedPatientData.num_medications}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Diagnoses</div>
                          <div className="font-medium text-gray-900 dark:text-white">{selectedPatientData.number_diagnoses}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t dark:border-gray-700 pt-4 mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Why High Risk?
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {selectedPatientData.num_medications && selectedPatientData.num_medications >= 10 && (
                      <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-red-500">•</span>
                        <span><strong>Polypharmacy:</strong> {selectedPatientData.num_medications} medications increases adverse drug event risk</span>
                      </li>
                    )}
                    {selectedPatientData.age >= 70 && (
                      <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-red-500">•</span>
                        <span><strong>Advanced Age:</strong> {selectedPatientData.age} years with increased frailty risk</span>
                      </li>
                    )}
                    {selectedPatientData.number_emergency && selectedPatientData.number_emergency >= 2 && (
                      <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-red-500">•</span>
                        <span><strong>ED Utilization:</strong> {selectedPatientData.number_emergency} emergency visits indicate inadequate outpatient care</span>
                      </li>
                    )}
                    {selectedPatientData.number_inpatient && selectedPatientData.number_inpatient >= 2 && (
                      <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-red-500">•</span>
                        <span><strong>Prior Hospitalizations:</strong> {selectedPatientData.number_inpatient} previous admissions</span>
                      </li>
                    )}
                  </ul>
                </div>

                <div className="border-t dark:border-gray-700 pt-4 mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recommended Actions
                  </h4>
                  <div className="space-y-3">
                    {selectedPatientData.risk_score >= 80 && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <div className="font-medium text-red-900 dark:text-red-300 text-sm mb-1">Priority 1: Immediate (24hrs)</div>
                        <ul className="space-y-1 text-xs text-red-800 dark:text-red-200">
                          <li>☑ Schedule transitional care visit</li>
                          <li>☑ Complete medication reconciliation</li>
                          <li>☑ Verify follow-up appointment scheduled</li>
                        </ul>
                      </div>
                    )}
                    {selectedPatientData.num_medications && selectedPatientData.num_medications >= 10 && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                        <div className="font-medium text-purple-900 dark:text-purple-300 text-sm mb-1">Pharmacist Consult</div>
                        <p className="text-xs text-purple-800 dark:text-purple-200">
                          Comprehensive medication review to identify drug interactions, duplications, and simplification opportunities
                        </p>
                      </div>
                    )}
                    {selectedPatientData.number_emergency && selectedPatientData.number_emergency >= 1 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="font-medium text-blue-900 dark:text-blue-300 text-sm mb-1">Care Coordination</div>
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                          Connect with PCP for follow-up within 7 days. Assess barriers to outpatient care access.
                        </p>
                      </div>
                    )}
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <div className="font-medium text-green-900 dark:text-green-300 text-sm mb-1">48-Hour Phone Call</div>
                      <p className="text-xs text-green-800 dark:text-green-200">
                        Post-discharge check-in to assess symptoms, medication adherence, and red flags for deterioration
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                    Assign to Care Team
                  </button>
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium">
                    Mark Complete
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500 dark:text-gray-400 sticky top-4">
                <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>Select a patient to view details and action plan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
