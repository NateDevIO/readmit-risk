# ReadmitRisk

**Hospital Readmission Prevention Platform** - A care management risk stratification tool for reducing preventable 30-day hospital readmissions.

## Overview

ReadmitRisk combines machine learning risk prediction with CMS hospital penalty data to help healthcare organizations identify high-risk patients and optimize intervention strategies. The platform provides:

- **Risk Stratification**: ML-powered patient risk scoring using clinical and utilization data
- **Geographic Analysis**: State-by-state hospital readmission rates and CMS penalty analysis
- **ROI Calculator**: Evidence-based intervention cost-benefit modeling
- **Executive Dashboard**: Key metrics and actionable insights for decision-makers

## Features

### Patient Risk Prediction
- Logistic regression model trained on UCI Diabetes dataset
- SMOTE for handling class imbalance
- Risk factors include: prior visits, length of stay, medications, diagnoses, age
- Individual patient risk profiles with "Why High Risk?" explainers

### Hospital Performance Analysis
- CMS Hospital Readmissions Reduction Program (HRRP) penalty data
- State-level heatmap visualization
- Hospital detail modals with benchmark comparisons
- Performance recommendations based on readmission rates

### Intervention Planning
- 5 evidence-based intervention presets:
  - Post-Discharge Phone Calls
  - Transitional Care Management
  - Medication Reconciliation
  - Home Health Visits
  - Care Coordination
- ROI calculator with cost and effectiveness ranges
- Goal tracking for readmission reduction targets

### Executive Features
- Executive summary with critical action items
- National benchmark comparisons
- Trend simulation projections
- Dark mode support

## Tech Stack

**Backend/ML Pipeline:**
- Python 3.x
- Pandas, NumPy for data processing
- Scikit-learn for ML modeling
- imbalanced-learn (SMOTE)

**Frontend Dashboard:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts for visualizations

## Project Structure

```
readmit-risk/
├── data/
│   ├── raw/              # Source datasets (gitignored)
│   └── processed/        # Processed JSON files
├── dashboard/            # Next.js application
│   ├── app/              # App router pages
│   ├── components/       # React components
│   └── lib/              # Data and utilities
├── notebooks/            # Jupyter notebooks
├── run_analysis_v2.py    # ML pipeline script
└── DATA_PIPELINE_REPORT.md
```

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/NateDevIO/readmit-risk.git
cd readmit-risk
```

2. Set up Python environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install pandas numpy scikit-learn imbalanced-learn
```

3. Run the ML pipeline:
```bash
python run_analysis_v2.py
```

4. Install dashboard dependencies:
```bash
cd dashboard
npm install
```

5. Copy processed data to dashboard:
```bash
cp ../data/processed/*.json lib/
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data Sources

- **Patient Data**: UCI Diabetes 130-US hospitals dataset (1999-2008)
- **Hospital Data**: CMS Hospital Readmissions Reduction Program

## Documentation

See [DATA_PIPELINE_REPORT.md](DATA_PIPELINE_REPORT.md) for detailed documentation of the data processing methodology and ML pipeline.

## License

MIT License - see LICENSE file for details.

---

Built with Python, Scikit-learn, Next.js, and Recharts
