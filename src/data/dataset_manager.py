"""
Dataset management for loading existing data from Hugging Face

Author: Koorosh Komeili Zadeh
Date: Aug 2025
"""

import pandas as pd
from datetime import datetime
from datasets import load_dataset
from typing import Optional, Tuple
from config.settings import HUGGINGFACE_DATASET, DATE_FORMAT_EXISTING


class DatasetManager:
    """Manage loading and handling of existing dataset from Hugging Face"""
    
    def __init__(self):
        self.existing_data: Optional[pd.DataFrame] = None
        self.last_existing_date: Optional[datetime] = None
    
    def load_existing_dataset(self) -> bool:
        """Load the existing dataset from Hugging Face"""
        try:
            print("Loading existing dataset from Hugging Face...")
            dataset = load_dataset(HUGGINGFACE_DATASET)
            
            self.existing_data = dataset['train'].to_pandas()
            
            print(f"Loaded Successfully: {len(self.existing_data)} existing records")
            print(f"Date range: {self.existing_data['Date'].iloc[0]} to {self.existing_data['Date'].iloc[-1]}")
            
            # Parse the last date
            last_date_str = self.existing_data['Date'].iloc[-1]
            self.last_existing_date = datetime.strptime(last_date_str, DATE_FORMAT_EXISTING)
            
            return True
            
        except Exception as e:
            print(f"Error loading existing dataset: {str(e)}")
            return False
    
    def get_existing_data(self) -> Optional[pd.DataFrame]:
        """Get the existing dataset"""
        return self.existing_data
    
    def get_last_existing_date(self) -> Optional[datetime]:
        """Get the last date in existing dataset"""
        return self.last_existing_date
    
    def get_dataset_info(self) -> Tuple[int, str, str]:
        """Get basic info about the loaded dataset"""
        if self.existing_data is None:
            return 0, "", ""
        
        record_count = len(self.existing_data)
        first_date = self.existing_data['Date'].iloc[0]
        last_date = self.existing_data['Date'].iloc[-1]
        
        return record_count, first_date, last_date
