"""
Date and data formatting utilities

Author: Koorosh Komeili Zadeh
Date: Aug 2025
"""

from datetime import datetime
from typing import Optional
from config.settings import DATE_FORMAT_INPUT, DATE_FORMAT_OUTPUT, DATE_FORMAT_EXISTING


class DateFormatter:
    """Handle date formatting and conversion operations"""
    
    @staticmethod
    def parse_date_from_row(date_str: str) -> Optional[datetime]:
        """Parse date from scraped row"""
        try:
            return datetime.strptime(date_str, DATE_FORMAT_INPUT)
        except ValueError:
            return None
    
    @staticmethod
    def convert_date_format(date_str: str) -> str:
        """Convert date from YYYY/MM/DD to DD/MM/YYYY format with leading zeros"""
        try:
            parts = date_str.split('/')
            if len(parts) == 3:
                year, month, day = parts
                day = f"{int(day):02d}"
                month = f"{int(month):02d}"
                return f"{day}/{month}/{year}"
            return date_str
        except (ValueError, IndexError):
            return date_str
    
    @staticmethod
    def normalize_date_format(date_str: str) -> str:
        """Normalize date format to DD/MM/YYYY with leading zeros"""
        try:
            date_obj = None
            
            # Try different date formats
            for fmt in [DATE_FORMAT_EXISTING, DATE_FORMAT_OUTPUT]:
                try:
                    date_obj = datetime.strptime(date_str, fmt)
                    break
                except ValueError:
                    continue
            
            if date_obj:
                day = f"{date_obj.day:02d}"
                month = f"{date_obj.month:02d}"
                year = str(date_obj.year)
                return f"{day}/{month}/{year}"
            
            return date_str
        except Exception:
            return date_str


class DataValidator:
    """Validate data integrity and format"""
    
    @staticmethod
    def is_valid_price(price_str: str) -> bool:
        """Check if price string is valid"""
        try:
            # Remove commas and quotes, then try to convert to float
            clean_price = price_str.replace(',', '').replace('"', '')
            float(clean_price)
            return True
        except (ValueError, AttributeError):
            return False
    
    @staticmethod
    def should_stop_scraping(row_date_str: str, last_existing_date: Optional[datetime]) -> bool:
        """Check if we should stop scraping based on the date"""
        if not last_existing_date:
            return False
            
        try:
            row_date = datetime.strptime(row_date_str, DATE_FORMAT_INPUT)
            
            if row_date <= last_existing_date:
                print(f"Reached existing data date: {row_date.strftime('%d/%m/%Y')} - stopping scrape")
                return True
                
        except ValueError as e:
            print(f"Error parsing date {row_date_str}: {str(e)}")
            
        return False
