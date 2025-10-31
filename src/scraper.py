"""Main scraper module for extracting USD/IRR exchange rate data."""

import time
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
from webdriver_manager.chrome import ChromeDriverManager

from .config import (
    BASE_URL, CHROME_OPTIONS, TABLE_SELECTOR, NEXT_BUTTON_SELECTOR, 
    PAGINATION_INFO_SELECTOR, MAX_RETRIES, RETRY_DELAY, COLUMN_MAPPING
)
from .utils import (
    setup_logging, clean_price_text, clean_change_text, parse_date,
    extract_pagination_info, validate_row_data, format_progress
)
from .data_manager import DataManager


class DollarScraper:
    """Main scraper class for extracting USD/IRR exchange rate data."""
    
    def __init__(self):
        self.logger = setup_logging()
        self.driver = None
        self.data_manager = DataManager()
        self.scraped_data = []
        self.start_time = None
        
    def _setup_driver(self) -> webdriver.Chrome:
        """Setup Chrome driver with options"""
        chrome_options = Options()
        for option in CHROME_OPTIONS:
            chrome_options.add_argument(option)
        
        try:
            # Use ChromeDriverManager to ensure we get the correct version
            self.logger.info("====== WebDriver manager ======")
            driver_path = ChromeDriverManager().install()
            self.logger.info(f"Using ChromeDriver at: {driver_path}")
            
            service = Service(driver_path)
            driver = webdriver.Chrome(service=service, options=chrome_options)
            
            # Log successful initialization
            self.logger.info("Chrome driver initialized successfully")
            return driver
            
        except Exception as e:
            self.logger.error(f"Failed to initialize Chrome driver: {str(e)}")
            # Try fallback without service (system chromedriver)
            try:
                self.logger.info("Attempting fallback to system ChromeDriver")
                driver = webdriver.Chrome(options=chrome_options)
                self.logger.info("Fallback Chrome driver initialized successfully")
                return driver
            except Exception as fallback_error:
                self.logger.error(f"Fallback also failed: {str(fallback_error)}")
                raise RuntimeError(f"Failed to initialize Chrome driver: {str(e)}")
    
    def _wait_for_element(self, selector: str, timeout: int = 10):
        """Wait for element to be present and return it."""
        try:
            wait = WebDriverWait(self.driver, timeout)
            return wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
        except TimeoutException:
            self.logger.error(f"Timeout waiting for element: {selector}")
            return None
    
    def _extract_row_data(self, row_element) -> Optional[Dict[str, Any]]:
        """Extract data from a table row element."""
        try:
            cells = row_element.find_elements(By.TAG_NAME, "td")
            
            if len(cells) < 8:
                self.logger.warning(f"Row has insufficient cells: {len(cells)}")
                return None
            
            # Extract data according to the table structure
            open_price = clean_price_text(cells[0].text)
            low_price = clean_price_text(cells[1].text)
            high_price = clean_price_text(cells[2].text)
            close_price = clean_price_text(cells[3].text)
            change_amount = clean_change_text(cells[4].text)
            change_percent = clean_change_text(cells[5].text)
            gregorian_date = parse_date(cells[6].text)
            persian_date = cells[7].text.strip()
            
            row_data = {
                COLUMN_MAPPING["open_price"]: open_price,
                COLUMN_MAPPING["low_price"]: low_price,
                COLUMN_MAPPING["high_price"]: high_price,
                COLUMN_MAPPING["close_price"]: close_price,
                COLUMN_MAPPING["change_amount"]: change_amount,
                COLUMN_MAPPING["change_percent"]: change_percent,
                COLUMN_MAPPING["gregorian_date"]: gregorian_date,
                COLUMN_MAPPING["persian_date"]: persian_date
            }
            
            if validate_row_data(row_data):
                return row_data
            else:
                self.logger.warning(f"Invalid row data: {row_data}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error extracting row data: {e}")
            return None
    
    def _scrape_current_page(self) -> List[Dict[str, Any]]:
        """Scrape data from the current page."""
        page_data = []
        
        try:
            # Wait for table to load
            table_rows = self.driver.find_elements(By.CSS_SELECTOR, TABLE_SELECTOR)
            
            if not table_rows:
                self.logger.warning("No table rows found on current page")
                return page_data
            
            self.logger.info(f"Found {len(table_rows)} rows on current page")
            
            for i, row in enumerate(table_rows):
                row_data = self._extract_row_data(row)
                if row_data:
                    page_data.append(row_data)
                    self.logger.debug(f"Extracted row {i+1}: {row_data[COLUMN_MAPPING['gregorian_date']]}")
            
            self.logger.info(f"Successfully extracted {len(page_data)} valid rows from current page")
            
        except Exception as e:
            self.logger.error(f"Error scraping current page: {e}")
        
        return page_data
    
    def _get_pagination_info(self) -> Dict[str, int]:
        """Get pagination information from the page."""
        try:
            info_element = self._wait_for_element(PAGINATION_INFO_SELECTOR, timeout=5)
            if info_element:
                info_text = info_element.text
                return extract_pagination_info(info_text)
        except Exception as e:
            self.logger.error(f"Error getting pagination info: {e}")
        
        return {'start': 0, 'end': 0, 'total': 0, 'current_page_size': 0}
    
    def _has_next_page(self) -> bool:
        """Check if there's a next page available."""
        try:
            next_button = self.driver.find_element(By.CSS_SELECTOR, NEXT_BUTTON_SELECTOR)
            # Check if button is disabled
            classes = next_button.get_attribute("class")
            return "disabled" not in classes.lower()
        except NoSuchElementException:
            return False
        except Exception as e:
            self.logger.error(f"Error checking next page: {e}")
            return False
    
    def _click_next_page(self) -> bool:
        """Click the next page button."""
        try:
            next_button = self._wait_for_element(NEXT_BUTTON_SELECTOR, timeout=10)
            if next_button and "disabled" not in next_button.get_attribute("class").lower():
                self.driver.execute_script("arguments[0].click();", next_button)
                
                # Wait for page to load
                time.sleep(RETRY_DELAY)
                
                # Wait for table to update
                self._wait_for_element(TABLE_SELECTOR, timeout=10)
                
                return True
            else:
                self.logger.info("Next button is disabled or not found")
                return False
                
        except Exception as e:
            self.logger.error(f"Error clicking next page: {e}")
            return False
    
    def _should_stop_scraping(self, current_date: str) -> bool:
        """Check if we should stop scraping based on existing data."""
        latest_existing_date = self.data_manager.get_latest_date()
        
        if not latest_existing_date:
            return False
        
        try:
            current_dt = datetime.strptime(current_date, '%Y/%m/%d')
            latest_dt = datetime.strptime(latest_existing_date, '%Y/%m/%d')
            
            # Stop if we've reached data that already exists
            if current_dt <= latest_dt:
                self.logger.info(f"Reached existing data. Stopping at {current_date}")
                return True
                
        except ValueError as e:
            self.logger.error(f"Error comparing dates: {e}")
        
        return False
    
    def scrape_all_data(self, incremental: bool = True) -> bool:
        """
        Scrape all historical data from the website.
        
        Args:
            incremental: If True, only scrape new data since last run
        """
        self.start_time = datetime.now()
        self.scraped_data = []
        
        try:
            self.logger.info("Starting dollar scraper...")
            
            # Check existing data
            if incremental:
                summary = self.data_manager.get_data_summary()
                self.logger.info(f"Existing data summary: {summary}")
            
            # Setup driver
            self.logger.info("Setting up Chrome driver...")
            self.driver = self._setup_driver()
            
            # Navigate to the website
            self.logger.info(f"Navigating to {BASE_URL}")
            self.driver.get(BASE_URL)
            
            # Wait for page to load
            time.sleep(3)
            
            # Get initial pagination info
            pagination_info = self._get_pagination_info()
            total_records = pagination_info.get('total', 0)
            
            self.logger.info(f"Total records available: {total_records}")
            
            page_count = 0
            total_scraped = 0
            
            while True:
                page_count += 1
                self.logger.info(f"\n--- Scraping Page {page_count} ---")
                
                # Scrape current page
                page_data = self._scrape_current_page()
                
                if not page_data:
                    self.logger.warning("No data found on current page. Stopping.")
                    break
                
                # Check if we should stop (for incremental updates)
                if incremental and page_data:
                    first_date = page_data[0].get(COLUMN_MAPPING["gregorian_date"])
                    if first_date and self._should_stop_scraping(first_date):
                        # Only add new data (dates newer than existing)
                        latest_existing_date = self.data_manager.get_latest_date()
                        if latest_existing_date:
                            latest_dt = datetime.strptime(latest_existing_date, '%Y/%m/%d')
                            new_data = []
                            for row in page_data:
                                row_date = row.get(COLUMN_MAPPING["gregorian_date"])
                                if row_date:
                                    row_dt = datetime.strptime(row_date, '%Y/%m/%d')
                                    if row_dt > latest_dt:
                                        new_data.append(row)
                            
                            if new_data:
                                self.scraped_data.extend(new_data)
                                total_scraped += len(new_data)
                                self.logger.info(f"Added {len(new_data)} new records from this page")
                        
                        break
                
                # Add all page data
                self.scraped_data.extend(page_data)
                total_scraped += len(page_data)
                
                # Show progress
                progress_msg = format_progress(total_scraped, total_records, self.start_time)
                self.logger.info(progress_msg)
                
                # Check if there's a next page
                if not self._has_next_page():
                    self.logger.info("Reached the last page")
                    break
                
                # Click next page
                if not self._click_next_page():
                    self.logger.warning("Failed to navigate to next page")
                    break
                
                # Rate limiting
                time.sleep(1)
            
            self.logger.info(f"\nScraping completed! Total records scraped: {total_scraped}")
            
            # Save data
            if self.scraped_data:
                if incremental:
                    success = self.data_manager.append_new_data(self.scraped_data)
                else:
                    success = self.data_manager.save_data(self.scraped_data)
                
                if success:
                    self.logger.info("Data saved successfully!")
                    
                    # Show final summary
                    final_summary = self.data_manager.get_data_summary()
                    self.logger.info(f"Final dataset summary: {final_summary}")
                    
                    return True
                else:
                    self.logger.error("Failed to save data")
                    return False
            else:
                self.logger.info("No new data to save")
                return True
                
        except KeyboardInterrupt:
            self.logger.info("Scraping interrupted by user")
            return False
        except Exception as e:
            self.logger.error(f"Error during scraping: {e}")
            return False
        finally:
            if self.driver:
                self.driver.quit()
                self.logger.info("Chrome driver closed")
    
    def run(self) -> bool:
        """Main entry point for the scraper."""
        try:
            # Check if we have existing data
            existing_summary = self.data_manager.get_data_summary()
            
            if existing_summary['total_records'] > 0:
                self.logger.info("Existing data found. Running incremental update...")
                return self.scrape_all_data(incremental=True)
            else:
                self.logger.info("No existing data found. Starting full scrape...")
                return self.scrape_all_data(incremental=False)
                
        except Exception as e:
            self.logger.error(f"Error in main run: {e}")
            return False
