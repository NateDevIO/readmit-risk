export default function ChallengeSection() {
  return (
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
  );
}
