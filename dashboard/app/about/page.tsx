// app/about/page.tsx
export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            About ReadmitRisk
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Clinical context, healthcare quality measures, and why readmissions matter
          </p>
        </div>

        {/* Why This Matters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Why Hospital Readmissions Matter</h2>

          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              Hospital readmissions within 30 days are a critical healthcare quality and cost issue. Nationally,
              approximately <strong>3.8 million Medicare beneficiaries</strong> are readmitted each year, costing
              Medicare over <strong>$26 billion annually</strong>. Many of these readmissions are preventable with
              proper transitional care and post-discharge support.
            </p>

            <div className="grid md:grid-cols-3 gap-4 my-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">$26B</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Annual Medicare cost</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">3.8M</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Medicare readmissions/year</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">15-20%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Typical readmission rate</div>
              </div>
            </div>

            <p>
              Beyond cost, readmissions represent a failure in care transitions and negatively impact patient outcomes.
              Patients who are readmitted experience decreased quality of life, increased mortality risk, and reduced
              confidence in the healthcare system.
            </p>
          </div>
        </div>

        {/* CMS Quality Measures */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            CMS Quality Measures & Regulatory Alignment
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Hospital Readmissions Reduction Program (HRRP)
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                Since 2012, CMS has penalized hospitals with excess readmissions through the HRRP. Penalties can reach up
                to <strong>3% of all Medicare payments</strong>, totaling <strong>$563 million</strong> in FY2023 across
                2,500+ hospitals.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 rounded p-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>This platform addresses HRRP:</strong> By identifying high-risk patients and targeting interventions,
                  hospitals can reduce readmission rates and avoid CMS penalties.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Medicare Advantage Star Ratings
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                Health plans are rated on readmission metrics that directly impact Star Ratings and bonus payments:
              </p>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span><strong>D16:</strong> Plan All-Cause Readmissions (30-day hospital-wide)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span><strong>D17:</strong> Heart Failure (HF) Admissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span><strong>D24:</strong> COPD or Asthma Admissions</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                HEDIS Measures
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                NCQA's HEDIS (Healthcare Effectiveness Data and Information Set) includes:
              </p>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span><strong>PCR:</strong> Plan All-Cause Readmissions (aligns with CMS D16)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span><strong>FUH:</strong> Follow-Up After Hospitalization for Mental Illness (7 & 30 days)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Clinical Guidelines */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Evidence-Based Clinical Guidelines
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Care Transitions Interventions</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Research demonstrates that structured care transitions programs reduce readmissions by 20-30%.
                Key evidence-based interventions include:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 text-sm mb-2">Transitional Care Model (TCM)</h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                    Advanced practice nurse visits within 24-48 hours post-discharge
                  </p>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Evidence:</strong> 50% reduction in readmissions (Naylor et al., JAMA 2004)
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-300 text-sm mb-2">Project RED (Re-Engineered Discharge)</h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                    Patient education, medication reconciliation, post-discharge phone call
                  </p>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Evidence:</strong> 30% reduction in readmissions (Jack et al., Ann Intern Med 2009)
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-300 text-sm mb-2">Care Transitions Intervention (CTI)</h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                    Transitions coach empowers patients in self-management
                  </p>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Evidence:</strong> 24% reduction in readmissions (Coleman et al., Arch Intern Med 2006)
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-300 text-sm mb-2">BOOST (Better Outcomes by Optimizing Safe Transitions)</h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                    Hospital-based toolkit with risk assessment and teach-back methods
                  </p>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Evidence:</strong> 18% reduction in readmissions (Society of Hospital Medicine)
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">AHA/ACC Guidelines</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                American Heart Association and American College of Cardiology recommend:
              </p>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 ml-4 mt-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Follow-up appointment within <strong>7 days</strong> of discharge for heart failure patients</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Post-discharge phone call within <strong>48-72 hours</strong> to assess symptoms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Medication reconciliation by pharmacist to prevent adverse drug events</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Risk Factors Explained */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Understanding Readmission Risk Factors
          </h2>

          <div className="space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Our model incorporates clinically validated risk factors supported by peer-reviewed research:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 rounded p-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Polypharmacy (10+ medications)</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Joynt & Jha (2012):</strong> Each additional medication increases readmission risk by 4%.
                    Polypharmacy linked to medication non-adherence, drug interactions, and adverse events.
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-600 rounded p-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Prior Hospitalizations</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Halfon et al. (2002):</strong> Previous admissions are the strongest predictor of readmission,
                    indicating chronic disease burden and care gaps.
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-600 rounded p-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Emergency Department Visits</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Billings et al. (2000):</strong> Frequent ED use indicates inadequate primary care access,
                    unmanaged chronic conditions, and social barriers.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600 rounded p-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Length of Stay (LOS)</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Krumholz et al. (1997):</strong> Longer LOS correlates with illness severity, functional
                    decline, and higher readmission risk (especially &gt;7 days).
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 rounded p-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Comorbidity Burden</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Elixhauser et al. (1998):</strong> Number of diagnoses (especially heart failure, COPD, diabetes,
                    renal disease) strongly predicts readmission.
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-600 rounded p-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Lack of Follow-Up</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Hernandez et al. (2010):</strong> Patients who see a physician within 7 days of discharge have
                    50% lower readmission rates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Glossary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Healthcare Terminology Glossary</h2>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">AUC-ROC</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Area Under the Receiver Operating Characteristic Curve. Measures model discrimination (0.5 = random, 1.0 = perfect).
                0.60-0.70 is considered acceptable for clinical prediction models.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Excess Readmission Ratio</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                CMS metric comparing a hospital's readmission rate to national expected rate, adjusted for patient mix.
                &gt;1.0 = higher than expected, triggers HRRP penalties.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Care Transitions</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                The movement of patients between healthcare settings (hospital → home, hospital → SNF). Poor transitions
                lead to medication errors, missed follow-ups, and readmissions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">SNF (Skilled Nursing Facility)</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Post-acute care facility providing nursing care and rehabilitation after hospital discharge. Patients
                discharged to SNF have different readmission patterns than home discharges.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">SMOTE</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Synthetic Minority Over-sampling Technique. Used to balance datasets where readmissions (8-20%) are much
                less common than non-readmissions, preventing model bias toward majority class.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Sensitivity vs. Specificity</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Sensitivity (recall) = % of actual readmissions correctly identified. Specificity = % of non-readmissions
                correctly identified. Care management prioritizes sensitivity to avoid missing high-risk patients.
              </p>
            </div>
          </div>
        </div>

        {/* Data Disclaimer */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Important Disclaimer
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>This is a demonstration platform using historical data for educational purposes only.</strong> The UCI
            diabetes dataset (1999-2008) and MIMIC-IV ICU data (2008-2019) may not reflect current clinical practice
            patterns, medication formulations, or care delivery models. Risk predictions and cost estimates should not be
            used for clinical decision-making without validation on current data from your specific patient population.
            This platform demonstrates technical capabilities in healthcare analytics but requires external validation,
            regulatory review, and clinical governance before production deployment.
          </p>
        </div>
      </div>
    </div>
  );
}
