"""
Data processing and CSV operations for exchange rate data

Author: Koorosh Komeili Zadeh
Date: Aug 2025
"""

import csv
import pandas as pd
from typing import List, Dict, Optional
from config.settings import (
    PRICE_COLUMNS, OUTPUT_COLUMNS, TOMAN_CONVERSION_RATE,
    DEFAULT_RIAL_OUTPUT, DEFAULT_TOMAN_OUTPUT
)
from src.utils.formatters import DateFormatter


class DataProcessor:
    """Handle data processing, combining, and CSV export operations"""
    
    def __init__(self):
        self.date_formatter = DateFormatter()
    
    def _prepare_new_data(self, scraped_data: List[Dict]) -> pd.DataFrame:
        """Convert scraped data to DataFrame with proper formatting"""
        new_df_data = []
        
        for row in scraped_data:
            formatted_date = self.date_formatter.convert_date_format(row['date_gregorian'])
            new_df_data.append({
                'Date': formatted_date,
                'Persian_Date': row['date_persian'],
                'Open': row['opening'],
                'Low': row['lowest'],
                'High': row['highest'],
                'Close': row['closing']
            })
        
        return pd.DataFrame(new_df_data) if new_df_data else pd.DataFrame()
    
    def _prepare_existing_data(self, existing_df: pd.DataFrame) -> pd.DataFrame:
        """Clean and format existing data"""
        existing_clean = existing_df[OUTPUT_COLUMNS].copy()
        existing_clean['Date'] = existing_clean['Date'].apply(
            self.date_formatter.normalize_date_format
        )
        return existing_clean
    
    def _sort_combined_data(self, combined_df: pd.DataFrame) -> pd.DataFrame:
        """Sort combined DataFrame by date"""
        combined_df['Date'] = combined_df['Date'].apply(
            self.date_formatter.normalize_date_format
        )
        
        # Create temporary column for sorting
        combined_df['date_sort'] = pd.to_datetime(combined_df['Date'], format='%d/%m/%Y')
        combined_df = combined_df.sort_values('date_sort')
        combined_df = combined_df.drop('date_sort', axis=1).reset_index(drop=True)
        
        return combined_df
    
    def combine_and_save_data(self, 
                             existing_df: pd.DataFrame, 
                             scraped_data: List[Dict], 
                             filename: str = DEFAULT_RIAL_OUTPUT) -> Optional[pd.DataFrame]:
        """Combine existing and new data, then save to CSV"""
        try:
            print("Combining existing and new data...")
            
            # Prepare new data
            new_df = self._prepare_new_data(scraped_data)
            
            # Prepare existing data
            existing_clean = self._prepare_existing_data(existing_df)
            
            # Combine data
            if not new_df.empty:
                combined_df = pd.concat([existing_clean, new_df], ignore_index=True)
                combined_df = self._sort_combined_data(combined_df)
            else:
                combined_df = existing_clean
            
            # Save to CSV
            combined_df.to_csv(filename, index=False, quoting=csv.QUOTE_NONNUMERIC)
            
            print(f"Total records: {len(combined_df)}")
            print(f"Date range: {combined_df['Date'].iloc[0]} to {combined_df['Date'].iloc[-1]}")
            print(f"Complete Rial dataset saved to {filename}")
            
            return combined_df
            
        except Exception as e:
            print(f"Error combining and saving data: {str(e)}")
            return None
    
    def create_toman_dataset(self, 
                           rial_df: pd.DataFrame, 
                           filename: str = DEFAULT_TOMAN_OUTPUT) -> bool:
        """Create Toman dataset by converting Rial prices (divide by 10)"""
        try:
            toman_df = rial_df.copy()
            
            # Convert price columns
            for col in PRICE_COLUMNS:
                # Clean and convert to float
                toman_df[col] = (toman_df[col]
                               .str.replace(',', '')
                               .str.replace('"', '')
                               .astype(float))
                
                # Convert to Toman (divide by conversion rate)
                toman_df[col] = (toman_df[col] / TOMAN_CONVERSION_RATE).round(0).astype(int)
                
                # Format with commas
                toman_df[col] = toman_df[col].apply(lambda x: f"{x:,}")
            
            # Save to CSV
            toman_df.to_csv(filename, index=False, quoting=csv.QUOTE_NONNUMERIC)
            print(f"Complete Toman dataset saved to {filename}")
            
            return True
            
        except Exception as e:
            print(f"Error creating Toman dataset: {str(e)}")
            return False
    
    def validate_data_integrity(self, df: pd.DataFrame) -> bool:
        """Validate the integrity of the processed data"""
        try:
            # Check required columns
            if not all(col in df.columns for col in OUTPUT_COLUMNS):
                print("Error: Missing required columns")
                return False
            
            # Check for empty DataFrame
            if df.empty:
                print("Warning: DataFrame is empty")
                return False
            
            # Check for duplicate dates
            duplicate_dates = df['Date'].duplicated().sum()
            if duplicate_dates > 0:
                print(f"Warning: Found {duplicate_dates} duplicate dates")
            
            # Check price column formats
            for col in PRICE_COLUMNS:
                try:
                    # Try to convert a sample to float (after cleaning)
                    sample_price = df[col].iloc[0].replace(',', '').replace('"', '')
                    float(sample_price)
                except (ValueError, AttributeError):
                    print(f"Warning: Price column {col} may have formatting issues")
            
            print("Data validation completed")
            return True
            
        except Exception as e:
            print(f"Error during data validation: {str(e)}")
            return False
