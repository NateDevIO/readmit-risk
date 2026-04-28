# ReadmitRisk - Hospital Readmission Prevention Platform

<p align="center">
  <img src="docs/screenshots/hero-dashboard.png?v=2" alt="ReadmitRisk Executive Dashboard" width="900">
</p>

<p align="center">
  <strong>Predictive analytics platform for reducing preventable 30-day hospital readmissions</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Python-3.11-blue?style=flat-square&logo=python" alt="Python">
  <img src="https://img.shields.io/badge/scikit--learn-ML-orange?style=flat-square&logo=scikit-learn" alt="scikit-learn">
</p>

---

## 🎯 Overview

ReadmitRisk is a full-stack care management platform that identifies high-risk patients and prioritizes post-discharge interventions to reduce preventable hospital readmissions.

**Key Metrics:**
- 📊 **282K+ patients** analyzed across two clinical datasets
- 📚 **~10K embedded chunks** from ~5K transcribed clinical notes (MTSamples) for RAG-grounded Q&A
- 💰 **$1.5B** in cost exposure identified
- 🎯 **122K high-risk members** flagged for intervention
- 🏥 **205 hospitals** benchmarked with CMS penalty data
- 📈 **63% ROC-AUC** model performance on MIMIC-IV data

**Business Impact:**
- Reduces Medicare penalties (up to 3% of payments)
- Improves HEDIS scores and Star Ratings
- Optimizes care management resource allocation
- Targets $10K-$25K preventable readmission costs

---

## 🎬 Demo

<p align="center">
  <img src="docs/screenshots/care-queue-demo.png?v=2" alt="Care Queue Workflow" width="800">
</p>

*Prioritizing high-risk patients and viewing personalized intervention recommendations*

---

## ✨ Key Features

### 1. **Risk Stratification Dashboard**
Real-time patient risk scoring with machine learning models trained on 282K+ patient records.

<img src="docs/screenshots/dashboard-overview.png?v=2" alt="Dashboard Overview" width="800">

**Capabilities:**
- Multi-dataset analysis (UCI Diabetes + MIMIC-IV)
- Risk tier segmentation (Critical, Very High, High)
- Dynamic cost exposure calculations
- Interactive data visualizations with Recharts

<img src="docs/screenshots/dataset-comparison.png?v=2" alt="Multi-Dataset Comparison" width="800">

*Switch between UCI and MIMIC-IV datasets to compare model performance and patient populations*

---

### 2. **Care Management Queue**
Prioritized patient worklist with clinical reasoning and actionable recommendations.

<img src="docs/screenshots/care-queue-demo.png?v=2" alt="Care Management Queue" width="800">

**Features:**
- Top 50 high-risk patients with sortable views
- Multi-factor cost calculations (meds, diagnoses, age, comorbidities)
- Clinical decision support ("Why High Risk?")
- Intervention protocols aligned with CMS guidelines

---

### 3. **Interactive ROI Calculator**
Calculate potential savings from targeted care management interventions.

<img src="docs/screenshots/roi-calculator.png?v=2" alt="ROI Calculator" width="800">

**Inputs:**
- Population size
- Current readmission rate
- Intervention cost per patient
- Expected success rate

**Outputs:**
- Net annual savings
- ROI percentage
- Break-even analysis
- Patients needed to treat (NNT)

---

### 4. **Geographic Analysis**
State-by-state CMS penalty tracking and hospital benchmarking.

<img src="docs/screenshots/geography-heatmap.png?v=2" alt="Geographic Analysis" width="800">

**Data Sources:**
- 205 acute care hospitals
- CMS Hospital Readmissions Reduction Program (HRRP)
- State-level readmission benchmarks
- Penalty amount estimates

---

### 5. **MCP Server (Remote API)**
Connect any MCP-compatible AI assistant to ReadmitRisk data — no clone or install needed.

```json
{
  "mcpServers": {
    "readmit-risk": {
      "url": "https://readmit-risk-production.up.railway.app/sse"
    }
  }
}
```

**9 Tools Available:**

*Quantitative analytics (7):*
- Patient risk lookups across UCI and MIMIC-IV datasets
- High-risk patient filtering with age/threshold controls
- Hospital readmission metrics and CMS penalty data
- Live ML predictions using trained Gradient Boosting models
- Feature importance and dataset comparison analytics

*RAG over clinical notes (2):*
- `search_clinical_notes` — semantic search across the MTSamples corpus
- `find_similar_cases` — retrieve clinically similar reports given a free-text case description

Deployed on Railway via SSE transport. Also runs locally via stdio — see [mcp_server/README.md](mcp_server/README.md) for details.

---

### 6. **Conversational AI Assistant (RAG-grounded)**

A separate FastAPI chat service (`chat_api/`) bridges the dashboard's chat widget to Claude with full MCP tool access. The model picks the right tool per turn — quantitative tools for risk questions, retrieval tools for clinical-knowledge questions.

**RAG pipeline:**
- **Corpus:** ~5K MTSamples transcribed clinical notes → ~10K chunks via SOAP-aware + recursive character chunking
- **Embeddings:** Voyage AI `voyage-3-lite` (512-dim)
- **Vector store:** Postgres + pgvector with HNSW index, cosine similarity
- **Retrieval:** k-NN with per-report dedup and result-cap controls
- **Citations:** Every retrieved chunk carries a `citation_index`; the assistant cites inline as `[N]`, and a Sources block in the UI links each citation back to its source chunk

**Streaming + safety:**
- Server-sent events for token streaming
- `slowapi` rate limiting per origin
- Origin-allowlisted CORS

**Eval harness:** `evals/retrieval/` ships a YAML question set, retrieval metrics, and an eval runner so retrieval quality can be measured against a baseline before changes ship. See [evals/retrieval/README.md](evals/retrieval/README.md).

---

### 7. **Model Performance & Explainability**
Transparent ML model evaluation with feature importance analysis.

<img src="docs/screenshots/model-performance.png?v=2" alt="Model Performance" width="800">

**Analytics:**
- ROC-AUC curves and precision-recall metrics
- Feature importance rankings
- Dataset comparison (UCI vs MIMIC-IV)
- Validation methodology documentation

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- **Next.js 14** (App Router) - React framework with server components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Interactive data visualizations
- **Dark mode** - System preference support

**Backend/ML:**
- **Python 3.11** - Data processing and ML training
- **scikit-learn** - Gradient Boosting and Logistic Regression models
- **Pandas/NumPy** - Data manipulation
- **SMOTE** - Class imbalance handling
- **Google BigQuery** - MIMIC-IV data extraction

**RAG / Conversational AI:**
- **FastMCP** - MCP server framework (stdio + SSE transports)
- **FastAPI + sse-starlette** - Streaming chat proxy
- **Anthropic Claude** - Reasoning + tool selection (Sonnet 4)
- **Voyage AI** - `voyage-3-lite` embeddings (512-dim)
- **Postgres + pgvector** - Vector store with HNSW cosine index
- **slowapi** - Per-origin rate limiting on the chat API

**Data Sources:**
- **MIMIC-IV** (211K admissions) - ICU clinical database from MIT
- **UCI Diabetes** (71K patients) - Hospital readmission records
- **CMS HRRP** (205 hospitals) - Public penalty data
- **MTSamples** (~5K reports / ~10K chunks) - Transcribed clinical notes used as the RAG corpus

---

## 📊 Machine Learning Pipeline

```python
1. Data Extraction
   ├── MIMIC-IV: Google BigQuery (PhysioNet credentials required)
   └── UCI: Kaggle public dataset

2. Feature Engineering
   ├── 61 clinical features (MIMIC)
   ├── 12 diabetes metrics (UCI)
   └── Demographic normalization

3. Model Training
   ├── SMOTE oversampling (8.8% → 50% positive class)
   ├── Gradient Boosting Classifier
   ├── 80/20 train-test split
   └── Hyperparameter tuning

4. Evaluation
   ├── ROC-AUC: 63% (MIMIC), 56% (UCI)
   ├── Precision-Recall curves
   └── Feature importance analysis

5. Risk Scoring
   ├── Probability thresholds (60%, 70%, 80%)
   └── Cost estimation ($10K-$25K range)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (for dashboard)
- **Python 3.11+** (for ML pipeline)
- **PhysioNet credentials** (optional, for MIMIC-IV data)

### Quick Start (Dashboard Only - UCI Data)

```bash
# Clone the repository
git clone https://github.com/NateDevIO/readmit-risk.git
cd readmit-risk/dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard with pre-loaded UCI data.

### Full Setup (Including MIMIC-IV)

See [MIMIC_SETUP_GUIDE.md](MIMIC_SETUP_GUIDE.md) for detailed instructions on:
- PhysioNet credentialing
- Google BigQuery configuration
- Data extraction and processing
- Model retraining

---

## 📁 Project Structure

```
readmit-risk/
├── dashboard/               # Next.js frontend application
│   ├── app/                # App router pages
│   │   ├── dashboard/     # Main analytics dashboard
│   │   ├── care-queue/    # Patient worklist
│   │   ├── impact-calculator/  # ROI calculator
│   │   ├── geography/     # State analysis
│   │   └── model-performance/  # ML metrics
│   ├── components/        # React components (incl. chat widget + Sources block)
│   ├── lib/              # Data and utilities
│   └── public/           # Static assets & reports
├── chat_api/             # FastAPI streaming chat proxy (separate Railway service)
│   ├── main.py           # SSE endpoint, MCP client, citation pipeline, rate limiting
│   ├── Dockerfile
│   └── test_main.py
├── mcp_server/           # MCP server (deployed on Railway)
│   ├── server.py        # FastMCP tool definitions (9 tools)
│   ├── data_loader.py   # Lazy-loading data store
│   ├── retrieval.py     # pgvector cosine search helpers
│   ├── embeddings.py    # Voyage AI embedding client
│   ├── chunking.py      # SOAP-aware + recursive chunker
│   ├── db.py            # Postgres connection
│   ├── migrate.py       # Schema migration runner
│   ├── migrations/      # SQL migrations (incl. pgvector init)
│   ├── train_model.py   # Model training script
│   └── models/          # Trained model artifacts
├── evals/
│   └── retrieval/       # Retrieval quality eval harness (questions, metrics, runner)
├── ingest_mtsamples.py   # MTSamples → chunks → embeddings → pgvector pipeline
├── data/                 # Processed datasets
│   ├── processed/        # UCI + MIMIC data
│   └── mimic_*/         # MIMIC raw data (gitignored)
├── notebooks/           # Jupyter analysis notebooks
├── KNOWN_LIMITATIONS.md  # Model + RAG caveats and deployment notes
├── *.py                # Python ML pipeline scripts
└── docs/               # Documentation and screenshots
```

---

## 🎓 Clinical & Healthcare Domain Expertise

### CMS Quality Measures Alignment

**Hospital Readmissions Reduction Program (HRRP):**
- Targets 6 condition-specific readmission measures
- Penalties up to 3% of Medicare payments
- Affects 2,500+ hospitals annually

**HEDIS Metrics:**
- Plan All-Cause Readmissions (PCR)
- Impacts Medicare Advantage Star Ratings
- Influences member retention and revenue

### Evidence-Based Interventions

Risk stratification enables targeted deployment of proven interventions:
- **Transitional Care:** Post-discharge phone calls within 48 hours
- **Medication Reconciliation:** Pharmacist review to prevent adverse drug events
- **Care Coordination:** PCP follow-up scheduling within 7 days
- **Patient Education:** Teach-back methods for self-care

See [About Page](/about) for full clinical context and citations.

---

## 📈 Results & Impact

### Model Performance
- **MIMIC-IV Dataset:** 63.0% ROC-AUC (211K admissions)
- **UCI Dataset:** 56.4% ROC-AUC (71K patients)
- **High-Risk Identification:** 122K patients (43% of total)

### Business Value
- **Cost Exposure:** $1.5B identified across high-risk population
- **Intervention ROI:** 150-250% with $250 intervention costs
- **Resource Optimization:** Focus care teams on top 10% highest-risk patients

### Use Cases
- **Health Plans:** Medicare Advantage Star Ratings improvement
- **ACOs:** Shared savings program performance
- **Hospitals:** HRRP penalty avoidance
- **Care Management Teams:** Patient prioritization and workload optimization

---

## 📚 Documentation

- **[Executive Report (Combined)](dashboard/public/EXECUTIVE_REPORT_COMBINED.html)** - Comprehensive analysis
- **[MIMIC-IV Analysis](dashboard/public/EXECUTIVE_REPORT_MIMIC.html)** - ICU dataset insights
- **[UCI Diabetes Analysis](dashboard/public/EXECUTIVE_REPORT_UCI.html)** - Diabetes readmissions
- **[Geographic Analysis](dashboard/public/EXECUTIVE_REPORT_GEOGRAPHY.html)** - CMS penalties by state
- **[Methodology (MIMIC)](dashboard/public/DATA_ANALYSIS_METHODOLOGY_MIMIC.html)** - BigQuery pipeline
- **[Methodology (UCI)](dashboard/public/DATA_ANALYSIS_METHODOLOGY_UCI.html)** - Feature engineering

---

## 🔒 Data Privacy & Security

### MIMIC-IV Data Protection
- MIMIC-IV data requires PhysioNet credentialed access
- Patient data excluded from git repository (see `.gitignore`)
- Only aggregated statistics and models shared publicly
- Complies with MIMIC-IV Data Use Agreement

### Included Public Data
- UCI Diabetes dataset (publicly available via Kaggle)
- CMS hospital metrics (public HRRP data)
- Aggregated summary statistics

---

## 🛠️ Development

### Scripts

```bash
# Frontend (dashboard)
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint check

# Backend (ML pipeline)
python extract_mimic_cohort.py              # Extract MIMIC data from BigQuery
python mimic_feature_engineering.py         # Process features
python generate_full_mimic_dashboard_data.py # Generate dashboard JSON
```

### Testing

```bash
# Frontend type checking
npm run type-check

# Python environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🎯 Future Enhancements

- [ ] Real-time EMR integration (HL7/FHIR)
- [ ] Multi-hospital deployment support
- [ ] Advanced NLP on clinical notes
- [ ] Causal inference models (uplift modeling)
- [ ] Mobile app for care coordinators
- [ ] Automated intervention tracking

---

## 👨‍💻 About the Developer

**Built by a healthcare data analyst** passionate about using predictive analytics to improve patient outcomes and reduce preventable costs.

- 🔗 [GitHub](https://github.com/NateDevIO)
- 💼 [LinkedIn](https://linkedin.com/in/NateDevIO)
- 🌐 [Portfolio](https://natedev.io)

---

## 📄 License

This project is a demonstration/portfolio project.

**Data Licenses:**
- MIMIC-IV: PhysioNet Credentialed Health Data License 1.5.0
- UCI Diabetes: CC0 Public Domain
- CMS HRRP: U.S. Government Public Data

---

## 🙏 Acknowledgments

- **MIT Lab for Computational Physiology** - MIMIC-IV database
- **UCI Machine Learning Repository** - Diabetes dataset
- **Centers for Medicare & Medicaid Services** - HRRP public data
- **PhysioNet** - Clinical data access platform

---

<p align="center">
  <strong>Reducing preventable readmissions through data-driven care management</strong>
</p>

<p align="center">
  © 2026 ReadmitRisk. Demonstration project.
</p>
