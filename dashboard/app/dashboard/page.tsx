// app/dashboard/page.tsx
import ExecutiveSummary from '@/components/ExecutiveSummary';
import AnimatedKPI from '@/components/AnimatedKPI';
import SavingsCalculator from '@/components/SavingsCalculator';
import RiskDistributionChart from '@/components/RiskDistributionChart';
import HighRiskBreakdownChart from '@/components/HighRiskBreakdownChart';
import RiskFactorsChart from '@/components/RiskFactorsChart';
import AgeRiskChart from '@/components/AgeRiskChart';
import CostImpactChart from '@/components/CostImpactChart';
import NationalBenchmarks from '@/components/NationalBenchmarks';
import TrendSimulation from '@/components/TrendSimulation';
import GoalTracker from '@/components/GoalTracker';
import DataFreshness from '@/components/DataFreshness';
import MemberTable from '@/components/MemberTable';
import { patientRisks, riskSummary, formatCurrency } from '@/lib/data';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Executive Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Real-time risk stratification and intervention planning
        </p>
      </div>

      {/* Executive Summary - Full Width */}
      <ExecutiveSummary riskSummary={riskSummary} />

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
        <AnimatedKPI
          title="Total Cost Exposure"
          value={formatCurrency(riskSummary.total_cost_exposure)}
          rawValue={riskSummary.total_cost_exposure}
          subtitle="Preventable readmission costs"
          colorClass="text-orange-600"
        />
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

      {/* Charts Row 2 - Risk Factors & Age Analysis */}
      <div id="risk-factors" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 scroll-mt-20">
        <RiskFactorsChart riskFactors={riskSummary.risk_factors} />
        <AgeRiskChart avgRiskByAge={riskSummary.avg_risk_by_age} />
      </div>

      {/* Charts Row 3 - Cost Impact & Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CostImpactChart costByTier={riskSummary.cost_by_tier} />
        <NationalBenchmarks riskSummary={riskSummary} />
      </div>

      {/* Charts Row 4 - Projections & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TrendSimulation
          currentHighRiskCount={riskSummary.high_risk_count}
          currentCostExposure={riskSummary.total_cost_exposure}
        />
        <GoalTracker
          currentHighRiskCount={riskSummary.high_risk_count}
          currentCostExposure={riskSummary.total_cost_exposure}
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
        <DataFreshness riskSummary={riskSummary} />
      </div>

      {/* Member Table (limited view) */}
      <MemberTable members={patientRisks} initialLimit={15} />
    </div>
  );
}
