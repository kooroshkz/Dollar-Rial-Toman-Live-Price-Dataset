#!/usr/bin/env python3
"""
Manual update script for Dollar-Rial-Toman Price Dataset

This script allows manual updates of the dataset by checking more records
and provides options for different update scenarios.

Author: Koorosh Komeili Zadeh
Date: Aug 2025
"""

import sys
import argparse
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from daily_update import DailyUpdateScraper, CSVManager
from config.settings import DEFAULT_RIAL_OUTPUT, DEFAULT_TOMAN_OUTPUT


def manual_update(records_to_check: int = 10, dry_run: bool = False):
    """
    Perform manual update with more control
    
    Args:
        records_to_check: Number of records to check from website
        dry_run: If True, only show what would be updated without making changes
    """
    print("Dollar-Rial-Toman Manual Update Script")
    print("=" * 42)
    
    scraper = None
    try:
        # Initialize components
        scraper = DailyUpdateScraper()
        csv_manager = CSVManager()
        
        # Get records from website
        print(f"\n=== Getting latest {records_to_check} records from website ===")
        website_records = scraper.get_latest_records(count=records_to_check)
        
        if not website_records:
            print("No records retrieved from website. Exiting.")
            return False
        
        print(f"Retrieved {len(website_records)} records from website")
        
        # Get records from CSV
        print(f"\n=== Getting records from CSV files ===")
        csv_records = csv_manager.get_last_csv_records(
            DEFAULT_RIAL_OUTPUT, 
            count=min(20, records_to_check + 5)
        )
        
        # Find new records
        print("\n=== Checking for new records ===")
        new_records = csv_manager.find_new_records(website_records, csv_records)
        
        if not new_records:
            print("✅ No new records found. Dataset is up to date!")
            return True
        
        print(f"Found {len(new_records)} new records:")
        for i, record in enumerate(new_records):
            print(f"  {i+1}. {record['Date']} ({record['Persian_Date']}) - Close: {record['Close']} Rial")
        
        if dry_run:
            print("\n=== DRY RUN MODE - No changes will be made ===")
            toman_records = csv_manager.create_toman_records(new_records)
            print(f"Would add {len(new_records)} records to both datasets")
            print("Toman conversions:")
            for rial, toman in zip(new_records, toman_records):
                print(f"  {rial['Date']}: {rial['Close']} Rial → {toman['Close']} Toman")
            return True
        
        # Confirm update
        print(f"\n=== Ready to update datasets ===")
        response = input(f"Add {len(new_records)} new records to both CSV files? (y/N): ").strip().lower()
        
        if response != 'y':
            print("Update cancelled by user.")
            return True
        
        # Update Rial dataset
        print("\n=== Updating Rial dataset ===")
        rial_success = csv_manager.append_records_to_csv(DEFAULT_RIAL_OUTPUT, new_records)
        
        if not rial_success:
            print("❌ Failed to update Rial dataset")
            return False
        
        # Update Toman dataset
        print("\n=== Updating Toman dataset ===")
        toman_records = csv_manager.create_toman_records(new_records)
        toman_success = csv_manager.append_records_to_csv(DEFAULT_TOMAN_OUTPUT, toman_records)
        
        if not toman_success:
            print("❌ Failed to update Toman dataset")
            return False
        
        print("\n✅ Update completed successfully!")
        print(f"Added {len(new_records)} new records to both datasets")
        
        return True
        
    except KeyboardInterrupt:
        print("\nUpdate cancelled by user")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False
        
    finally:
        if scraper:
            scraper.close()


def main():
    """Main function with argument parsing"""
    parser = argparse.ArgumentParser(description="Manual update for Dollar-Rial-Toman dataset")
    parser.add_argument(
        "--records", "-r", 
        type=int, 
        default=10,
        help="Number of records to check from website (default: 10)"
    )
    parser.add_argument(
        "--dry-run", "-d",
        action="store_true",
        help="Show what would be updated without making changes"
    )
    parser.add_argument(
        "--quick", "-q",
        action="store_true",
        help="Quick update - check only 3 records (equivalent to daily update)"
    )
    
    args = parser.parse_args()
    
    if args.quick:
        records_to_check = 3
    else:
        records_to_check = args.records
    
    if args.dry_run:
        print("🔍 DRY RUN MODE - No changes will be made")
    
    success = manual_update(records_to_check, args.dry_run)
    
    if success:
        print("\n🎉 Manual update completed successfully!")
    else:
        print("\n❌ Manual update failed")
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
