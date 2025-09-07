"""Configuration settings for the dollar scraper."""

# Target URL
BASE_URL = "https://www.tgju.org/profile/price_dollar_rl/history"

# Chrome driver settings
CHROME_OPTIONS = [
    "--headless",
    "--no-sandbox", 
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--window-size=1920,1080",
    "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
]

# Scraping settings
DEFAULT_PAGE_SIZE = 30  # Default number of rows per page
MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds

# Data settings
CSV_FILENAME = "Dollar_Rial_Price_Dataset.csv"
DATA_DIR = "data"

# Table selectors
TABLE_SELECTOR = "#DataTables_Table_0 tbody tr"
NEXT_BUTTON_SELECTOR = "#DataTables_Table_0_next"
PAGINATION_INFO_SELECTOR = "#DataTables_Table_0_info"

# Column mapping (English headers only)
COLUMN_MAPPING = {
    "open_price": "Open Price",
    "low_price": "Low Price", 
    "high_price": "High Price",
    "close_price": "Close Price",
    "change_amount": "Change Amount",
    "change_percent": "Change Percent",
    "gregorian_date": "Gregorian Date",
    "persian_date": "Persian Date"
}
