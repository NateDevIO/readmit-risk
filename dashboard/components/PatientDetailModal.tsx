// components/PatientDetailModal.tsx
'use client';

import { Patient, calculateCostRange, formatCurrency } from '@/lib/data';

interface PatientDetailModalProps {
  patient: Patient | null;
  onClose: () => void;
}

export default function PatientDetailModal({ patient, onClose }: PatientDetailModalProps) {
  if (!patient) return null;

  // Determine risk factors for this patient
  const getRiskFactors = (p: Patient) => {
    const factors: { factor: string; value: string; impact: 'high' | 'medium' | 'low'; explanation: string }[] = [];

    // Prior visits (strongest predictor)
    if (p.total_visits >= 3) {
      factors.push({
        factor: 'High Healthcare Utilization',
        value: `${p.total_visits} prior visits`,
        impact: 'high',
        explanation: 'Multiple prior visits indicate complex care needs'
      });
    }

    // Inpatient history
    if (p.number_inpatient >= 2) {
      factors.push({
        factor: 'Prior Hospitalizations',
        value: `${p.number_inpatient} inpatient stays`,
        impact: 'high',
        explanation: 'History of hospitalizations increases readmission risk'
      });
    }

    // Emergency visits
    if (p.number_emergency >= 2) {
      factors.push({
        factor: 'Emergency Department Use',
        value: `${p.number_emergency} ED visits`,
        impact: 'high',
        explanation: 'Frequent ED use suggests unstable condition management'
      });
    }

    // Polypharmacy
    if (p.num_medications >= 15) {
      factors.push({
        factor: 'Polypharmacy',
        value: `${p.num_medications} medications`,
        impact: 'medium',
        explanation: 'Multiple medications increase complexity and adverse event risk'
      });
    }

    // Length of stay
    if (p.time_in_hospital >= 7) {
      factors.push({
        factor: 'Extended Hospital Stay',
        value: `${p.time_in_hospital} days`,
        impact: 'medium',
        explanation: 'Longer stays often indicate more severe conditions'
      });
    }

    // Age
    if (p.age >= 75) {
      factors.push({
        factor: 'Advanced Age',
        value: `${p.age} years`,
        impact: 'medium',
        explanation: 'Elderly patients have higher readmission rates'
      });
    }

    // Diagnoses
    if (p.number_diagnoses >= 7) {
      factors.push({
        factor: 'Multiple Comorbidities',
        value: `${p.number_diagnoses} diagnoses`,
        impact: 'medium',
        explanation: 'Multiple conditions complicate post-discharge care'
      });
    }

    // Medication changes
    if (p.num_med_changes >= 2) {
      factors.push({
        factor: 'Medication Adjustments',
        value: `${p.num_med_changes} changes`,
        impact: 'low',
        explanation: 'Recent medication changes require careful monitoring'
      });
    }

    return factors;
  };

  const riskFactors = getRiskFactors(patient);

  // Recommended interventions based on risk factors
  const getRecommendations = (factors: typeof riskFactors) => {
    const recommendations: string[] = [];

    if (factors.some(f => f.factor.includes('Polypharmacy') || f.factor.includes('Medication'))) {
      recommendations.push('Medication reconciliation with pharmacist review');
    }
    if (factors.some(f => f.factor.includes('Emergency') || f.factor.includes('Hospitalizations'))) {
      recommendations.push('Transitional care management enrollment');
    }
    if (factors.some(f => f.factor.includes('Age'))) {
      recommendations.push('Home health assessment within 48 hours');
    }
    if (factors.some(f => f.factor.includes('Comorbidities'))) {
      recommendations.push('Care coordination with dedicated case manager');
    }
    if (recommendations.length === 0) {
      recommendations.push('Post-discharge phone call within 48-72 hours');
    }
    recommendations.push('Schedule follow-up appointment within 7 days');

    return recommendations;
  };

  const recommendations = getRecommendations(riskFactors);

  const impactColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-orange-100 text-orange-800 border-orange-200',
    low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  const getRiskLevelColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-100';
    if (score >= 70) return 'text-orange-600 bg-orange-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Patient Risk Profile</h2>
            <p className="text-sm text-gray-500">ID: {patient.patient_id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Risk Score Banner */}
          <div className={`rounded-lg p-4 mb-6 ${getRiskLevelColor(patient.risk_score)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">30-Day Readmission Risk</p>
                <p className="text-4xl font-bold">{patient.risk_score.toFixed(1)}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium opacity-80">Cost Exposure Range</p>
                {(() => {
                  const range = calculateCostRange(patient.risk_score);
                  return (
                    <>
                      <p className="text-xl font-bold">{formatCurrency(range.low)} - {formatCurrency(range.high)}</p>
                      <p className="text-xs opacity-60">Based on $10K-$25K benchmarks</p>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Patient Demographics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Age</p>
              <p className="text-lg font-semibold">{patient.age} years</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Hospital Stay</p>
              <p className="text-lg font-semibold">{patient.time_in_hospital} days</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Medications</p>
              <p className="text-lg font-semibold">{patient.num_medications}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Diagnoses</p>
              <p className="text-lg font-semibold">{patient.number_diagnoses}</p>
            </div>
          </div>

          {/* Why High Risk Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              Why This Patient Is High Risk
            </h3>
            {riskFactors.length > 0 ? (
              <div className="space-y-2">
                {riskFactors.map((factor, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${impactColors[factor.impact]}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{factor.factor}</span>
                      <span className="text-sm font-semibold">{factor.value}</span>
                    </div>
                    <p className="text-xs mt-1 opacity-75">{factor.explanation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No specific high-risk factors identified beyond base risk level.</p>
            )}
          </div>

          {/* Recommended Interventions */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-green-500">💡</span>
              Recommended Interventions
            </h3>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Add to Outreach List
            </button>
            <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              Print Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
