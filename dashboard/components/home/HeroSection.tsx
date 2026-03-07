import Link from 'next/link';

export default function HeroSection() {
  return (
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
  );
}
