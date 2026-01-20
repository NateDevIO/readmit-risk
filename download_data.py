"""Download datasets for the Hospital Readmissions project."""
import os
import zipfile
import requests
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data" / "raw"
DATA_DIR.mkdir(parents=True, exist_ok=True)

def download_file(url: str, dest_path: Path, desc: str) -> bool:
    """Download a file with progress indication."""
    print(f"Downloading {desc}...")
    try:
        response = requests.get(url, stream=True, timeout=120)
        response.raise_for_status()

        total_size = int(response.headers.get('content-length', 0))

        with open(dest_path, 'wb') as f:
            downloaded = 0
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        pct = (downloaded / total_size) * 100
                        print(f"\r  Progress: {pct:.1f}%", end="", flush=True)
        print(f"\n  Saved to: {dest_path}")
        return True
    except Exception as e:
        print(f"\n  Error: {e}")
        return False

def download_uci_diabetes():
    """Download UCI Diabetes 130-US Hospitals dataset."""
    # UCI ML Repository archive URL
    url = "https://archive.ics.uci.edu/static/public/296/diabetes+130-us+hospitals+for+years+1999-2008.zip"
    zip_path = DATA_DIR / "diabetes_dataset.zip"

    if (DATA_DIR / "diabetic_data.csv").exists():
        print("UCI Diabetes dataset already exists, skipping...")
        return True

    if download_file(url, zip_path, "UCI Diabetes dataset"):
        print("Extracting ZIP file...")
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(DATA_DIR)
            os.remove(zip_path)
            print("  Extraction complete!")
            return True
        except Exception as e:
            print(f"  Extraction error: {e}")
            return False
    return False

def download_cms_hospital_data():
    """Download CMS Hospital Readmissions Reduction Program data."""
    # CMS data.cms.gov API endpoint for hospital readmissions
    # This is the HRRP Measures dataset
    url = "https://data.cms.gov/provider-data/api/1/datastore/query/9n3s-kdb3/0?offset=0&count=true&results=true&schema=true&keys=true&format=csv&rowIds=false"

    dest_path = DATA_DIR / "hospital_readmissions.csv"

    if dest_path.exists():
        print("CMS Hospital Readmissions data already exists, skipping...")
        return True

    # Try direct CSV download from CMS
    alt_url = "https://data.cms.gov/provider-data/sites/default/files/resources/092d655ed756c878d23b9a8d5e60b726_1736467809/Hospital_Readmissions_Reduction_Program.csv"

    if download_file(alt_url, dest_path, "CMS Hospital Readmissions data"):
        return True

    # Fallback: try the API endpoint
    print("Trying alternative download method...")
    return download_file(url, dest_path, "CMS Hospital Readmissions data (API)")

if __name__ == "__main__":
    print("=" * 60)
    print("DOWNLOADING DATASETS FOR HOSPITAL READMISSIONS PROJECT")
    print("=" * 60)
    print()

    success1 = download_uci_diabetes()
    print()
    success2 = download_cms_hospital_data()

    print()
    print("=" * 60)
    print("DOWNLOAD SUMMARY")
    print("=" * 60)
    print(f"UCI Diabetes dataset: {'SUCCESS' if success1 else 'FAILED'}")
    print(f"CMS Hospital data: {'SUCCESS' if success2 else 'FAILED'}")

    # List downloaded files
    print()
    print("Files in data/raw/:")
    for f in DATA_DIR.iterdir():
        size = f.stat().st_size / (1024 * 1024)  # MB
        print(f"  {f.name}: {size:.2f} MB")
