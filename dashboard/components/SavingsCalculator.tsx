// components/SavingsCalculator.tsx
'use client';

import { useState, useMemo } from 'react';

interface InterventionPreset {
  name: string;
  description: string;
  costRange: [number, number];
  effectivenessRange: [number, number];
  source: string;
}

const INTERVENTION_PRESETS: InterventionPreset[] = [
  {
    name: 'Post-Discharge Phone Calls',
    description: 'Nurse-led follow-up calls within 48-72 hours',
    costRange: [50, 100],
    effectivenessRange: [10, 15],
    source: 'CMS Care Transitions',
  },
  {
    name: 'Transitional Care Management',
    description: 'Comprehensive 30-day post-discharge program',
    costRange: [200, 400],
    effectivenessRange: [20, 30],
    source: 'TCM Studies',
  },
  {
    name: 'Medication Reconciliation',
    description: 'Pharmacist-led medication review and education',
    costRange: [75, 150],
    effectivenessRange: [15, 20],
    source: 'AHRQ Guidelines',
  },
  {
    name: 'Home Health Visits',
    description: 'In-home nursing assessment and monitoring',
    costRange: [300, 500],
    effectivenessRange: [25, 35],
    source: 'SNF Data',
  },
  {
    name: 'Care Coordination',
    description: 'Dedicated care manager for high-risk patients',
    costRange: [150, 250],
    effectivenessRange: [15, 25],
    source: 'ACO Models',
  },
  {
    name: 'Custom',
    description: 'Define your own intervention parameters',
    costRange: [100, 100],
    effectivenessRange: [20, 20],
    source: 'User-defined',
  },
];

interface SavingsCalculatorProps {
  totalHighRiskPatients: number;
  avgCostPerReadmission?: number;
}

export default function SavingsCalculator({
  totalHighRiskPatients,
  avgCostPerReadmission = 15000,
}: SavingsCalculatorProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('Transitional Care Management');
  const [effectiveness, setEffectiveness] = useState(25);
  const [costPerIntervention, setCostPerIntervention] = useState(300);
  const [targetPercentage, setTargetPercentage] = useState(100);

  // Update sliders when preset changes
  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = INTERVENTION_PRESETS.find((p) => p.name === presetName);
    if (preset && presetName !== 'Custom') {
      // Set to midpoint of ranges
      setCostPerIntervention(Math.round((preset.costRange[0] + preset.costRange[1]) / 2));
      setEffectiveness(Math.round((preset.effectivenessRange[0] + preset.effectivenessRange[1]) / 2));
    }
  };

  const currentPreset = INTERVENTION_PRESETS.find((p) => p.name === selectedPreset);

  const calculations = useMemo(() => {
    const targetedPatients = Math.round(totalHighRiskPatients * (targetPercentage / 100));
    const readmissionsAvoided = Math.round(targetedPatients * (effectiveness / 100));
    const grossSavings = readmissionsAvoided * avgCostPerReadmission;
    const totalInterventionCost = targetedPatients * costPerIntervention;
    const netSavings = grossSavings - totalInterventionCost;
    const roi = totalInterventionCost > 0
      ? ((netSavings / totalInterventionCost) * 100).toFixed(0)
      : 0;
    const costPerReadmissionAvoided = readmissionsAvoided > 0
      ? totalInterventionCost / readmissionsAvoided
      : 0;

    return {
      targetedPatients,
      readmissionsAvoided,
      grossSavings,
      totalInterventionCost,
      netSavings,
      roi,
      costPerReadmissionAvoided,
    };
  }, [totalHighRiskPatients, effectiveness, costPerIntervention, avgCostPerReadmission, targetPercentage]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Intervention ROI Calculator
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Model potential savings from evidence-based intervention programs
      </p>

      {/* Intervention Presets */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Intervention Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {INTERVENTION_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetChange(preset.name)}
              className={`p-3 rounded-lg text-left transition-all ${
                selectedPreset === preset.name
                  ? 'bg-blue-50 border-2 border-blue-500 ring-1 ring-blue-200'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <p className={`text-sm font-semibold ${
                selectedPreset === preset.name ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {preset.name}
              </p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {preset.description}
              </p>
            </button>
          ))}
        </div>

        {currentPreset && selectedPreset !== 'Custom' && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
            <div className="flex justify-between text-blue-800">
              <span>Typical Cost: ${currentPreset.costRange[0]}-${currentPreset.costRange[1]}</span>
              <span>Effectiveness: {currentPreset.effectivenessRange[0]}-{currentPreset.effectivenessRange[1]}%</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">Source: {currentPreset.source}</p>
          </div>
        )}
      </div>

      {/* Sliders */}
      <div className="space-y-5 mb-8">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Target Population
            </label>
            <span className="text-sm font-bold text-blue-600">
              {calculations.targetedPatients.toLocaleString()} patients ({targetPercentage}%)
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={targetPercentage}
            onChange={(e) => setTargetPercentage(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Critical only (10%)</span>
            <span>All high-risk (100%)</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Intervention Effectiveness
            </label>
            <span className="text-sm font-bold text-blue-600">
              {effectiveness}% reduction
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            value={effectiveness}
            onChange={(e) => {
              setEffectiveness(Number(e.target.value));
              setSelectedPreset('Custom');
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5% (minimal)</span>
            <span>Conservative: 15-20%</span>
            <span>50% (optimistic)</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Cost per Intervention
            </label>
            <span className="text-sm font-bold text-blue-600">
              ${costPerIntervention}
            </span>
          </div>
          <input
            type="range"
            min="25"
            max="600"
            step="25"
            value={costPerIntervention}
            onChange={(e) => {
              setCostPerIntervention(Number(e.target.value));
              setSelectedPreset('Custom');
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>$25 (phone call)</span>
            <span>$600 (intensive)</span>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">Readmissions Avoided</p>
          <p className="text-2xl font-bold text-green-600">
            {calculations.readmissionsAvoided.toLocaleString()}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">Gross Savings</p>
          <p className="text-2xl font-bold text-green-600">
            ${(calculations.grossSavings / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">Program Cost</p>
          <p className="text-2xl font-bold text-red-600">
            ${(calculations.totalInterventionCost / 1000000).toFixed(2)}M
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-700 font-medium">Net Savings</p>
          <p className={`text-2xl font-bold ${calculations.netSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            ${(calculations.netSavings / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>

      {/* ROI Highlight */}
      <div className={`rounded-lg p-6 text-center ${
        Number(calculations.roi) >= 0
          ? 'bg-gradient-to-r from-blue-500 to-blue-600'
          : 'bg-gradient-to-r from-red-500 to-red-600'
      }`}>
        <p className="text-blue-100 text-sm font-medium mb-1">
          Return on Investment
        </p>
        <p className="text-4xl font-bold text-white">{calculations.roi}%</p>
        <p className="text-blue-100 text-xs mt-2">
          Cost per readmission avoided: ${calculations.costPerReadmissionAvoided.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>

      {/* Methodology Note */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500">
          <strong>Assumptions:</strong> Based on {totalHighRiskPatients.toLocaleString()} high-risk members
          with avg readmission cost of ${avgCostPerReadmission.toLocaleString()}.
          Effectiveness rates based on published literature. Actual results may vary.
        </p>
      </div>
    </div>
  );
}
