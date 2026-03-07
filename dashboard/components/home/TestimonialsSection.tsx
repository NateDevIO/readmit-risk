export default function TestimonialsSection() {
  return (
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
            &quot;The risk stratification helped us reduce readmissions by 22% in our diabetes population. The intervention recommendations are evidence-based and actionable.&quot;
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
            &quot;Finally, a tool that speaks both clinical and financial language. The ROI calculator helped me get executive buy-in for our transitional care program in one meeting.&quot;
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
            &quot;The patient queue prioritization is a game-changer. My team now knows exactly who to call first each morning. We&apos;ve improved our contact rate with high-risk patients by 85%.&quot;
          </p>
          <p className="text-xs text-gray-500 font-semibold">Jessica Thompson</p>
          <p className="text-xs text-gray-400">Director of Case Management, Regional Medical Center</p>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-6 italic">Simulated testimonials for demonstration purposes</p>
    </div>
  );
}
