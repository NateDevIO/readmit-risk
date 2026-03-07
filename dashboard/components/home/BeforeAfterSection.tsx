export default function BeforeAfterSection() {
  return (
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
              <span className="text-red-500 font-bold">&#10007;</span>
              <span>Random or intuition-based patient outreach</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">&#10007;</span>
              <span>Care teams overwhelmed with low-risk patients</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">&#10007;</span>
              <span>Limited resources wasted on stable members</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">&#10007;</span>
              <span>High-risk patients slip through the cracks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">&#10007;</span>
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
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>Prioritized worklist based on risk scores</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>Focus interventions on high-risk patients (top 10%)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>3.2x more likely to prevent readmission</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>Measurable ROI and cost avoidance tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">&#10003;</span>
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
  );
}
