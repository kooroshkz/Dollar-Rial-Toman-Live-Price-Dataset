#!/usr/bin/env python3
"""
Daily update script for Dollar-Rial-Toman Price Dataset

This script checks for new records on TGJU.org and updates the CSV files.
It's designed to be lightweight and run daily via GitHub Actions.

Author: Koorosh Komeili Zadeh
Date: Aug 2025
"""

import sys
import os
import csv
import pandas as pd
import time
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional, Tuple

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager

from config.settings import (
    TGJU_URL, CHROME_OPTIONS, SCRAPING_TIMEOUT, PAGE_LOAD_DELAY,
    ALERT_DISMISS_DELAY, DEFAULT_RIAL_OUTPUT, DEFAULT_TOMAN_OUTPUT,
    PRICE_COLUMNS, OUTPUT_COLUMNS, TOMAN_CONVERSION_RATE,
    DATE_FORMAT_INPUT, DATE_FORMAT_OUTPUT
)
from src.utils.formatters import DateFormatter, DataValidator


class DailyUpdateScraper:
    """Lightweight scraper for daily updates - only checks first page"""
    
    def __init__(self):
        self.driver = self._setup_driver()
        self.wait = WebDriverWait(self.driver, SCRAPING_TIMEOUT)
        self.date_formatter = DateFormatter()
    
    def _setup_driver(self) -> webdriver.Chrome:
        """Setup Chrome driver with options"""
        chrome_options = Options()
        for option in CHROME_OPTIONS:
            chrome_options.add_argument(option)
        
        try:
            driver_path = ChromeDriverManager().install()
            service = Service(driver_path)
            return webdriver.Chrome(service=service, options=chrome_options)
        except Exception:
            try:
                return webdriver.Chrome(options=chrome_options)
            except Exception as e:
                raise RuntimeError(f"Failed to initialize Chrome driver: {str(e)}")
    
    def _dismiss_alerts(self):
        """Dismiss any popup alerts on the page"""
        try:
            alerts = self.driver.find_elements(By.CLASS_NAME, "h-top-alert-c")
            for alert in alerts:
                if alert.is_displayed():
                    self.driver.execute_script("arguments[0].style.display = 'none';", alert)
        except Exception:
            pass
    
    def get_latest_records(self, count: int = 3) -> List[Dict]:
        """Get the latest N records from the first page"""
        try:
            print(f"Loading TGJU website to get latest {count} records...")
            self.driver.get(TGJU_URL)
            time.sleep(PAGE_LOAD_DELAY + 2)
            
            self._dismiss_alerts()
            
            table_body = self.wait.until(
                EC.presence_of_element_located((By.ID, "table-list"))
            )
            
            rows = table_body.find_elements(By.TAG_NAME, "tr")
            latest_records = []
            
            for row in rows[:count * 2]:  # Get extra rows in case some are invalid
                cells = row.find_elements(By.TAG_NAME, "td")
                if len(cells) >= 8:
                    row_date_str = cells[6].text.strip()
                    
                    # Skip invalid/future dates
                    if not DataValidator.is_valid_date(row_date_str):
                        continue
                    
                    row_data = {
                        'opening': cells[0].text.strip(),
                        'lowest': cells[1].text.strip(),
                        'highest': cells[2].text.strip(),
                        'closing': cells[3].text.strip(),
                        'change_amount': cells[4].text.strip(),
                        'change_percent': cells[5].text.strip(),
                        'date_gregorian': row_date_str,
                        'date_persian': cells[7].text.strip()
                    }
                    latest_records.append(row_data)
                    
                    if len(latest_records) >= count:
                        break
            
            print(f"Retrieved {len(latest_records)} latest records from website")
            return latest_records
            
        except Exception as e:
            print(f"Error getting latest records: {str(e)}")
            return []
    
    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()


class CSVManager:
    """Manage CSV file operations"""
    
    def __init__(self):
        self.date_formatter = DateFormatter()
    
    def get_last_csv_records(self, filename: str, count: int = 3) -> List[Dict]:
        """Get the last N records from CSV file"""
        try:
            if not os.path.exists(filename):
                print(f"Warning: {filename} does not exist")
                return []
            
            df = pd.read_csv(filename)
            if df.empty:
                return []
            
            # Get last N records
            last_records = df.tail(count).to_dict('records')
            print(f"Retrieved {len(last_records)} last records from {filename}")
            
            # Show the dates for debugging
            for record in last_records:
                print(f"  CSV record date: {record['Date']}")
            
            return last_records
            
        except Exception as e:
            print(f"Error reading CSV {filename}: {str(e)}")
            return []
    
    def convert_scraped_to_csv_format(self, scraped_data: List[Dict]) -> List[Dict]:
        """Convert scraped data format to CSV format"""
        csv_records = []
        
        for row in scraped_data:
            formatted_date = self.date_formatter.convert_date_format(row['date_gregorian'])
            csv_record = {
                'Date': formatted_date,
                'Persian_Date': row['date_persian'],
                'Open': row['opening'],
                'Low': row['lowest'],
                'High': row['highest'],
                'Close': row['closing']
            }
            csv_records.append(csv_record)
        
        return csv_records
    
    def find_new_records(self, website_records: List[Dict], csv_records: List[Dict]) -> List[Dict]:
        """Find records that exist on website but not in CSV"""
        if not csv_records:
            return website_records
        
        # Convert website records to CSV format
        website_csv_format = self.convert_scraped_to_csv_format(website_records)
        
        # Get existing dates from CSV
        existing_dates = {record['Date'] for record in csv_records}
        
        # Find new records
        new_records = []
        for record in website_csv_format:
            if record['Date'] not in existing_dates:
                new_records.append(record)
                print(f"Found new record for date: {record['Date']}")
        
        return new_records
    
    def append_records_to_csv(self, filename: str, new_records: List[Dict]) -> bool:
        """Append new records to CSV file"""
        try:
            if not new_records:
                print(f"No new records to append to {filename}")
                return True
            
            # Read existing data
            if os.path.exists(filename):
                df = pd.read_csv(filename)
            else:
                df = pd.DataFrame(columns=OUTPUT_COLUMNS)
            
            # Append new records
            new_df = pd.DataFrame(new_records)
            combined_df = pd.concat([df, new_df], ignore_index=True)
            
            # Sort by date
            combined_df['date_sort'] = pd.to_datetime(combined_df['Date'], format='%d/%m/%Y')
            combined_df = combined_df.sort_values('date_sort')
            combined_df = combined_df.drop('date_sort', axis=1).reset_index(drop=True)
            
            # Save to CSV
            combined_df.to_csv(filename, index=False, quoting=csv.QUOTE_NONNUMERIC)
            print(f"Added {len(new_records)} new records to {filename}")
            print(f"Total records now: {len(combined_df)}")
            
            return True
            
        except Exception as e:
            print(f"Error appending records to {filename}: {str(e)}")
            return False
    
    def create_toman_records(self, rial_records: List[Dict]) -> List[Dict]:
        """Convert Rial records to Toman format"""
        toman_records = []
        
        for record in rial_records:
            toman_record = record.copy()
            
            # Convert price columns
            for col in PRICE_COLUMNS:
                try:
                    # Clean and convert to float
                    price_str = record[col].replace(',', '').replace('"', '')
                    price_float = float(price_str)
                    
                    # Convert to Toman (divide by conversion rate)
                    toman_price = int(price_float / TOMAN_CONVERSION_RATE)
                    
                    # Format with commas
                    toman_record[col] = f"{toman_price:,}"
                    
                except (ValueError, KeyError) as e:
                    print(f"Error converting {col} for Toman: {str(e)}")
                    toman_record[col] = record[col]  # Keep original if conversion fails
            
            toman_records.append(toman_record)
        
        return toman_records


def main():
    """Main function for daily update"""
    print("Dollar-Rial-Toman Daily Update Script")
    print("=" * 40)
    print(f"Current time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    scraper = None
    try:
        # Initialize components
        scraper = DailyUpdateScraper()
        csv_manager = CSVManager()
        
        # Step 1: Get latest records from website (first page only)
        print("\n=== Step 1: Getting latest records from website ===")
        website_records = scraper.get_latest_records(count=3)
        
        if not website_records:
            print("No records retrieved from website. Exiting.")
            return False
        
        # Step 2: Get last records from Rial CSV
        print("\n=== Step 2: Getting last records from Rial CSV ===")
        csv_records = csv_manager.get_last_csv_records(DEFAULT_RIAL_OUTPUT, count=5)
        
        # Step 3: Find new records
        print("\n=== Step 3: Checking for new records ===")
        new_records = csv_manager.find_new_records(website_records, csv_records)
        
        if not new_records:
            print("No new records found. Dataset is up to date!")
            return True
        
        print(f"Found {len(new_records)} new records to add")
        
        # Step 4: Add new records to Rial CSV
        print("\n=== Step 4: Updating Rial dataset ===")
        rial_success = csv_manager.append_records_to_csv(DEFAULT_RIAL_OUTPUT, new_records)
        
        if not rial_success:
            print("Failed to update Rial dataset")
            return False
        
        # Step 5: Add new records to Toman CSV
        print("\n=== Step 5: Updating Toman dataset ===")
        toman_records = csv_manager.create_toman_records(new_records)
        toman_success = csv_manager.append_records_to_csv(DEFAULT_TOMAN_OUTPUT, toman_records)
        
        if not toman_success:
            print("Failed to update Toman dataset")
            return False
        
        print("\n=== Update completed successfully! ===")
        print(f"Added {len(new_records)} new records to both datasets")
        
        # Show the new records
        for record in new_records:
            print(f"  {record['Date']} - Close: {record['Close']} Rial")
        
        return True
        
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return False
        
    finally:
        if scraper:
            scraper.close()


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
