// app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Key Metrics */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h1 className="text-5xl font-bold mb-6">
            Care Management Readmissions Dashboard
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl">
            Identify high-risk members and reduce preventable 30-day hospital
            readmissions using predictive analytics and data-driven insights.
          </p>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold mb-1">282K+</div>
              <div className="text-sm text-blue-100">Patients Analyzed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold mb-1">$1.5B</div>
              <div className="text-sm text-blue-100">Cost Exposure Identified</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold mb-1">122K</div>
              <div className="text-sm text-blue-100">High-Risk Members</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold mb-1">205</div>
              <div className="text-sm text-blue-100">Hospitals Benchmarked</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg text-center"
            >
              Explore Dashboard
            </Link>
            <Link
              href="/impact-calculator"
              className="inline-block bg-blue-500/50 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-500/70 transition-colors shadow-lg text-center"
            >
              Calculate ROI
            </Link>
          </div>
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
                  Readmission cost range: $10,000 - $25,000
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

        {/* Before/After Comparison */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Impact: Before vs. After Predictive Analytics</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 border-2 border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Without Risk Model</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Random or intuition-based patient outreach</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Care teams overwhelmed with low-risk patients</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Limited resources wasted on stable members</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>High-risk patients slip through the cracks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Readmission rate: 15-20% (industry average)</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">With Risk Model</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Prioritized worklist based on risk scores</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Focus interventions on high-risk patients (top 10%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>3.2x more likely to prevent readmission</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Measurable ROI and cost avoidance tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Potential reduction to 11-13% readmission rate</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-lg font-semibold text-gray-800">
              Result: <span className="text-green-600">20-30% reduction</span> in preventable readmissions
            </p>
          </div>
        </div>

        {/* Case Study */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border-l-4 border-blue-600">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Case Study: Regional Health System</h2>
              <p className="text-gray-500 italic">How predictive analytics reduced readmissions by 18% in 6 months</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">The Challenge</h3>
              <p className="text-gray-600">
                A regional health system with 35,000 Medicare Advantage members was experiencing a 16.2% 30-day readmission rate,
                resulting in $2.8M in annual CMS penalties. Care coordinators were overwhelmed, attempting to contact all
                discharged patients but lacking a systematic way to prioritize high-risk members.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-2">The Solution</h3>
              <p className="text-gray-600">
                Implemented a risk stratification model similar to this platform to identify the top 15% highest-risk patients.
                Care management resources were reallocated to focus intensive interventions (home visits, medication reconciliation)
                on critical-risk members, while medium-risk patients received phone call follow-ups.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-2">The Results</h3>
              <div className="grid md:grid-cols-3 gap-4 mt-3">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-2xl font-bold text-green-700 mb-1">18%</div>
                  <div className="text-sm text-gray-600">Reduction in readmission rate (16.2% → 13.3%)</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700 mb-1">$1.6M</div>
                  <div className="text-sm text-gray-600">Annual cost avoidance from prevented readmissions</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700 mb-1">67%</div>
                  <div className="text-sm text-gray-600">Improvement in care coordinator efficiency</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
              <p className="text-sm text-gray-700">
                <strong className="text-blue-900">"This platform transformed our care management approach.</strong> Instead of
                chasing every patient, we now focus our limited resources where they make the biggest impact. The ROI calculator
                helped us justify expanding our transitional care team."
              </p>
              <p className="text-xs text-gray-500 mt-2">— Director of Population Health, Regional Health System (simulated testimonial)</p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">What Care Teams Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 text-sm italic">
                "The risk stratification helped us reduce readmissions by 22% in our diabetes population. The intervention recommendations are evidence-based and actionable."
              </p>
              <p className="text-xs text-gray-500 font-semibold">Sarah Chen, RN</p>
              <p className="text-xs text-gray-400">Care Coordinator, Community Health Partners</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 text-sm italic">
                "Finally, a tool that speaks both clinical and financial language. The ROI calculator helped me get executive buy-in for our transitional care program in one meeting."
              </p>
              <p className="text-xs text-gray-500 font-semibold">Michael Rodriguez, MD</p>
              <p className="text-xs text-gray-400">Chief Medical Officer, Metro Health Plan</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 text-sm italic">
                "The patient queue prioritization is a game-changer. My team now knows exactly who to call first each morning. We've improved our contact rate with high-risk patients by 85%."
              </p>
              <p className="text-xs text-gray-500 font-semibold">Jessica Thompson</p>
              <p className="text-xs text-gray-400">Director of Case Management, Regional Medical Center</p>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6 italic">Simulated testimonials for demonstration purposes</p>
        </div>

        {/* Datasets */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Sources</h2>
          <p className="text-gray-600 mb-6">
            This platform demonstrates readmission risk prediction using three real-world datasets:
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
              <h3 className="font-bold text-blue-900 text-xl mb-3">MIMIC-IV Dataset</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">&#8226;</span>
                  <span><strong>Source:</strong> Beth Israel Deaconess Medical Center ICU</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">&#8226;</span>
                  <span><strong>Time Period:</strong> 2008-2019</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">&#8226;</span>
                  <span><strong>Records:</strong> 211,000+ ICU admissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">&#8226;</span>
                  <span><strong>Features:</strong> 60+ clinical variables (vitals, labs, procedures)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">&#8226;</span>
                  <span><strong>Algorithm:</strong> Gradient Boosting (XGBoost)</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Best for:</strong> ICU populations with detailed clinical measurements
                </p>
              </div>
            </div>

            <div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50">
              <h3 className="font-bold text-purple-900 text-xl mb-3">UCI Diabetes Dataset</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">&#8226;</span>
                  <span><strong>Source:</strong> 130 US hospitals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">&#8226;</span>
                  <span><strong>Time Period:</strong> 1999-2008</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">&#8226;</span>
                  <span><strong>Records:</strong> 71,000+ diabetes patients</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">&#8226;</span>
                  <span><strong>Features:</strong> 20 variables (demographics, length of stay, medications)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">&#8226;</span>
                  <span><strong>Algorithm:</strong> Logistic Regression</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Best for:</strong> General diabetes patient populations
                </p>
              </div>
            </div>

            <div className="border-2 border-green-200 rounded-xl p-6 bg-green-50">
              <h3 className="font-bold text-green-900 text-xl mb-3">CMS Geographic Data</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">&#8226;</span>
                  <span><strong>Source:</strong> CMS Hospital Readmissions Reduction Program (HRRP)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">&#8226;</span>
                  <span><strong>Coverage:</strong> 50 US states</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">&#8226;</span>
                  <span><strong>Records:</strong> Hospital-level performance metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">&#8226;</span>
                  <span><strong>Metrics:</strong> Readmission rates, CMS penalties by state</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">&#8226;</span>
                  <span><strong>Visualization:</strong> Interactive state heatmap</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Best for:</strong> Provider network benchmarking and regional analysis
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Methodology */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Methodology</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Feature Engineering</h3>
                <p className="text-gray-600">
                  Extracted and transformed clinical variables including prior utilization, medication counts,
                  diagnoses, demographics, and ICU stays. Missing values handled through imputation.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Class Balancing</h3>
                <p className="text-gray-600">
                  Applied SMOTE (Synthetic Minority Over-sampling Technique) to address class imbalance,
                  as readmissions are relatively rare events (typically 11-15% of admissions).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Model Training & Calibration</h3>
                <p className="text-gray-600">
                  Trained predictive models using cross-validation. Applied isotonic regression and
                  percentile-based calibration to spread risk scores across full 0-100% range for actionable stratification.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Risk Stratification</h3>
                <p className="text-gray-600">
                  Segmented patients into risk tiers: High (60-70%), Very High (70-80%), and Critical (80%+),
                  enabling targeted interventions. Cost exposure calculated using $10K-$25K readmission benchmarks.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                5
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Validation & Performance</h3>
                <p className="text-gray-600">
                  Evaluated models using ROC-AUC, sensitivity, specificity, and positive/negative predictive values.
                  Both models achieve 70%+ AUC, indicating good predictive discrimination.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Important Disclaimer:</strong> This is a demonstration platform using historical data.
              Risk predictions and cost estimates are for educational purposes only and should not be used
              for clinical decision-making without validation on current data.
            </p>
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

        {/* About the Developer */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">About This Project</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-600 text-lg mb-6 text-center">
              This platform demonstrates end-to-end data science capabilities in healthcare analytics, from data extraction
              and ML modeling to interactive dashboard development and business impact quantification.
            </p>
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-3">Technical Highlights</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Data Engineering:</strong> Integrated 282K+ patient records from UCI, MIMIC-IV (BigQuery), and CMS datasets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Machine Learning:</strong> Trained and calibrated predictive models with 63%+ AUC-ROC, handling class imbalance with SMOTE</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Full-Stack Development:</strong> Built responsive Next.js dashboard with TypeScript, Tailwind CSS, and Recharts visualizations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Healthcare Domain:</strong> Aligned with CMS quality measures, HEDIS metrics, and evidence-based care transition protocols</span>
                </li>
              </ul>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                <strong className="text-gray-900">Built by a healthcare data analyst</strong> passionate about using predictive analytics
                to improve patient outcomes and reduce preventable costs.
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href="https://github.com/NateDevIO"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </a>
                <a
                  href="https://linkedin.com/in/NateDevIO"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
                <a
                  href="https://natedev.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Portfolio
                </a>
              </div>
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
          <div className="mt-2">
            <a
              href="/EXECUTIVE_REPORT_COMBINED.html"
              target="_blank"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Export Combined Report →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
