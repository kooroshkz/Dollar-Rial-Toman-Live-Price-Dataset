"""Utility functions for the dollar scraper."""

import logging
import re
from datetime import datetime
from typing import Optional, List, Dict, Any


def setup_logging(level: int = logging.INFO) -> logging.Logger:
    """Setup logging configuration."""
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('scraper.log', encoding='utf-8')
        ]
    )
    return logging.getLogger(__name__)


def clean_price_text(price_text: str) -> Optional[int]:
    """Clean and convert price text to integer."""
    if not price_text or price_text.strip() == '':
        return None
    
    # Remove commas and extra spaces
    cleaned = re.sub(r'[,\s]', '', price_text.strip())
    
    try:
        # Convert to float first, then to int to handle any decimal values
        return int(float(cleaned))
    except ValueError:
        return None


def clean_change_text(change_text: str) -> Optional[str]:
    """Clean change amount/percent text."""
    if not change_text or change_text.strip() == '':
        return None
    
    # Remove extra spaces but keep the sign and value
    cleaned = change_text.strip()
    return cleaned


def parse_date(date_text: str) -> Optional[str]:
    """Parse and validate date text."""
    if not date_text or date_text.strip() == '':
        return None
    
    date_text = date_text.strip()
    
    # Check if it's in YYYY/MM/DD format
    if re.match(r'^\d{4}/\d{2}/\d{2}$', date_text):
        return date_text
    
    return None


def extract_pagination_info(info_text: str) -> Dict[str, int]:
    """Extract pagination information from the info text."""
    # Example: "نمایش 1 تا 30 از مجموع 3,648 مورد"
    pattern = r'نمایش (\d+) تا (\d+) از مجموع ([\d,]+) مورد'
    match = re.search(pattern, info_text)
    
    if match:
        start = int(match.group(1))
        end = int(match.group(2))
        total = int(match.group(3).replace(',', ''))
        return {
            'start': start,
            'end': end,
            'total': total,
            'current_page_size': end - start + 1
        }
    
    return {'start': 0, 'end': 0, 'total': 0, 'current_page_size': 0}


def validate_row_data(row_data: Dict[str, Any]) -> bool:
    """Validate if a row contains valid data."""
    required_fields = ['Gregorian Date', 'Close Price']
    
    for field in required_fields:
        if field not in row_data or row_data[field] is None:
            return False
    
    return True


def format_progress(current: int, total: int, start_time: datetime) -> str:
    """Format progress information for console output."""
    if total == 0:
        return "Progress: Unknown"
    
    percentage = (current / total) * 100
    elapsed = datetime.now() - start_time
    
    if current > 0:
        avg_time_per_item = elapsed.total_seconds() / current
        estimated_remaining = (total - current) * avg_time_per_item
        eta_minutes = estimated_remaining / 60
        
        return f"Progress: {current}/{total} ({percentage:.1f}%) - ETA: {eta_minutes:.1f} minutes"
    
    return f"Progress: {current}/{total} ({percentage:.1f}%)"


def is_weekend_or_holiday(date_str: str) -> bool:
    """
    Check if a given date might be a weekend or holiday.
    This is a simple check - in practice, you might want to use a proper holiday calendar.
    """
    try:
        # Parse the date
        date_obj = datetime.strptime(date_str, '%Y/%m/%d')
        
        # Check if it's Friday (4) or Saturday (5) - weekend in Iran
        # Note: In Iran, Thursday-Friday is weekend, but the market follows a different schedule
        if date_obj.weekday() == 4:  # Friday
            return True
            
        return False
    except ValueError:
        return False
