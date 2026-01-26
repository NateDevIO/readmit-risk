// app/model-performance/page.tsx
'use client';

import React from 'react';

export default function ModelPerformance() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Model Performance Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Technical deep dive into model accuracy, features, and validation
          </p>
        </div>

        {/* Model Comparison Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* UCI Model */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">UCI Diabetes Model</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Logistic Regression | 71,518 patients</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">AUC-ROC</div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">0.564</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Moderate discrimination</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Readmission Rate</div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">8.8%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Diabetes cohort</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Performance Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sensitivity (Recall)</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '72%'}}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">72%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Specificity</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '48%'}}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">48%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Precision</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '11%'}}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">11%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Clinical Interpretation</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Model captures 72% of actual readmissions (high sensitivity) but has moderate specificity.
                  Optimized for recall to minimize missed high-risk patients in care management workflows.
                </p>
              </div>
            </div>
          </div>

          {/* MIMIC Model */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">MIMIC-IV ICU Model</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gradient Boosting | 211,354 patients</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">AUC-ROC</div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">0.630</div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">+12% vs UCI</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Readmission Rate</div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">20.5%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">ICU population</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Performance Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sensitivity (Recall)</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '68%'}}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">68%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Specificity</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '58%'}}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">58%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Precision</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '28%'}}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">28%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Clinical Interpretation</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Enhanced model with 60+ clinical features (labs, vitals, procedures) improves discrimination by 12%.
                  Better balance of sensitivity and specificity makes it suitable for broader ICU populations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why We Chose This Model */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Model Selection Rationale</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-bold text-gray-900 dark:text-white">UCI Model (Production)</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chosen for general diabetes populations. Uses administrative features (visits, medications, diagnoses)
                available in most EHRs. Simple, interpretable, and fast to implement.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="font-bold text-gray-900 dark:text-white">MIMIC Model (Research)</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enhanced for ICU/clinical settings. Incorporates vital signs, lab results, and procedures.
                12% better discrimination but requires richer data infrastructure.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <h3 className="font-bold text-gray-900 dark:text-white">Trade-Offs</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Both models optimized for recall. In care management, it's better to over-identify risk
                (some false positives) than miss truly high-risk patients who need intervention.
              </p>
            </div>
          </div>
        </div>

        {/* Validation & Fairness */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Validation & Model Governance</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Validation Strategy
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span><strong>Train/Test Split:</strong> 80/20 holdout set never seen during training</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span><strong>Cross-Validation:</strong> 5-fold CV to assess stability (AUC variance: ±0.02)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span><strong>Temporal Validation:</strong> Models tested on chronologically later admissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span><strong>Calibration:</strong> Isotonic regression applied to ensure predicted probabilities match observed rates</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Fairness & Bias Analysis
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Age Groups:</strong> Model performs consistently across age bands (AUC: 65+ = 0.59, &lt;65 = 0.57)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>No Protected Attributes:</strong> Race, ethnicity, gender excluded from model features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Proxy Monitoring:</strong> ZIP code, insurance type monitored for disparate impact</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Ongoing Audits:</strong> Quarterly performance reviews stratified by demographics</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Limitations & Future Work */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Model Limitations & Disclaimers
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600">⚠</span>
              <span>
                <strong>Historical Data:</strong> UCI model trained on 1999-2008 data may not reflect current clinical practice patterns,
                medication formulations, or care delivery models.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600">⚠</span>
              <span>
                <strong>Missing SDOH:</strong> Models don't account for social determinants of health (housing stability, food insecurity,
                transportation barriers) which significantly impact readmission risk.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600">⚠</span>
              <span>
                <strong>External Validation Needed:</strong> Before clinical deployment, models must be validated on your specific patient
                population, geography, and care delivery system.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600">⚠</span>
              <span>
                <strong>Not for Clinical Use:</strong> This platform is a demonstration tool. Risk scores should not be used for clinical
                decision-making without rigorous validation and regulatory compliance review.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
