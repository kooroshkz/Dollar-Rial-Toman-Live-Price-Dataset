"""
Web scraper for TGJU.org USD/IRR exchange rate data

Author: Koorosh Komeili Zadeh
Date: Aug 2025
"""

import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from typing import List, Dict, Tuple, Optional
from datetime import datetime

from config.settings import (
    TGJU_URL, CHROME_OPTIONS, SCRAPING_TIMEOUT, PAGE_LOAD_DELAY, 
    ALERT_DISMISS_DELAY, MAX_CONSECUTIVE_FAILURES, RETRY_DELAY
)
from src.utils.formatters import DataValidator


class TGJUWebScraper:
    """Web scraper for TGJU.org exchange rate data"""
    
    def __init__(self):
        self.driver = self._setup_driver()
        self.wait = WebDriverWait(self.driver, SCRAPING_TIMEOUT)
        self.scraped_data: List[Dict] = []
    
    def _setup_driver(self) -> webdriver.Chrome:
        """Setup Chrome driver with options"""
        chrome_options = Options()
        for option in CHROME_OPTIONS:
            chrome_options.add_argument(option)
        
        try:
            # Try to install and use ChromeDriverManager
            driver_path = ChromeDriverManager().install()
            service = Service(driver_path)
            return webdriver.Chrome(service=service, options=chrome_options)
        except Exception:
            # Fallback to system Chrome driver without showing warning
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
    
    def scrape_page(self, page_num: int, last_existing_date: Optional[datetime]) -> Tuple[List[Dict], bool]:
        """Scrape data from current page"""
        print(f"Scraping page {page_num}...")
        
        try:
            table_body = self.wait.until(
                EC.presence_of_element_located((By.ID, "table-list"))
            )
            
            rows = table_body.find_elements(By.TAG_NAME, "tr")
            page_data = []
            should_stop = False
            
            for row in rows:
                cells = row.find_elements(By.TAG_NAME, "td")
                if len(cells) >= 8:
                    row_date_str = cells[6].text.strip()
                    
                    # Check if we should stop scraping
                    if DataValidator.should_stop_scraping(row_date_str, last_existing_date):
                        should_stop = True
                        break
                    
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
                    page_data.append(row_data)
            
            return page_data, should_stop
            
        except TimeoutException:
            print(f"Timeout waiting for table on page {page_num}")
            return [], False
        except Exception as e:
            print(f"Error scraping page {page_num}: {str(e)}")
            return [], False
    
    def _go_to_next_page(self, page_num: int) -> bool:
        """Navigate to the next page"""
        try:
            self._dismiss_alerts()
            
            next_page_button = None
            
            # Try different methods to find the next page button
            selectors = [
                f"//a[@class='paginate_button ' and @data-dt-idx='{page_num}']",
                "//a[@class='paginate_button next' and @id='DataTables_Table_0_next']"
            ]
            
            for selector in selectors:
                try:
                    next_page_button = self.driver.find_element(By.XPATH, selector)
                    break
                except NoSuchElementException:
                    continue
            
            # Fallback: find any pagination button with suitable index
            if not next_page_button:
                try:
                    buttons = self.driver.find_elements(By.XPATH, "//a[@class='paginate_button ']")
                    for button in buttons:
                        try:
                            idx = int(button.get_attribute('data-dt-idx'))
                            if idx >= page_num:
                                next_page_button = button
                                break
                        except (ValueError, TypeError):
                            continue
                except NoSuchElementException:
                    pass
            
            if not next_page_button:
                return False
            
            # Scroll to button and click
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", next_page_button)
            time.sleep(ALERT_DISMISS_DELAY)
            
            try:
                self.driver.execute_script("arguments[0].click();", next_page_button)
            except Exception:
                try:
                    next_page_button.click()
                except Exception:
                    return False
            
            time.sleep(PAGE_LOAD_DELAY)
            
            # Wait for table to load
            self.wait.until(EC.presence_of_element_located((By.ID, "table-list")))
            
            return True
            
        except Exception as e:
            print(f"Error navigating to page {page_num}: {str(e)}")
            return False
    
    def scrape_new_data(self, last_existing_date: Optional[datetime], max_pages: int = None) -> List[Dict]:
        """Scrape new data until reaching the last existing date"""
        if max_pages is None:
            from config.settings import MAX_PAGES
            max_pages = MAX_PAGES
        
        try:
            print("Loading TGJU website...")
            self.driver.get(TGJU_URL)
            time.sleep(PAGE_LOAD_DELAY + 3)  # Extra time for initial load
            
            self._dismiss_alerts()
            
            # Scrape first page
            page_data, should_stop = self.scrape_page(1, last_existing_date)
            self.scraped_data.extend(page_data)
            
            if should_stop:
                print("Found overlap with existing data on page 1")
                return self.scraped_data
            
            # Continue with subsequent pages
            page_num = 2
            consecutive_failures = 0
            
            while page_num <= max_pages and consecutive_failures < MAX_CONSECUTIVE_FAILURES:
                if self._go_to_next_page(page_num):
                    consecutive_failures = 0
                    page_data, should_stop = self.scrape_page(page_num, last_existing_date)
                    self.scraped_data.extend(page_data)
                    
                    if should_stop:
                        break
                        
                    page_num += 1
                else:
                    consecutive_failures += 1
                    print(f"Could not navigate to page {page_num} (attempt {consecutive_failures}/{MAX_CONSECUTIVE_FAILURES})")
                    
                    if consecutive_failures < MAX_CONSECUTIVE_FAILURES:
                        print("Retrying after a longer wait...")
                        time.sleep(RETRY_DELAY)
                        page_num += 1
                    else:
                        print("Too many consecutive navigation failures, stopping scrape")
                        break
            
            return self.scraped_data
                    
        except Exception as e:
            print(f"Error during scraping: {str(e)}")
            return self.scraped_data
    
    def get_scraped_data(self) -> List[Dict]:
        """Get the scraped data"""
        return self.scraped_data
    
    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()
