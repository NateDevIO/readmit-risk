// app/impact-calculator/page.tsx
'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/data';

export default function ImpactCalculator() {
  // Input states
  const [patientCount, setPatientCount] = useState(10000);
  const [currentRate, setCurrentRate] = useState(15.0);
  const [targetReduction, setTargetReduction] = useState(20);
  const [avgReadmissionCost, setAvgReadmissionCost] = useState(15000);
  const [interventionCostPerPatient, setInterventionCostPerPatient] = useState(250);
  const [interventionCoverage, setInterventionCoverage] = useState(15); // % of patients receiving intervention

  // Calculations
  const currentReadmissions = Math.round((patientCount * currentRate) / 100);
  const reducedRate = currentRate * (1 - targetReduction / 100);
  const preventedReadmissions = Math.round(currentReadmissions * (targetReduction / 100));
  const newReadmissions = currentReadmissions - preventedReadmissions;

  const costAvoidance = preventedReadmissions * avgReadmissionCost;
  const patientsReceivingIntervention = Math.round((patientCount * interventionCoverage) / 100);
  const totalInterventionCost = patientsReceivingIntervention * interventionCostPerPatient;
  const netSavings = costAvoidance - totalInterventionCost;
  const roi = totalInterventionCost > 0 ? ((netSavings / totalInterventionCost) * 100) : 0;
  const breakEvenReadmissions = Math.ceil(totalInterventionCost / avgReadmissionCost);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Business Impact Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Calculate the ROI of your readmission reduction program
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Inputs */}
          <div className="space-y-6">
            {/* Population Inputs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Population & Baseline</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Patient Population
                  </label>
                  <input
                    type="number"
                    value={patientCount}
                    onChange={(e) => setPatientCount(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    min="100"
                    step="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current 30-Day Readmission Rate (%)
                  </label>
                  <input
                    type="number"
                    value={currentRate}
                    onChange={(e) => setCurrentRate(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    National average: 15-17% for Medicare
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Average Cost Per Readmission ($)
                  </label>
                  <input
                    type="number"
                    value={avgReadmissionCost}
                    onChange={(e) => setAvgReadmissionCost(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    min="1000"
                    step="1000"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Industry range: $10,000 - $25,000
                  </p>
                </div>
              </div>
            </div>

            {/* Intervention Inputs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Intervention Strategy</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Reduction in Readmissions (%)
                  </label>
                  <input
                    type="number"
                    value={targetReduction}
                    onChange={(e) => setTargetReduction(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="1"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Conservative (10-15%)</span>
                    <span>Aggressive (25-40%)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    % of Patients Receiving Intervention
                  </label>
                  <input
                    type="number"
                    value={interventionCoverage}
                    onChange={(e) => setInterventionCoverage(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="1"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Target high-risk patients (typically top 10-20%)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cost Per Patient Intervention ($)
                  </label>
                  <input
                    type="number"
                    value={interventionCostPerPatient}
                    onChange={(e) => setInterventionCostPerPatient(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="10"
                  />
                  <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <p>• Phone call: $50-$200</p>
                    <p>• Transitional care: $200-$400</p>
                    <p>• Home health visit: $300-$600</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Financial Impact Summary</h2>

              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-sm text-blue-100 mb-1">Net Annual Savings</div>
                  <div className={`text-4xl font-bold ${netSavings >= 0 ? 'text-white' : 'text-red-300'}`}>
                    {formatCurrency(netSavings)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-sm text-blue-100 mb-1">Cost Avoidance</div>
                    <div className="text-2xl font-bold text-green-300">{formatCurrency(costAvoidance)}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-sm text-blue-100 mb-1">Program Cost</div>
                    <div className="text-2xl font-bold text-orange-300">{formatCurrency(totalInterventionCost)}</div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-sm text-blue-100 mb-1">Return on Investment (ROI)</div>
                  <div className={`text-3xl font-bold ${roi >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {roi.toFixed(0)}%
                  </div>
                  <p className="text-xs text-blue-200 mt-1">
                    Every $1 invested returns ${(1 + roi / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Readmission Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Readmission Metrics</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Current Readmissions</div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{currentReadmissions.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Rate</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{currentRate.toFixed(1)}%</div>
                  </div>
                </div>

                <div className="flex items-center justify-center py-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Prevent {preventedReadmissions.toLocaleString()} readmissions
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Target Readmissions</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{newReadmissions.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">New Rate</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{reducedRate.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Break-Even Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Break-Even Analysis</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Patients in Program:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{patientsReceivingIntervention.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Readmissions to Prevent:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{breakEvenReadmissions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Success Rate Needed:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {((breakEvenReadmissions / patientsReceivingIntervention) * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Break-Even Point:</strong> Need to prevent only <strong>{breakEvenReadmissions}</strong> readmissions
                    ({((breakEvenReadmissions / preventedReadmissions) * 100).toFixed(0)}% of target) to cover program costs.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>💡</span>
                Key Insights
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    ROI is {roi >= 300 ? 'excellent' : roi >= 100 ? 'strong' : roi >= 0 ? 'positive' : 'negative'} -
                    {roi >= 0
                      ? ` every dollar invested generates $${(roi / 100).toFixed(2)} in savings.`
                      : ' consider adjusting intervention costs or coverage.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Targeting the top {interventionCoverage}% highest-risk patients (instead of all {patientCount.toLocaleString()})
                    maximizes ROI while keeping costs manageable.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Even a modest {targetReduction}% reduction in readmissions generates {formatCurrency(costAvoidance)}
                    in cost avoidance, demonstrating significant financial impact.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Intervention Examples */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Evidence-Based Intervention Costs</h2>
          <div className="grid md:grid-cols-5 gap-4">
            <button
              onClick={() => setInterventionCostPerPatient(150)}
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left"
            >
              <div className="font-bold text-gray-900 dark:text-white mb-1">Phone Call</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">48-hour post-discharge check-in</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">$150</div>
            </button>
            <button
              onClick={() => setInterventionCostPerPatient(300)}
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left"
            >
              <div className="font-bold text-gray-900 dark:text-white mb-1">TCM Visit</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Transitional care management</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">$300</div>
            </button>
            <button
              onClick={() => setInterventionCostPerPatient(250)}
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left"
            >
              <div className="font-bold text-gray-900 dark:text-white mb-1">Med Recon</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pharmacist medication review</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">$250</div>
            </button>
            <button
              onClick={() => setInterventionCostPerPatient(450)}
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left"
            >
              <div className="font-bold text-gray-900 dark:text-white mb-1">Home Visit</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Nurse home health assessment</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">$450</div>
            </button>
            <button
              onClick={() => setInterventionCostPerPatient(500)}
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left"
            >
              <div className="font-bold text-gray-900 dark:text-white mb-1">Care Coord</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Intensive care coordination</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">$500</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
