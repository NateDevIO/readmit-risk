// app/page.tsx
import Link from 'next/link';
import { riskSummary, formatCurrency } from '@/lib/data';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <h1 className="text-5xl font-bold mb-6">
            Care Management Readmissions Dashboard
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl">
            Identify high-risk members and reduce preventable 30-day hospital
            readmissions using predictive analytics and data-driven insights.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
          >
            Explore Dashboard
          </Link>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">The Challenge</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Hospital readmissions within 30 days cost Medicare over{' '}
                <strong className="text-gray-900">$17 billion annually</strong>.
                Health plans face penalties and poor quality ratings when
                readmission rates exceed benchmarks.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Care management teams need to prioritize which members receive
                post-discharge interventions to maximize impact with limited resources.
              </p>
            </div>
            <div className="bg-red-50 rounded-xl p-6">
              <h3 className="font-bold text-red-800 mb-4">Cost Impact</h3>
              <ul className="space-y-3 text-red-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">&#8226;</span>
                  Average readmission cost: $15,000+
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">&#8226;</span>
                  CMS penalties up to 3% of Medicare payments
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">&#8226;</span>
                  HEDIS scores impact Star Ratings
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">&#8226;</span>
                  Member health deterioration
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Findings */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Insights</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {riskSummary.readmission_rate_overall.toFixed(1)}%
              </p>
              <p className="text-gray-600">Readmission Rate</p>
            </div>
            <div className="text-center p-4">
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {riskSummary.high_risk_count.toLocaleString()}
              </p>
              <p className="text-gray-600">High-Risk Members</p>
            </div>
            <div className="text-center p-4">
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {formatCurrency(riskSummary.total_cost_exposure)}
              </p>
              <p className="text-gray-600">Cost Exposure</p>
            </div>
            <div className="text-center p-4">
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {(riskSummary.model_auc * 100).toFixed(0)}%
              </p>
              <p className="text-gray-600">Model AUC</p>
            </div>
          </div>
        </div>

        {/* Technical Stack */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Technical Stack</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-gray-800 mb-3">Data Analysis</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Python 3.11+ with Pandas, NumPy</li>
                <li>Scikit-learn for ML modeling</li>
                <li>SMOTE for class imbalance handling</li>
                <li>Jupyter Notebooks for analysis</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-3">Web Dashboard</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Next.js 14 with React & TypeScript</li>
                <li>Tailwind CSS for styling</li>
                <li>Recharts for visualizations</li>
                <li>Vercel for hosting</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View Full Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
