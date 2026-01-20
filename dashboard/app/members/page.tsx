// app/members/page.tsx
import MemberTable from '@/components/MemberTable';
import { patientRisks, riskSummary } from '@/lib/data';

export default function MembersPage() {
  // Calculate stats from the actual patient data
  const criticalCount = patientRisks.filter(p => p.risk_score >= 80).length;
  const veryHighCount = patientRisks.filter(p => p.risk_score >= 70 && p.risk_score < 80).length;
  const highCount = patientRisks.filter(p => p.risk_score >= 60 && p.risk_score < 70).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Member Risk List</h1>
        <p className="text-gray-500 mt-1">
          {patientRisks.length.toLocaleString()} high-risk members (60%+ risk score) from{' '}
          {riskSummary.total_patients.toLocaleString()} total patients
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Avg Risk Score</p>
          <p className="text-2xl font-bold">{riskSummary.avg_risk_score.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Median Risk Score</p>
          <p className="text-2xl font-bold">{riskSummary.median_risk_score.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Critical (80%+)</p>
          <p className="text-2xl font-bold text-red-600">
            {criticalCount.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Very High (70-80%)</p>
          <p className="text-2xl font-bold text-orange-600">
            {veryHighCount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Risk tier summary */}
      <div className="bg-white rounded-xl shadow-md p-6 border mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Risk Tier Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-700">{criticalCount.toLocaleString()}</p>
            <p className="text-sm text-red-600 font-medium">Critical (80%+)</p>
            <p className="text-xs text-gray-500 mt-1">Immediate intervention needed</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-3xl font-bold text-orange-700">{veryHighCount.toLocaleString()}</p>
            <p className="text-sm text-orange-600 font-medium">Very High (70-80%)</p>
            <p className="text-xs text-gray-500 mt-1">Priority outreach</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-700">{highCount.toLocaleString()}</p>
            <p className="text-sm text-yellow-600 font-medium">High (60-70%)</p>
            <p className="text-xs text-gray-500 mt-1">Proactive monitoring</p>
          </div>
        </div>
      </div>

      {/* Full Member Table */}
      <MemberTable members={patientRisks} initialLimit={50} />
    </div>
  );
}
