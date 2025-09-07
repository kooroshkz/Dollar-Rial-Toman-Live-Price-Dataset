"""Data management module for handling CSV operations and data persistence."""

import os
import pandas as pd
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging

from .config import CSV_FILENAME, DATA_DIR, COLUMN_MAPPING
from .utils import setup_logging


class DataManager:
    """Handles data persistence and CSV operations."""
    
    def __init__(self):
        self.logger = setup_logging()
        self.csv_path = os.path.join(DATA_DIR, CSV_FILENAME)
        self._ensure_data_directory()
    
    def _ensure_data_directory(self):
        """Ensure the data directory exists."""
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR)
            self.logger.info(f"Created data directory: {DATA_DIR}")
    
    def load_existing_data(self) -> pd.DataFrame:
        """Load existing CSV data if it exists."""
        if os.path.exists(self.csv_path):
            try:
                df = pd.read_csv(self.csv_path)
                self.logger.info(f"Loaded existing data: {len(df)} records from {self.csv_path}")
                return df
            except Exception as e:
                self.logger.error(f"Error loading existing data: {e}")
                return pd.DataFrame()
        else:
            self.logger.info("No existing data file found. Starting fresh.")
            return pd.DataFrame()
    
    def get_latest_date(self) -> Optional[str]:
        """Get the latest date from existing data."""
        df = self.load_existing_data()
        if df.empty or 'Gregorian Date' not in df.columns:
            return None
        
        try:
            # Convert to datetime for proper sorting
            df['date_parsed'] = pd.to_datetime(df['Gregorian Date'])
            latest_date = df['date_parsed'].max()
            return latest_date.strftime('%Y/%m/%d')
        except Exception as e:
            self.logger.error(f"Error getting latest date: {e}")
            return None
    
    def save_data(self, data: List[Dict[str, Any]], mode: str = 'w') -> bool:
        """
        Save data to CSV file.
        
        Args:
            data: List of dictionaries containing row data
            mode: 'w' for overwrite, 'a' for append
        """
        if not data:
            self.logger.warning("No data to save")
            return False
        
        try:
            # Create DataFrame
            df = pd.DataFrame(data)
            
            # Reorder columns according to mapping
            column_order = list(COLUMN_MAPPING.values())
            df = df.reindex(columns=column_order)
            
            # Save to CSV
            if mode == 'a' and os.path.exists(self.csv_path):
                df.to_csv(self.csv_path, mode='a', header=False, index=False, encoding='utf-8')
            else:
                df.to_csv(self.csv_path, mode='w', header=True, index=False, encoding='utf-8')
            
            self.logger.info(f"Successfully saved {len(data)} records to {self.csv_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error saving data: {e}")
            return False
    
    def append_new_data(self, new_data: List[Dict[str, Any]]) -> bool:
        """Append new data to existing CSV, avoiding duplicates."""
        if not new_data:
            return True
        
        existing_df = self.load_existing_data()
        
        if existing_df.empty:
            return self.save_data(new_data, mode='w')
        
        try:
            # Create DataFrame from new data
            new_df = pd.DataFrame(new_data)
            
            # Check for duplicates based on Gregorian Date
            if 'Gregorian Date' in existing_df.columns and 'Gregorian Date' in new_df.columns:
                # Remove duplicates
                new_df = new_df[~new_df['Gregorian Date'].isin(existing_df['Gregorian Date'])]
                
                if new_df.empty:
                    self.logger.info("No new data to add (all records already exist)")
                    return True
            
            # Combine and sort by date (newest first)
            combined_df = pd.concat([new_df, existing_df], ignore_index=True)
            combined_df['date_parsed'] = pd.to_datetime(combined_df['Gregorian Date'])
            combined_df = combined_df.sort_values('date_parsed', ascending=False)
            combined_df = combined_df.drop('date_parsed', axis=1)
            
            # Remove actual duplicates
            combined_df = combined_df.drop_duplicates(subset=['Gregorian Date'])
            
            # Save the combined data
            combined_data = combined_df.to_dict('records')
            success = self.save_data(combined_data, mode='w')
            
            if success:
                self.logger.info(f"Successfully added {len(new_df)} new records")
            
            return success
            
        except Exception as e:
            self.logger.error(f"Error appending new data: {e}")
            return False
    
    def get_data_summary(self) -> Dict[str, Any]:
        """Get summary information about the current dataset."""
        df = self.load_existing_data()
        
        if df.empty:
            return {
                'total_records': 0,
                'date_range': None,
                'latest_date': None,
                'oldest_date': None
            }
        
        try:
            df['date_parsed'] = pd.to_datetime(df['Gregorian Date'])
            
            return {
                'total_records': len(df),
                'latest_date': df['date_parsed'].max().strftime('%Y/%m/%d'),
                'oldest_date': df['date_parsed'].min().strftime('%Y/%m/%d'),
                'date_range': f"{df['date_parsed'].min().strftime('%Y/%m/%d')} to {df['date_parsed'].max().strftime('%Y/%m/%d')}"
            }
        except Exception as e:
            self.logger.error(f"Error getting data summary: {e}")
            return {
                'total_records': len(df),
                'date_range': None,
                'latest_date': None,
                'oldest_date': None
            }
