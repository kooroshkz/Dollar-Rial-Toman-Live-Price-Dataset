# Dollar-Rial-Toman Live Price Dataset

Daily updated dataset of US Dollar to Iranian Rial exchange rates (USD/IRR). Historical and live prices from November 2011 to present, handy for financial analysis, forecasting, and machine learning projects.

## Dataset Overview

- **Time Period**: November 27, 2011 - July 31, 2025
- **Total Records**: 3,900+ daily price points
- **Data Source**: TGJU.org (Tehran Gold & Jewelry Union)
- **Update Frequency**: Can be updated daily using the scraper
- **Format**: CSV with proper indexing and date formatting

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

### Load the Dataset

```python
import pandas as pd

# Load the dataset
df = pd.read_csv('Dollar_Rial_Price_Dataset.csv')
```
### Scrape Locally

Activate virtual environment:
```bash
source .venv/bin/activate  # Linux/Mac
venv\Scripts\activate  # Windows
```

Run the scraper to get the latest prices:
```bash
python dollar_rial_scraper.py
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This dataset is for educational purposes only. Exchange rates are sourced from public data and validation is recommended by the user.
