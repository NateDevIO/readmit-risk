export default function CaseStudySection() {
  return (
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
              <div className="text-sm text-gray-600">Reduction in readmission rate (16.2% &rarr; 13.3%)</div>
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
            <strong className="text-blue-900">&quot;This platform transformed our care management approach.</strong> Instead of
            chasing every patient, we now focus our limited resources where they make the biggest impact. The ROI calculator
            helped us justify expanding our transitional care team.&quot;
          </p>
          <p className="text-xs text-gray-500 mt-2">&mdash; Director of Population Health, Regional Health System (simulated testimonial)</p>
        </div>
      </div>
    </div>
  );
}
