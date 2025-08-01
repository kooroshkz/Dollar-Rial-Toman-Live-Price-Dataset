"""
Configuration settings for the Dollar-Rial Price Dataset Scraper

Author: Koorosh Komeili Zadeh
Date: Aug 2025
"""

# Web scraping settings
TGJU_URL = "https://www.tgju.org/profile/price_dollar_rl/history"
MAX_PAGES = 200
SCRAPING_TIMEOUT = 10
PAGE_LOAD_DELAY = 5
ALERT_DISMISS_DELAY = 3

# Chrome driver settings
CHROME_OPTIONS = [
    "--headless",
    "--no-sandbox", 
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--window-size=1920,1080",
    "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
]

# Dataset settings
HUGGINGFACE_DATASET = "mohammadtaghizadeh/Dollar_Rial_Price_Dataset"
DEFAULT_RIAL_OUTPUT = "data/Dollar_Rial_Price_Dataset.csv"
DEFAULT_TOMAN_OUTPUT = "data/Dollar_Toman_Price_Dataset.csv"

# Data processing settings
DATE_FORMAT_INPUT = "%Y/%m/%d"
DATE_FORMAT_OUTPUT = "%d/%m/%Y"
DATE_FORMAT_EXISTING = "%m/%d/%Y"
TOMAN_CONVERSION_RATE = 10

# Error handling
MAX_CONSECUTIVE_FAILURES = 3
RETRY_DELAY = 5

# Columns
PRICE_COLUMNS = ['Open', 'Low', 'High', 'Close']
OUTPUT_COLUMNS = ['Date', 'Persian_Date', 'Open', 'Low', 'High', 'Close']
