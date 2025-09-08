#!/usr/bin/env python3
"""
Kaggle Dataset Update Script
Uploads the latest CSV data to Kaggle dataset
"""

import os
import json
from kaggle.api.kaggle_api_extended import KaggleApi

def update_kaggle_dataset():
    """Update Kaggle dataset with latest CSV file"""
    
    # Initialize Kaggle API
    api = KaggleApi()
    api.authenticate()
    
    # Dataset configuration
    dataset_slug = "your-username/dollar-rial-toman-live-price-dataset"  # UPDATE THIS
    
    # Create dataset metadata
    metadata = {
        "title": "Dollar-Rial-Toman Live Price Dataset",
        "id": dataset_slug,
        "licenses": [{"name": "MIT"}],
        "resources": [
            {
                "path": "Dollar_Rial_Price_Dataset.csv",
                "description": "Daily USD/IRR exchange rates with OHLC data from November 2011 to present"
            }
        ]
    }
    
    # Write metadata file
    with open('dataset-metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)
    
    try:
        # Upload new version
        print("Uploading dataset to Kaggle...")
        api.dataset_create_version(
            folder="./",
            version_notes=f"Daily update - {os.environ.get('LATEST_ENTRY_DATE', 'auto-update')}",
            quiet=False
        )
        print("✅ Successfully updated Kaggle dataset!")
        
    except Exception as e:
        print(f"❌ Error updating Kaggle dataset: {e}")
        return False
    
    return True

if __name__ == "__main__":
    # Change to data directory
    os.chdir("data")
    update_kaggle_dataset()
