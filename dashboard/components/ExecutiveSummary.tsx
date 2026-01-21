// components/ExecutiveSummary.tsx
'use client';

import Link from 'next/link';
import { RiskSummary, formatCurrency, patientRisks, calculateTotalCostRange } from '@/lib/data';

interface ExecutiveSummaryProps {
  riskSummary: RiskSummary;
}

export default function ExecutiveSummary({ riskSummary }: ExecutiveSummaryProps) {
  // Calculate cost exposure range for high-risk patients
  const highRiskPatients = patientRisks.filter(p => p.risk_score >= 60);
  const totalCostRange = calculateTotalCostRange(highRiskPatients);

  // Generate dynamic insights based on data
  const insights = [
    {
      icon: '⚠️',
      title: 'Critical Priority',
      description: `${riskSummary.critical_count.toLocaleString()} patients have 80%+ risk scores requiring immediate intervention`,
      action: 'Review critical patient list',
      actionHref: '/members',
      urgency: 'high' as const,
    },
    {
      icon: '💰',
      title: 'Cost Exposure',
      description: `${formatCurrency(totalCostRange.low)} - ${formatCurrency(totalCostRange.high)} in preventable readmission costs`,
      action: 'Model intervention ROI',
      actionHref: '#roi-calculator',
      urgency: 'medium' as const,
    },
    {
      icon: '📊',
      title: 'Population Insight',
      description: `${((riskSummary.high_risk_count / riskSummary.total_patients) * 100).toFixed(1)}% of patients are high-risk — above the typical 8-10% benchmark`,
      action: 'Analyze risk factors',
      actionHref: '#risk-factors',
      urgency: 'medium' as const,
    },
  ];

  const urgencyColors = {
    high: 'border-red-500 bg-red-50',
    medium: 'border-orange-500 bg-orange-50',
    low: 'border-blue-500 bg-blue-50',
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 mb-8 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Executive Summary</h2>
          <p className="text-slate-300 text-sm">Key insights requiring attention</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Analysis Date</p>
          <p className="text-sm font-medium">{new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}</p>
          <a
            href="/EXECUTIVE_REPORT.html"
            target="_blank"
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Export Report →
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`rounded-lg p-4 border-l-4 ${urgencyColors[insight.urgency]} text-gray-900`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{insight.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{insight.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                {insight.actionHref.startsWith('/') ? (
                  <Link
                    href={insight.actionHref}
                    className="mt-2 inline-block text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {insight.action} →
                  </Link>
                ) : (
                  <a
                    href={insight.actionHref}
                    className="mt-2 inline-block text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {insight.action} →
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="mt-6 pt-4 border-t border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-white">{riskSummary.total_patients.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Total Analyzed</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-400">{riskSummary.high_risk_count.toLocaleString()}</p>
          <p className="text-xs text-slate-400">High Risk (60%+)</p>
        </div>
        <div>
          <p className="text-xl font-bold text-orange-400">{formatCurrency(totalCostRange.low)} - {formatCurrency(totalCostRange.high)}</p>
          <p className="text-xs text-slate-400">Cost Exposure Range</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-400">{(riskSummary.model_auc * 100).toFixed(0)}%</p>
          <p className="text-xs text-slate-400">Model Accuracy</p>
        </div>
      </div>
    </div>
  );
}
