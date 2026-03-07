export default function DataSourcesSection() {
  return (
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
  );
}
