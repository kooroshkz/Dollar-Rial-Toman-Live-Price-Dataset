"""
Dollar-Rial Price Dataset Scraper

This script scrapes USD/IRR exchange rate data from TGJU.org and combines it with
existing historical data to create a comprehensive dataset from 2011 to present.

Requirements:
    selenium, webdriver-manager, datasets, pandas

Author: Koorosh Komeili Zadeh
Date: Aug 2025
"""

import csv
import time
import pandas as pd
from datetime import datetime, timedelta
from datasets import load_dataset
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager

class EnhancedTGJUScraper:
    def __init__(self):
        chrome_options = Options()
        chrome_options.add_argument("--headless") 
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        
        try:
            driver_path = ChromeDriverManager().install()
            service = Service(driver_path)
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
        except Exception as e:
            self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)
        self.new_data = []
        self.existing_data = None
        self.last_existing_date = None
        
    def load_existing_dataset(self):
        """Load the existing dataset from Hugging Face"""
        try:
            print("Loading existing dataset from Hugging Face...")
            dataset = load_dataset("mohammadtaghizadeh/Dollar_Rial_Price_Dataset")
            
            self.existing_data = dataset['train'].to_pandas()
            
            print(f"Loaded Successfully: {len(self.existing_data)} existing records")
            print(f"Date range: {self.existing_data['Date'].iloc[0]} to {self.existing_data['Date'].iloc[-1]}")
            
            last_date_str = self.existing_data['Date'].iloc[-1]
            self.last_existing_date = datetime.strptime(last_date_str, "%m/%d/%Y")
            
            
            return True
            
        except Exception as e:
            print(f"Error loading existing dataset: {str(e)}")
            return False
    
    def parse_date_from_row(self, date_str):
        """Parse date from scraped row"""
        try:
            return datetime.strptime(date_str, "%Y/%m/%d")
        except:
            return None
    
    def should_stop_scraping(self, row_date_str):
        """Check if we should stop scraping based on the date"""
        if not self.last_existing_date:
            return False
            
        try:
            row_date = datetime.strptime(row_date_str, "%Y/%m/%d")
            
            if row_date <= self.last_existing_date:
                print(f"Reached existing data date: {row_date.strftime('%d/%m/%Y')} - stopping scrape")
                return True
                
        except Exception as e:
            print(f"Error parsing date {row_date_str}: {str(e)}")
            
        return False
    
    def scrape_page(self, page_num):
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
                    
                    if self.should_stop_scraping(row_date_str):
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
    
    def go_to_next_page(self, page_num):
        """Navigate to the next page"""
        try:
            try:
                alerts = self.driver.find_elements(By.CLASS_NAME, "h-top-alert-c")
                for alert in alerts:
                    if alert.is_displayed():
                        self.driver.execute_script("arguments[0].style.display = 'none';", alert)
            except:
                pass
            
            next_page_button = None
            
            try:
                next_page_button = self.driver.find_element(
                    By.XPATH, 
                    f"//a[@class='paginate_button ' and @data-dt-idx='{page_num}']"
                )
            except NoSuchElementException:
                pass
            
            if not next_page_button:
                try:
                    next_page_button = self.driver.find_element(
                        By.XPATH, 
                        "//a[@class='paginate_button next' and @id='DataTables_Table_0_next']"
                    )
                except NoSuchElementException:
                    pass
            
            if not next_page_button:
                try:
                    buttons = self.driver.find_elements(
                        By.XPATH, 
                        "//a[@class='paginate_button ']"
                    )
                    for button in buttons:
                        try:
                            idx = int(button.get_attribute('data-dt-idx'))
                            if idx >= page_num:
                                next_page_button = button
                                break
                        except:
                            continue
                except NoSuchElementException:
                    pass
            
            if not next_page_button:
                return False
            
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", next_page_button)
            time.sleep(3)
            
            try:
                self.driver.execute_script("arguments[0].click();", next_page_button)
            except:
                try:
                    next_page_button.click()
                except:
                    return False
            
            time.sleep(5)
            
            self.wait.until(
                EC.presence_of_element_located((By.ID, "table-list"))
            )
            
            return True
            
        except Exception as e:
            print(f"Error navigating to page {page_num}: {str(e)}")
            return False
    
    def scrape_new_data(self, max_pages=200):
        """Scrape new data until we reach the last existing date"""
        try:
            print("Loading TGJU website...")
            self.driver.get("https://www.tgju.org/profile/price_dollar_rl/history")
            
            time.sleep(8)
            
            try:
                alerts = self.driver.find_elements(By.CLASS_NAME, "h-top-alert-c")
                for alert in alerts:
                    if alert.is_displayed():
                        self.driver.execute_script("arguments[0].style.display = 'none';", alert)
            except:
                pass
            
            page_data, should_stop = self.scrape_page(1)
            self.new_data.extend(page_data)
            
            if should_stop:
                print("Found overlap with existing data on page 1")
                return
            
            page_num = 2
            consecutive_failures = 0
            max_consecutive_failures = 3
            
            while page_num <= max_pages and consecutive_failures < max_consecutive_failures:
                if self.go_to_next_page(page_num):
                    consecutive_failures = 0
                    page_data, should_stop = self.scrape_page(page_num)
                    self.new_data.extend(page_data)
                    
                    if should_stop:
                        break
                        
                    page_num += 1
                else:
                    consecutive_failures += 1
                    print(f"Could not navigate to page {page_num} (attempt {consecutive_failures}/{max_consecutive_failures})")
                    
                    if consecutive_failures < max_consecutive_failures:
                        print("Retrying after a longer wait...")
                        time.sleep(5)
                        page_num += 1
                    else:
                        print("Too many consecutive navigation failures, stopping scrape")
                        break
                    
        except Exception as e:
            print(f"Error during scraping: {str(e)}")
    
    def convert_date_format(self, date_str):
        """Convert date from YYYY/MM/DD to DD/MM/YYYY format with leading zeros"""
        try:
            parts = date_str.split('/')
            if len(parts) == 3:
                year, month, day = parts
                day = f"{int(day):02d}"
                month = f"{int(month):02d}"
                return f"{day}/{month}/{year}"
            return date_str
        except:
            return date_str
    
    def normalize_date_format(self, date_str):
        """Normalize date format to DD/MM/YYYY with leading zeros"""
        try:
            date_obj = None
            
            try:
                date_obj = datetime.strptime(date_str, "%m/%d/%Y")
            except ValueError:
                pass
            
            if not date_obj:
                try:
                    date_obj = datetime.strptime(date_str, "%d/%m/%Y")
                except ValueError:
                    pass
            
            if date_obj:
                day = f"{date_obj.day:02d}"
                month = f"{date_obj.month:02d}"
                year = str(date_obj.year)
                return f"{day}/{month}/{year}"
            
            return date_str
        except:
            return date_str

    def combine_and_save_data(self, filename="Dollar_Rial_Price_Dataset.csv"):
        """Combine existing and new data, then save to CSV"""
        try:
            print("Combining existing and new data...")
            
            new_df_data = []
            for row in self.new_data:
                formatted_date = self.convert_date_format(row['date_gregorian'])
                new_df_data.append({
                    'Date': formatted_date,
                    'Persian_Date': row['date_persian'],
                    'Open': row['opening'],
                    'Low': row['lowest'],
                    'High': row['highest'],
                    'Close': row['closing']
                })
            
            if new_df_data:
                new_df = pd.DataFrame(new_df_data)
                
                existing_clean = self.existing_data[['Date', 'Persian_Date', 'Open', 'Low', 'High', 'Close']].copy()
                existing_clean['Date'] = existing_clean['Date'].apply(self.normalize_date_format)
                
                combined_df = pd.concat([existing_clean, new_df], ignore_index=True)
                
                combined_df['Date'] = combined_df['Date'].apply(self.normalize_date_format)
                
                combined_df['date_sort'] = pd.to_datetime(combined_df['Date'], format='%d/%m/%Y')
                combined_df = combined_df.sort_values('date_sort')
                combined_df = combined_df.drop('date_sort', axis=1).reset_index(drop=True)
                
            else:
                existing_clean = self.existing_data[['Date', 'Persian_Date', 'Open', 'Low', 'High', 'Close']].copy()
                existing_clean['Date'] = existing_clean['Date'].apply(self.normalize_date_format)
                combined_df = existing_clean
            
            combined_df.to_csv(filename, index=False, quoting=csv.QUOTE_NONNUMERIC)
            
            print(f"Total records: {len(combined_df)}")
            print(f"Date range: {combined_df['Date'].iloc[0]} to {combined_df['Date'].iloc[-1]}")
            print(f"Complete Rial dataset saved to {filename}")
            
            return combined_df
            
        except Exception as e:
            print(f"Error combining and saving data: {str(e)}")
            return None
    
    def create_toman_dataset(self, rial_df, filename="Dollar_Toman_Price_Dataset.csv"):
        """Create Toman dataset by converting Rial prices (divide by 10)"""
        try:
            toman_df = rial_df.copy()
            
            price_cols = ['Open', 'Low', 'High', 'Close']
            for col in price_cols:
                toman_df[col] = toman_df[col].str.replace(',', '').str.replace('"', '').astype(float)
                toman_df[col] = (toman_df[col] / 10).round(0).astype(int)
                toman_df[col] = toman_df[col].apply(lambda x: f"{x:,}")
            
            toman_df.to_csv(filename, index=False, quoting=csv.QUOTE_NONNUMERIC)
            print(f"Complete Toman dataset saved to {filename}")
            
            return True
            
        except Exception as e:
            return False

    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()

def main():
    scraper = EnhancedTGJUScraper()
    
    try:
        if not scraper.load_existing_dataset():
            print("Failed to load existing dataset")
            return
        
        scraper.scrape_new_data(max_pages=200)
        
        rial_df = scraper.combine_and_save_data("Dollar_Rial_Price_Dataset.csv")
        
        if rial_df is not None:
            scraper.create_toman_dataset(rial_df, "Dollar_Toman_Price_Dataset.csv")
        
    finally:
        scraper.close()

if __name__ == "__main__":
    main()
