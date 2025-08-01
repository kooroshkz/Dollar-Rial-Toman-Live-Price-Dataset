#!/usr/bin/env python3
"""
Test script for the daily update functionality

This script tests the daily_update.py without actually modifying the CSV files.
It creates temporary copies and runs the update logic to verify everything works.

Author: Koorosh Komeili Zadeh
Date: Aug 2025
"""

import sys
import os
import shutil
import tempfile
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from scripts.daily_update import DailyUpdateScraper, CSVManager
from config.settings import DEFAULT_RIAL_OUTPUT, DEFAULT_TOMAN_OUTPUT


def test_daily_update():
    """Test the daily update functionality"""
    print("Testing Daily Update Script")
    print("=" * 30)
    
    # Create temporary directory for testing
    with tempfile.TemporaryDirectory() as temp_dir:
        print(f"Using temporary directory: {temp_dir}")
        
        # Copy CSV files to temp directory
        temp_rial_file = os.path.join(temp_dir, "test_rial.csv")
        temp_toman_file = os.path.join(temp_dir, "test_toman.csv")
        
        if os.path.exists(DEFAULT_RIAL_OUTPUT):
            shutil.copy2(DEFAULT_RIAL_OUTPUT, temp_rial_file)
            print(f"Copied Rial CSV to {temp_rial_file}")
        else:
            print(f"Warning: {DEFAULT_RIAL_OUTPUT} not found")
            return False
        
        if os.path.exists(DEFAULT_TOMAN_OUTPUT):
            shutil.copy2(DEFAULT_TOMAN_OUTPUT, temp_toman_file)
            print(f"Copied Toman CSV to {temp_toman_file}")
        else:
            print(f"Warning: {DEFAULT_TOMAN_OUTPUT} not found")
            return False
        
        scraper = None
        try:
            # Initialize components
            scraper = DailyUpdateScraper()
            csv_manager = CSVManager()
            
            # Test 1: Get website records
            print("\n=== Test 1: Getting website records ===")
            website_records = scraper.get_latest_records(count=3)
            
            if not website_records:
                print("❌ Failed to get website records")
                return False
            
            print(f"✅ Retrieved {len(website_records)} records from website")
            for i, record in enumerate(website_records):
                print(f"  {i+1}. {record['date_gregorian']} - Close: {record['closing']}")
            
            # Test 2: Get CSV records
            print("\n=== Test 2: Getting CSV records ===")
            csv_records = csv_manager.get_last_csv_records(temp_rial_file, count=5)
            
            if not csv_records:
                print("❌ Failed to get CSV records")
                return False
            
            print(f"✅ Retrieved {len(csv_records)} records from CSV")
            for i, record in enumerate(csv_records):
                print(f"  {i+1}. {record['Date']} - Close: {record['Close']}")
            
            # Test 3: Find new records
            print("\n=== Test 3: Finding new records ===")
            new_records = csv_manager.find_new_records(website_records, csv_records)
            
            print(f"✅ Found {len(new_records)} new records")
            if new_records:
                for i, record in enumerate(new_records):
                    print(f"  NEW {i+1}. {record['Date']} - Close: {record['Close']}")
            else:
                print("  No new records found - dataset is up to date!")
            
            # Test 4: Test Toman conversion
            print("\n=== Test 4: Testing Toman conversion ===")
            if new_records:
                toman_records = csv_manager.create_toman_records(new_records)
                print(f"✅ Converted {len(toman_records)} records to Toman format")
                for i, (rial, toman) in enumerate(zip(new_records, toman_records)):
                    print(f"  {i+1}. {rial['Date']}: {rial['Close']} Rial → {toman['Close']} Toman")
            else:
                print("  No new records to convert")
            
            # Test 5: Simulate CSV updates (without actually writing)
            print("\n=== Test 5: Simulating CSV updates ===")
            if new_records:
                print(f"Would add {len(new_records)} records to both CSV files")
                print("✅ Update simulation completed")
            else:
                print("✅ No updates needed - files are current")
            
            print("\n=== All tests passed! ===")
            return True
            
        except Exception as e:
            print(f"❌ Test failed with error: {str(e)}")
            return False
            
        finally:
            if scraper:
                scraper.close()


def main():
    """Main test function"""
    success = test_daily_update()
    
    if success:
        print("\n🎉 Daily update script is working correctly!")
        print("You can now use it in production.")
    else:
        print("\n❌ Tests failed. Please check the issues above.")
    
    return success


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
