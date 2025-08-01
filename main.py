"""
Main orchestrator for the Dollar-Rial Price Dataset Scraper

This script coordinates the scraping, processing, and saving of USD/IRR exchange rate data.

Author: Koorosh Komeili Zadeh
Date: Aug 2025
"""

import sys
import os
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from src.data.dataset_manager import DatasetManager
from src.scraper.web_scraper import TGJUWebScraper
from src.data.processor import DataProcessor
from config.settings import DEFAULT_RIAL_OUTPUT, DEFAULT_TOMAN_OUTPUT


class ExchangeRateScraperOrchestrator:
    """Main orchestrator class that coordinates all scraping operations"""
    
    def __init__(self):
        self.dataset_manager = DatasetManager()
        self.web_scraper = TGJUWebScraper()
        self.data_processor = DataProcessor()
    
    def run(self) -> bool:
        """Run the complete scraping and processing pipeline"""
        try:
            # Step 1: Load existing dataset
            print("=== Step 1: Loading existing dataset ===")
            if not self.dataset_manager.load_existing_dataset():
                print("Failed to load existing dataset")
                return False
            
            # Step 2: Scrape new data
            print("\n=== Step 2: Scraping new data ===")
            existing_data = self.dataset_manager.get_existing_data()
            last_existing_date = self.dataset_manager.get_last_existing_date()
            
            scraped_data = self.web_scraper.scrape_new_data(last_existing_date)
            print(f"Scraped {len(scraped_data)} new records")
            
            # Step 3: Process and combine data
            print("\n=== Step 3: Processing and combining data ===")
            rial_df = self.data_processor.combine_and_save_data(
                existing_data, 
                scraped_data, 
                DEFAULT_RIAL_OUTPUT
            )
            
            if rial_df is None:
                print("Failed to process and save Rial data")
                return False
            
            # Step 4: Create Toman dataset
            print("\n=== Step 4: Creating Toman dataset ===")
            toman_success = self.data_processor.create_toman_dataset(
                rial_df, 
                DEFAULT_TOMAN_OUTPUT
            )
            
            if not toman_success:
                print("Failed to create Toman dataset")
                return False
            
            # Step 5: Validate data
            print("\n=== Step 5: Validating data ===")
            validation_success = self.data_processor.validate_data_integrity(rial_df)
            
            if validation_success:
                print("\n=== Pipeline completed successfully! ===")
                self._print_summary(rial_df)
                return True
            else:
                print("Data validation failed")
                return False
                
        except Exception as e:
            print(f"Error in pipeline execution: {str(e)}")
            return False
        
        finally:
            # Always clean up resources
            self.cleanup()
    
    def _print_summary(self, rial_df):
        """Print a summary of the completed operation"""
        record_count, first_date, last_date = self.dataset_manager.get_dataset_info()
        scraped_count = len(self.web_scraper.get_scraped_data())
        
        print(f"""
Pipeline Summary:
================
• Original dataset: {record_count} records ({first_date} to {last_date})
• New records scraped: {scraped_count}
• Final dataset: {len(rial_df)} records
• Rial dataset: {DEFAULT_RIAL_OUTPUT}
• Toman dataset: {DEFAULT_TOMAN_OUTPUT}
        """)
    
    def cleanup(self):
        """Clean up resources"""
        try:
            self.web_scraper.close()
            print("Resources cleaned up successfully")
        except Exception as e:
            print(f"Error during cleanup: {str(e)}")


def main():
    """Main entry point"""
    print("Dollar-Rial-Toman Live Price Dataset Scraper")
    print("=" * 50)
    
    orchestrator = ExchangeRateScraperOrchestrator()
    
    try:
        success = orchestrator.run()
        exit_code = 0 if success else 1
        sys.exit(exit_code)
        
    except KeyboardInterrupt:
        print("\nScraping interrupted by user")
        orchestrator.cleanup()
        sys.exit(1)
    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        orchestrator.cleanup()
        sys.exit(1)


if __name__ == "__main__":
    main()
