export default function MethodologySection() {
  return (
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
  );
}
