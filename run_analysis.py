"""
Run data analysis and generate JSON files for dashboard.
This script executes the analysis from the Jupyter notebooks.
"""
import pandas as pd
import numpy as np
import json
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, average_precision_score
from imblearn.over_sampling import SMOTE
import warnings

warnings.filterwarnings('ignore')
np.random.seed(42)

# Set up paths
DATA_DIR = Path(__file__).parent / 'data' / 'raw'
OUTPUT_DIR = Path(__file__).parent / 'data' / 'processed'
OUTPUT_DIR.mkdir(exist_ok=True)

def run_patient_modeling():
    """Run patient risk modeling and generate JSON exports."""
    print("=" * 60)
    print("PATIENT RISK MODELING")
    print("=" * 60)

    # Load data
    df = pd.read_csv(DATA_DIR / 'diabetic_data.csv')
    print(f"Loaded {len(df):,} records")

    # Replace '?' with NaN
    df = df.replace('?', np.nan)

    # Create binary target
    df['readmitted_30day'] = (df['readmitted'] == '<30').astype(int)
    print(f"30-day readmission rate: {df['readmitted_30day'].mean()*100:.2f}%")

    # Deduplicate patients (keep first encounter)
    df = df.sort_values('encounter_id').drop_duplicates(subset=['patient_nbr'], keep='first')
    print(f"After deduplication: {len(df):,} patients")

    # Drop identifiers
    df = df.drop(columns=['encounter_id', 'patient_nbr'])

    # Feature engineering
    high_missing_cols = ['weight', 'payer_code', 'medical_specialty']
    df = df.drop(columns=high_missing_cols)

    age_mapping = {
        '[0-10)': 5, '[10-20)': 15, '[20-30)': 25, '[30-40)': 35,
        '[40-50)': 45, '[50-60)': 55, '[60-70)': 65, '[70-80)': 75,
        '[80-90)': 85, '[90-100)': 95
    }
    df['age_numeric'] = df['age'].map(age_mapping)

    df['total_visits'] = df['number_outpatient'] + df['number_emergency'] + df['number_inpatient']
    df['medication_intensity'] = df['num_medications'] / (df['time_in_hospital'] + 1)

    med_cols = ['metformin', 'repaglinide', 'nateglinide', 'chlorpropamide',
                'glimepiride', 'acetohexamide', 'glipizide', 'glyburide',
                'tolbutamide', 'pioglitazone', 'rosiglitazone', 'acarbose',
                'miglitol', 'troglitazone', 'tolazamide', 'insulin',
                'glyburide-metformin', 'glipizide-metformin']

    def count_med_changes(row):
        return sum(1 for col in med_cols if col in row.index and row[col] in ['Up', 'Down'])

    df['num_med_changes'] = df.apply(count_med_changes, axis=1)
    df['A1Cresult_abnormal'] = df['A1Cresult'].apply(lambda x: 1 if x in ['>7', '>8'] else 0)

    # Feature selection
    numeric_features = [
        'time_in_hospital', 'num_lab_procedures', 'num_procedures',
        'num_medications', 'number_outpatient', 'number_emergency',
        'number_inpatient', 'number_diagnoses', 'age_numeric',
        'total_visits', 'medication_intensity', 'num_med_changes'
    ]

    categorical_features = [
        'race', 'gender', 'admission_type_id', 'discharge_disposition_id',
        'admission_source_id', 'diabetesMed', 'change', 'A1Cresult_abnormal'
    ]

    keep_cols = numeric_features + categorical_features + ['readmitted_30day']
    df_model = df[keep_cols].copy()

    # Handle missing values
    for col in numeric_features:
        if df_model[col].isnull().any():
            df_model[col] = df_model[col].fillna(df_model[col].median())

    for col in categorical_features:
        if df_model[col].isnull().any():
            df_model[col] = df_model[col].fillna('Unknown')

    # One-hot encode
    df_encoded = pd.get_dummies(df_model, columns=categorical_features, drop_first=True)

    feature_cols = [col for col in df_encoded.columns if col != 'readmitted_30day']
    X = df_encoded[feature_cols]
    y = df_encoded['readmitted_30day']

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # SMOTE
    smote = SMOTE(random_state=42)
    X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)
    print(f"Training samples after SMOTE: {len(X_train_balanced):,}")

    # Scale and train
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_balanced)
    X_test_scaled = scaler.transform(X_test)

    model = LogisticRegression(max_iter=1000, random_state=42, C=0.1)
    model.fit(X_train_scaled, y_train_balanced)

    # Evaluate
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    avg_precision = average_precision_score(y_test, y_pred_proba)
    print(f"ROC-AUC: {roc_auc:.4f}, Avg Precision: {avg_precision:.4f}")

    # Score all patients
    X_all_scaled = scaler.transform(X)
    all_risk_scores = model.predict_proba(X_all_scaled)[:, 1] * 100

    df_scored = df_model.copy()
    df_scored['risk_score'] = all_risk_scores
    df_scored['estimated_cost'] = (df_scored['risk_score'] / 100) * 15000
    df_scored['patient_id'] = range(1, len(df_scored) + 1)

    # Export top 1000 high-risk patients
    df_high_risk = df_scored.nlargest(1000, 'risk_score')

    export_columns = [
        'patient_id', 'age_numeric', 'time_in_hospital', 'num_medications',
        'number_diagnoses', 'number_inpatient', 'number_emergency',
        'total_visits', 'num_med_changes', 'risk_score', 'estimated_cost',
        'readmitted_30day'
    ]

    export_df = df_high_risk[export_columns].copy()
    export_df = export_df.rename(columns={'age_numeric': 'age'})
    export_df['risk_score'] = export_df['risk_score'].round(2)
    export_df['estimated_cost'] = export_df['estimated_cost'].round(2)

    patient_risks = export_df.to_dict('records')

    with open(OUTPUT_DIR / 'patient_risks.json', 'w') as f:
        json.dump(patient_risks, f, indent=2)
    print(f"Exported patient_risks.json ({len(patient_risks)} records)")

    # Risk summary
    bins = [0, 20, 40, 60, 80, 100]
    labels = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%']
    df_scored['risk_bin'] = pd.cut(df_scored['risk_score'], bins=bins, labels=labels)
    risk_distribution = df_scored['risk_bin'].value_counts().sort_index().to_dict()

    age_bins = [0, 30, 50, 70, 100]
    age_labels = ['Under 30', '30-49', '50-69', '70+']
    df_scored['age_group'] = pd.cut(df_scored['age_numeric'], bins=age_bins, labels=age_labels)
    age_risk = df_scored.groupby('age_group', observed=True)['risk_score'].mean().to_dict()

    risk_summary = {
        'total_patients': int(len(df_scored)),
        'high_risk_count': int(len(df_high_risk)),
        'total_cost_exposure': float(df_high_risk['estimated_cost'].sum()),
        'avg_risk_score': float(df_high_risk['risk_score'].mean()),
        'median_risk_score': float(df_high_risk['risk_score'].median()),
        'risk_distribution': {k: int(v) for k, v in risk_distribution.items()},
        'avg_risk_by_age': {k: round(float(v), 2) for k, v in age_risk.items()},
        'model_auc': float(roc_auc),
        'readmission_rate_overall': float(df_scored['readmitted_30day'].mean() * 100)
    }

    with open(OUTPUT_DIR / 'risk_summary.json', 'w') as f:
        json.dump(risk_summary, f, indent=2)
    print(f"Exported risk_summary.json")

    return roc_auc

def run_hospital_analytics():
    """Run hospital analytics and generate JSON exports."""
    print("\n" + "=" * 60)
    print("HOSPITAL & GEOGRAPHIC ANALYTICS")
    print("=" * 60)

    df_hosp = pd.read_csv(DATA_DIR / 'hospital_readmissions.csv')
    print(f"Loaded {len(df_hosp):,} hospital records")

    # Detect and map columns
    column_mappings = {
        'hospital_name': ['Facility Name', 'Hospital Name', 'facility_name', 'Provider Name'],
        'state': ['State', 'state', 'Provider State'],
        'city': ['City', 'city', 'Provider City'],
        'readmission_rate': ['Score', 'Excess Readmission Ratio', 'Expected Readmission Rate'],
        'penalty_pct': ['Payment Reduction Percentage', 'FY 2025 Payment Reduction Percentage'],
    }

    for target, possible_names in column_mappings.items():
        for name in possible_names:
            if name in df_hosp.columns:
                df_hosp[target] = df_hosp[name]
                break

    # Convert numeric columns
    if 'readmission_rate' in df_hosp.columns:
        df_hosp['readmission_rate'] = pd.to_numeric(df_hosp['readmission_rate'], errors='coerce')
        if df_hosp['readmission_rate'].mean() < 5:
            df_hosp['readmission_rate'] = df_hosp['readmission_rate'] * 100

    if 'penalty_pct' in df_hosp.columns:
        df_hosp['penalty_pct'] = pd.to_numeric(df_hosp['penalty_pct'], errors='coerce')

    if 'state' in df_hosp.columns:
        df_hosp = df_hosp.dropna(subset=['state'])

    # State coordinates
    STATE_COORDS = {
        'AL': {'lat': 32.806671, 'lng': -86.791130, 'name': 'Alabama'},
        'AK': {'lat': 61.370716, 'lng': -152.404419, 'name': 'Alaska'},
        'AZ': {'lat': 33.729759, 'lng': -111.431221, 'name': 'Arizona'},
        'AR': {'lat': 34.969704, 'lng': -92.373123, 'name': 'Arkansas'},
        'CA': {'lat': 36.116203, 'lng': -119.681564, 'name': 'California'},
        'CO': {'lat': 39.059811, 'lng': -105.311104, 'name': 'Colorado'},
        'CT': {'lat': 41.597782, 'lng': -72.755371, 'name': 'Connecticut'},
        'DE': {'lat': 39.318523, 'lng': -75.507141, 'name': 'Delaware'},
        'FL': {'lat': 27.766279, 'lng': -81.686783, 'name': 'Florida'},
        'GA': {'lat': 33.040619, 'lng': -83.643074, 'name': 'Georgia'},
        'HI': {'lat': 21.094318, 'lng': -157.498337, 'name': 'Hawaii'},
        'ID': {'lat': 44.240459, 'lng': -114.478828, 'name': 'Idaho'},
        'IL': {'lat': 40.349457, 'lng': -88.986137, 'name': 'Illinois'},
        'IN': {'lat': 39.849426, 'lng': -86.258278, 'name': 'Indiana'},
        'IA': {'lat': 42.011539, 'lng': -93.210526, 'name': 'Iowa'},
        'KS': {'lat': 38.526600, 'lng': -96.726486, 'name': 'Kansas'},
        'KY': {'lat': 37.668140, 'lng': -84.670067, 'name': 'Kentucky'},
        'LA': {'lat': 31.169546, 'lng': -91.867805, 'name': 'Louisiana'},
        'ME': {'lat': 44.693947, 'lng': -69.381927, 'name': 'Maine'},
        'MD': {'lat': 39.063946, 'lng': -76.802101, 'name': 'Maryland'},
        'MA': {'lat': 42.230171, 'lng': -71.530106, 'name': 'Massachusetts'},
        'MI': {'lat': 43.326618, 'lng': -84.536095, 'name': 'Michigan'},
        'MN': {'lat': 45.694454, 'lng': -93.900192, 'name': 'Minnesota'},
        'MS': {'lat': 32.741646, 'lng': -89.678696, 'name': 'Mississippi'},
        'MO': {'lat': 38.456085, 'lng': -92.288368, 'name': 'Missouri'},
        'MT': {'lat': 46.921925, 'lng': -110.454353, 'name': 'Montana'},
        'NE': {'lat': 41.125370, 'lng': -98.268082, 'name': 'Nebraska'},
        'NV': {'lat': 38.313515, 'lng': -117.055374, 'name': 'Nevada'},
        'NH': {'lat': 43.452492, 'lng': -71.563896, 'name': 'New Hampshire'},
        'NJ': {'lat': 40.298904, 'lng': -74.521011, 'name': 'New Jersey'},
        'NM': {'lat': 34.840515, 'lng': -106.248482, 'name': 'New Mexico'},
        'NY': {'lat': 42.165726, 'lng': -74.948051, 'name': 'New York'},
        'NC': {'lat': 35.630066, 'lng': -79.806419, 'name': 'North Carolina'},
        'ND': {'lat': 47.528912, 'lng': -99.784012, 'name': 'North Dakota'},
        'OH': {'lat': 40.388783, 'lng': -82.764915, 'name': 'Ohio'},
        'OK': {'lat': 35.565342, 'lng': -96.928917, 'name': 'Oklahoma'},
        'OR': {'lat': 44.572021, 'lng': -122.070938, 'name': 'Oregon'},
        'PA': {'lat': 40.590752, 'lng': -77.209755, 'name': 'Pennsylvania'},
        'RI': {'lat': 41.680893, 'lng': -71.511780, 'name': 'Rhode Island'},
        'SC': {'lat': 33.856892, 'lng': -80.945007, 'name': 'South Carolina'},
        'SD': {'lat': 44.299782, 'lng': -99.438828, 'name': 'South Dakota'},
        'TN': {'lat': 35.747845, 'lng': -86.692345, 'name': 'Tennessee'},
        'TX': {'lat': 31.054487, 'lng': -97.563461, 'name': 'Texas'},
        'UT': {'lat': 40.150032, 'lng': -111.862434, 'name': 'Utah'},
        'VT': {'lat': 44.045876, 'lng': -72.710686, 'name': 'Vermont'},
        'VA': {'lat': 37.769337, 'lng': -78.169968, 'name': 'Virginia'},
        'WA': {'lat': 47.400902, 'lng': -121.490494, 'name': 'Washington'},
        'WV': {'lat': 38.491226, 'lng': -80.954453, 'name': 'West Virginia'},
        'WI': {'lat': 44.268543, 'lng': -89.616508, 'name': 'Wisconsin'},
        'WY': {'lat': 42.755966, 'lng': -107.302490, 'name': 'Wyoming'},
        'DC': {'lat': 38.897438, 'lng': -77.026817, 'name': 'District of Columbia'},
        'PR': {'lat': 18.220833, 'lng': -66.590149, 'name': 'Puerto Rico'},
    }

    # State aggregation
    agg_dict = {'hospital_name': 'count'}
    if 'readmission_rate' in df_hosp.columns:
        agg_dict['readmission_rate'] = 'mean'
    if 'penalty_pct' in df_hosp.columns:
        agg_dict['penalty_pct'] = 'mean'

    state_summary = df_hosp.groupby('state').agg(agg_dict).reset_index()
    state_summary.columns = ['state', 'hospital_count'] + [
        'avg_readmission_rate' if 'readmission_rate' in agg_dict else None,
        'avg_penalty_pct' if 'penalty_pct' in agg_dict else None
    ][:len(state_summary.columns)-2]

    # Add penalty estimate
    if 'avg_penalty_pct' in state_summary.columns:
        state_summary['total_penalty_estimate'] = (
            state_summary['hospital_count'] * 5000000 * state_summary['avg_penalty_pct'] / 100
        )
    else:
        state_summary['total_penalty_estimate'] = 0

    # Export state summary
    state_data = []
    for _, row in state_summary.iterrows():
        state_code = row['state']
        coords = STATE_COORDS.get(state_code, {'lat': 0, 'lng': 0, 'name': state_code})
        state_entry = {
            'state': state_code,
            'name': coords['name'],
            'lat': coords['lat'],
            'lng': coords['lng'],
            'hospital_count': int(row['hospital_count']),
            'avg_readmission_rate': round(float(row.get('avg_readmission_rate', 0) or 0), 2),
            'total_penalty_estimate': round(float(row.get('total_penalty_estimate', 0) or 0), 0)
        }
        state_data.append(state_entry)

    with open(OUTPUT_DIR / 'state_summary.json', 'w') as f:
        json.dump(state_data, f, indent=2)
    print(f"Exported state_summary.json ({len(state_data)} states)")

    # Export hospital metrics
    if 'readmission_rate' in df_hosp.columns:
        df_hosp_clean = df_hosp.dropna(subset=['readmission_rate'])
        df_top_hospitals = df_hosp_clean.nlargest(500, 'readmission_rate')
    else:
        df_top_hospitals = df_hosp.head(500)

    hospital_data = []
    for _, row in df_top_hospitals.iterrows():
        hospital_entry = {
            'name': str(row.get('hospital_name', 'Unknown')),
            'state': str(row.get('state', 'Unknown')),
            'city': str(row.get('city', 'Unknown')) if pd.notna(row.get('city')) else 'Unknown',
            'readmission_rate': round(float(row.get('readmission_rate', 0) or 0), 2),
            'penalty_pct': round(float(row.get('penalty_pct', 0) or 0), 2)
        }
        hospital_data.append(hospital_entry)

    with open(OUTPUT_DIR / 'hospital_metrics.json', 'w') as f:
        json.dump(hospital_data, f, indent=2)
    print(f"Exported hospital_metrics.json ({len(hospital_data)} hospitals)")

def verify_exports():
    """Verify all exported files."""
    print("\n" + "=" * 60)
    print("VERIFICATION")
    print("=" * 60)

    export_files = [
        'patient_risks.json',
        'risk_summary.json',
        'state_summary.json',
        'hospital_metrics.json'
    ]

    for filename in export_files:
        filepath = OUTPUT_DIR / filename
        if filepath.exists():
            with open(filepath, 'r') as f:
                data = json.load(f)
            if isinstance(data, list):
                print(f"  {filename}: {len(data)} records")
            else:
                print(f"  {filename}: {len(data.keys())} keys")
        else:
            print(f"  {filename}: NOT FOUND")

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("READMITRISK DATA ANALYSIS")
    print("=" * 60 + "\n")

    run_patient_modeling()
    run_hospital_analytics()
    verify_exports()

    print("\n" + "=" * 60)
    print("ANALYSIS COMPLETE - DATA READY FOR DASHBOARD")
    print("=" * 60)
