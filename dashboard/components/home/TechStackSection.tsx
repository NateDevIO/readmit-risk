export default function TechStackSection() {
  return (
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
  );
}
