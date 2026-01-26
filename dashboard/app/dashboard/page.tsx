// app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import ExecutiveSummary from '@/components/ExecutiveSummary';
import AnimatedKPI from '@/components/AnimatedKPI';
import SavingsCalculator from '@/components/SavingsCalculator';
import RiskDistributionChart from '@/components/RiskDistributionChart';
import HighRiskBreakdownChart from '@/components/HighRiskBreakdownChart';
import AgeRiskChart from '@/components/AgeRiskChart';
import CostImpactChart from '@/components/CostImpactChart';
import NationalBenchmarks from '@/components/NationalBenchmarks';
import TrendSimulation from '@/components/TrendSimulation';
import GoalTracker from '@/components/GoalTracker';
import DataFreshness from '@/components/DataFreshness';
import MemberTable from '@/components/MemberTable';
import DatasetSelector from '@/components/DatasetSelector';
import DatasetInfo from '@/components/DatasetInfo';
import FeatureImportanceChart from '@/components/FeatureImportanceChart';
import { getDataset, Dataset, formatCurrency, calculateTotalCostRange } from '@/lib/data';

export default function DashboardPage() {
  const [selectedDataset, setSelectedDataset] = useState<Dataset>('mimic');

  // Get current dataset
  const currentData = getDataset(selectedDataset);
  const { patientRisks, riskSummary } = currentData;

  // Calculate cost exposure range for high-risk patients
  const highRiskPatients = patientRisks.filter(p => p.risk_score >= 60);
  const totalCostRange = calculateTotalCostRange(highRiskPatients);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Executive Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Real-time risk stratification and intervention planning
          </p>
        </div>
        <DatasetSelector
          currentDataset={selectedDataset}
          onDatasetChange={setSelectedDataset}
        />
      </div>

      {/* Dataset Information */}
      <div className="mb-6">
        <DatasetInfo
          dataset={selectedDataset}
          totalPatients={riskSummary.total_patients}
          readmissionRate={riskSummary.readmission_rate_overall}
          modelAuc={riskSummary.model_auc}
        />
      </div>

      {/* Executive Summary - Full Width */}
      <ExecutiveSummary riskSummary={riskSummary} dataset={selectedDataset} />

      {/* Animated KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnimatedKPI
          title="Total Patients"
          value={riskSummary.total_patients}
          subtitle="Analyzed population"
        />
        <AnimatedKPI
          title="High-Risk Members"
          value={riskSummary.high_risk_count}
          subtitle={`${((riskSummary.high_risk_count / riskSummary.total_patients) * 100).toFixed(1)}% of population`}
          colorClass="text-red-600"
        />
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Cost Exposure</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(totalCostRange.low)} - {formatCurrency(totalCostRange.high)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Based on $10K-$25K benchmarks</p>
        </div>
        <AnimatedKPI
          title="Model Performance"
          value={`${(riskSummary.model_auc * 100).toFixed(0)}%`}
          subtitle="ROC-AUC score"
          colorClass="text-green-600"
        />
      </div>

      {/* Risk Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <p className="text-orange-100 text-sm font-medium">High Risk (60-70%)</p>
          <p className="text-3xl font-bold mt-2">{riskSummary.high_count?.toLocaleString() || 0}</p>
          <p className="text-orange-100 text-sm mt-1">Require monitoring</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <p className="text-red-100 text-sm font-medium">Very High Risk (70-80%)</p>
          <p className="text-3xl font-bold mt-2">{riskSummary.very_high_count?.toLocaleString() || 0}</p>
          <p className="text-red-100 text-sm mt-1">Priority outreach</p>
        </div>
        <div className="bg-gradient-to-br from-red-700 to-red-800 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <p className="text-red-100 text-sm font-medium">Critical Risk (80%+)</p>
          <p className="text-3xl font-bold mt-2">{riskSummary.critical_count?.toLocaleString() || 0}</p>
          <p className="text-red-100 text-sm mt-1">Immediate intervention</p>
        </div>
      </div>

      {/* Charts Row 1 - Population Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RiskDistributionChart riskSummary={riskSummary} />
        <HighRiskBreakdownChart riskSummary={riskSummary} />
      </div>

      {/* Charts Row 2 - Feature Importance & Age Analysis */}
      <div id="risk-factors" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 scroll-mt-20">
        <FeatureImportanceChart dataset={selectedDataset} />
        <AgeRiskChart avgRiskByAge={riskSummary.avg_risk_by_age || {}} />
      </div>

      {/* Charts Row 3 - Cost Impact & Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CostImpactChart costByTier={riskSummary.cost_by_tier || []} />
        <NationalBenchmarks riskSummary={riskSummary} />
      </div>

      {/* Charts Row 4 - Projections & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TrendSimulation
          currentHighRiskCount={riskSummary.high_risk_count}
          currentCostExposure={totalCostRange.mid}
        />
        <GoalTracker
          currentHighRiskCount={riskSummary.high_risk_count}
          currentCostExposure={totalCostRange.mid}
        />
      </div>

      {/* ROI Calculator & Model Info */}
      <div id="roi-calculator" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 scroll-mt-20">
        <div className="lg:col-span-2">
          <SavingsCalculator
            totalHighRiskPatients={riskSummary.high_risk_count}
            avgCostPerReadmission={15000}
          />
        </div>
        <DataFreshness riskSummary={riskSummary} dataset={selectedDataset} />
      </div>

      {/* Member Table (limited view) */}
      <MemberTable members={patientRisks} initialLimit={15} dataset={selectedDataset} />
    </div>
  );
}
