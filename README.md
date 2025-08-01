# Dollar-Rial-Toman Live Price Dataset

Daily updated dataset of US Dollar to Iranian Rial exchange rates (USD/IRR). Historical and live prices from November 2011 to present, handy for financial analysis, forecasting, and machine learning projects.

## Dataset Overview

- **Time Period**: November 27, 2011 - July 31, 2025
- **Total Records**: 3,900+ daily price points
- **Data Source**: TGJU.org (Tehran Gold & Jewelry Union)
- **Update Frequency**: Can be updated daily using the scraper
- **Format**: CSV with proper indexing and date formatting

## Project Structure

```
Dollar-Rial-Toman-Live-Price-Dataset/
├── main.py                     # Main script
├── requirements.txt           # Python dependencies
├── README.md                 # This file
├── LICENSE                   # MIT License
├── config/                   # Configuration settings
│   ├── __init__.py
│   └── settings.py          # All configuration constants
├── src/                     # Source code
│   ├── __init__.py
│   ├── data/               # Data processing modules
│   │   ├── __init__.py
│   │   ├── dataset_manager.py  # Hugging Face dataset handling
│   │   └── processor.py        # Data processing and CSV operations
│   ├── scraper/           # Web scraping modules
│   │   ├── __init__.py
│   │   └── web_scraper.py     # TGJU.org scraping logic
│   └── utils/             # Utility functions
│       ├── __init__.py
│       └── formatters.py      # Date formatting and validation
├── data/                  # Output directory for CSV files
│   ├── Dollar_Rial_Price_Dataset.csv
│   └── Dollar_Toman_Price_Dataset.csv
└── test/                  # Unit and integration tests
    ├── test_modules.py
    ├── test_data_processing.py
    ├── test_integration.py
    ├── run_tests.py
    └── README.md
```

## Data Structure

| Column | Description | Example |
|--------|-------------|---------|
| Date | Gregorian date (DD/MM/YYYY) | 07/31/2025 |
| Persian_Date | Persian/Shamsi date | 1404/05/09 |
| Open | Opening price in Rials | "896,100" |
| Low | Lowest price of the day | "895,700" |
| High | Highest price of the day | "908,850" |
| Close | Closing price in Rials | "905,600" |

## Quick Start

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kooroshkz/Dollar-Rial-Toman-Live-Price-Dataset.git
cd Dollar-Rial-Toman-Live-Price-Dataset
```

2. Create and activate a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate     # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Usage

#### Run the scraper:
```bash
python main.py
```

#### Load the dataset in Python:
```python
import pandas as pd

# Load Rial dataset
rial_df = pd.read_csv('data/Dollar_Rial_Price_Dataset.csv')

# Load Toman dataset  
toman_df = pd.read_csv('data/Dollar_Toman_Price_Dataset.csv')
```

## Features

- **Modular Architecture**: Clean separation of concerns with dedicated modules
- **Robust Error Handling**: Comprehensive exception handling and validation
- **Configurable Settings**: Centralized configuration management
- **Data Validation**: Built-in data integrity checks
- **Automatic Conversion**: Generates both Rial and Toman datasets
- **Resume Capability**: Only scrapes new data since last update

## Configuration

All settings can be customized in `config/settings.py`:

- Web scraping parameters (timeouts, delays, Chrome options)
- Dataset settings (Hugging Face repository, output filenames)
- Data processing settings (date formats, conversion rates)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This dataset is for educational purposes only. Exchange rates are sourced from public data and validation is recommended by the user.