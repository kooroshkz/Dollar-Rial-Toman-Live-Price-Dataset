# Dollar-Rial-Toman Live Price Dataset

A comprehensive, daily-updated dataset of US Dollar to Iranian Rial exchange rates (USD/IRR) with historical data from November 2011 to present. This dataset is ideal for financial analysis, economic research, forecasting, and machine learning projects.

## Dataset Overview

- **Time Period**: November 27, 2011 - Present (continuously updated)
- **Total Records**: 3,900+ daily price points
- **Data Source**: TGJU.org (Tehran Gold & Jewelry Union)
- **Update Frequency**: Daily (automated via GitHub Actions)
- **Format**: CSV with proper date formatting and price structure
- **Currencies**: Both Iranian Rial (IRR) and Toman datasets available

## Data Files

### Dollar_Rial_Price_Dataset.csv
Contains exchange rates in Iranian Rials (official currency)

### Dollar_Toman_Price_Dataset.csv  
Contains exchange rates in Iranian Tomans (1 Toman = 10 Rials)

## Data Structure

Each CSV file contains the following columns:

| Column | Description | Format | Example |
|--------|-------------|--------|---------|
| Date | Gregorian date | DD/MM/YYYY | "31/07/2025" |
| Persian_Date | Persian/Shamsi date | YYYY/MM/DD | "1404/05/09" |
| Open | Opening price | Formatted number | "896,100" |
| Low | Lowest price of the day | Formatted number | "895,700" |
| High | Highest price of the day | Formatted number | "908,850" |
| Close | Closing price | Formatted number | "905,600" |

## Using the Dataset

### Download the Data
You can access the dataset files directly from the `/data/` directory:
- [Dollar_Rial_Price_Dataset.csv](data/Dollar_Rial_Price_Dataset.csv)
- [Dollar_Toman_Price_Dataset.csv](data/Dollar_Toman_Price_Dataset.csv)

### Loading in Python
```python
import pandas as pd

# Load Rial dataset
rial_df = pd.read_csv('data/Dollar_Rial_Price_Dataset.csv')

# Load Toman dataset  
toman_df = pd.read_csv('data/Dollar_Toman_Price_Dataset.csv')

# Convert date column to datetime
rial_df['Date'] = pd.to_datetime(rial_df['Date'], format='%d/%m/%Y')

# Remove commas from price columns and convert to numeric
price_columns = ['Open', 'Low', 'High', 'Close']
for col in price_columns:
    rial_df[col] = pd.to_numeric(rial_df[col].str.replace(',', ''))
```

### Loading in R
```r
# Load Rial dataset
rial_data <- read.csv("data/Dollar_Rial_Price_Dataset.csv", stringsAsFactors = FALSE)

# Load Toman dataset
toman_data <- read.csv("data/Dollar_Toman_Price_Dataset.csv", stringsAsFactors = FALSE)

# Convert date column
rial_data$Date <- as.Date(rial_data$Date, format = "%d/%m/%Y")
```

## Data Quality & Updates

- **Validation**: All price data undergoes validation checks for accuracy
- **Automated Updates**: Dataset is automatically updated daily at 8:00 AM UTC
- **Data Integrity**: Built-in duplicate prevention and format validation
- **Historical Consistency**: Maintains consistent formatting across all time periods

## Technical Implementation

This dataset is maintained using an automated web scraping system that:

- Monitors TGJU.org for new exchange rate data
- Validates and processes new records
- Maintains data consistency and prevents duplicates
- Automatically commits updates to the repository

### Automation Details
- **Platform**: GitHub Actions
- **Schedule**: Daily at 8:00 AM UTC
- **Browser**: Chrome with Selenium WebDriver
- **Reliability**: Comprehensive error handling and retry logic

## Research Applications

This dataset is suitable for:

- **Financial Analysis**: Track USD/IRR exchange rate trends and volatility
- **Economic Research**: Study the impact of economic events on currency values  
- **Machine Learning**: Build predictive models for exchange rate forecasting
- **Time Series Analysis**: Analyze patterns and seasonal trends
- **Academic Projects**: Research on emerging market currencies

## Data Formats

### CSV Format
- **Encoding**: UTF-8
- **Delimiter**: Comma (,)
- **Quotes**: Double quotes for all fields
- **Numbers**: Formatted with commas as thousand separators

### Date Formats
- **Gregorian**: DD/MM/YYYY (e.g., 31/07/2025)
- **Persian**: YYYY/MM/DD (e.g., 1404/05/09)

## Contributing

If you find data inconsistencies or have suggestions for improvements, please open an issue in the GitHub repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Citation

If you use this dataset in your research or projects, please cite:

```
Dollar-Rial-Toman Live Price Dataset
Author: Koorosh Komeili Zadeh
Source: https://github.com/kooroshkz/Dollar-Rial-Toman-Live-Price-Dataset
Data Source: TGJU.org (Tehran Gold & Jewelry Union)
```

## Disclaimer

This dataset is provided for educational and research purposes only. Exchange rates are sourced from publicly available data and should be independently verified for trading or investment decisions. The authors are not responsible for any financial losses resulting from the use of this data.