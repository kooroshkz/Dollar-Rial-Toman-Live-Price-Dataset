# Agent Instructions for USD to IRR Scraper Project

## Project Overview
This is a modular Python web scraper that collects USD to IRR (Iranian Rial) exchange rates from tgju.org website. The project has been fully developed, tested, and refined through multiple iterations to meet specific requirements.

## Project Status: PRODUCTION READY
- Complete implementation with 3,648+ historical records capability
- Clean, professional code without emojis or Persian text
- Modular architecture following best practices
- Error handling and data validation
- Incremental data updates (no duplicates)
- Final CSV format: integer prices, descriptive filename

## Technical Architecture

### Dependencies
```
selenium==4.15.0
pandas==2.1.3
beautifulsoup4==4.12.2
webdriver-manager==4.0.1
```

### Project Structure
```
dollarScraper/
├── main.py                 # Entry point
├── requirements.txt        # Dependencies
├── README.md              # Documentation
├── data/                  # Output directory
│   └── Dollar_Rial_Price_Dataset.csv  # Final output file
└── src/                   # Source modules
    ├── config.py          # Configuration
    ├── scraper.py         # Main scraping logic
    ├── data_manager.py    # CSV operations
    └── utils.py           # Utility functions
```

## File Descriptions

### main.py
- **Purpose**: Entry point with professional terminal interface
- **Key Features**: Clean output, error handling, user instructions
- **Dependencies**: Imports all src modules
- **Run Command**: `python3 main.py`

### src/config.py
- **Purpose**: Centralized configuration management
- **Key Constants**:
  - `CSV_FILENAME = "Dollar_Rial_Price_Dataset.csv"`
  - Chrome WebDriver options (headless, user-agent, etc.)
  - CSS selectors for tgju.org
  - Column mapping: Persian → English translation
- **Chrome Config**: Specific settings provided by user for compatibility

### src/scraper.py
- **Purpose**: Main scraping engine with pagination
- **Key Features**:
  - Headless Chrome automation
  - Pagination handling (navigates through all pages)
  - Data extraction from table rows
  - Progress tracking with page numbers
  - Error handling for network issues
- **Data Flow**: Scrapes → Cleans → Returns structured data

### src/data_manager.py
- **Purpose**: CSV operations and data persistence
- **Key Features**:
  - Saves/loads CSV with proper encoding
  - Duplicate detection by date
  - Incremental updates (only new records)
  - Data validation before saving
- **Output Format**: CSV with English headers, integer prices

### src/utils.py
- **Purpose**: Utility functions for data processing
- **Key Functions**:
  - `clean_price_text()`: Converts "1,012,100" → 1012100 (integer)
  - `parse_date()`: Handles Persian date format
  - `validate_data()`: Ensures data quality
- **Important**: Returns integers, not floats for prices

## Data Format Specifications

### CSV Output
- **Filename**: `Dollar_Rial_Price_Dataset.csv`
- **Headers**: Date,Buy_Price,Sell_Price,Low_Price,High_Price
- **Price Format**: Integers (e.g., 1012100, not 1012100.0)
- **Date Format**: YYYY/MM/DD
- **Encoding**: UTF-8

### Sample Data
```csv
Date,Buy_Price,Sell_Price,Low_Price,High_Price
2024/12/15,1012100,1011700,1034100,1029800
2024/12/14,1015200,1014800,1037200,1032900
```

## Development History & Requirements

### Original Requirements
1. Modular Python project structure
2. Scrape USD to IRR from tgju.org
3. Handle pagination (multiple pages)
4. Save to CSV format
5. Incremental updates (no duplicates)

### Code Cleanup Phase
1. Remove all emojis from code and documentation
2. Remove Persian words from CSV and code
3. Professional, clean presentation

### Final Format Adjustments
1. Rename CSV to "Dollar_Rial_Price_Dataset.csv"
2. Store prices as integers (no decimal points)
3. Update all documentation references

## Running the Project

### First Time Setup
```bash
pip install -r requirements.txt
python3 main.py
```

### Expected Behavior
1. Creates `data/` directory if not exists
2. Loads existing CSV (if any) to check for duplicates
3. Scrapes all pages from tgju.org
4. Shows progress: "Scraping page X..."
5. Saves only new records to CSV
6. Displays summary of new records added

### Sample Output
```
Starting USD to IRR scraper...
Loading existing data from: data/Dollar_Rial_Price_Dataset.csv
Found 150 existing records
Scraping page 1...
Scraping page 2...
...
Scraping completed successfully!
Added 25 new records to the dataset
Total records in dataset: 175
Data saved to: data/Dollar_Rial_Price_Dataset.csv
```

## Troubleshooting Guide

### Common Issues
1. **Chrome Driver Issues**: Uses webdriver-manager for automatic updates
2. **Network Timeouts**: Implemented retry logic and error handling
3. **Data Validation**: Validates prices and dates before saving
4. **Encoding Issues**: Uses UTF-8 consistently

### Debug Mode
- Check Chrome options in config.py
- Verify CSS selectors if website changes
- Monitor terminal output for error messages

## Code Quality Standards

### Followed Best Practices
- Modular design with separation of concerns
- Comprehensive error handling
- Input validation and data cleaning
- No hardcoded values (everything in config)
- Clean, readable code without emojis
- Professional documentation

### Testing Approach
- Manual testing with sample data
- Verification against actual website data
- Format validation for integer prices
- Duplicate detection testing

## Website-Specific Details

### Target Site: tgju.org
- **URL Pattern**: Uses pagination parameters
- **Data Location**: Table rows with specific CSS classes
- **Rate Limiting**: Respectful scraping with delays
- **Data Format**: Persian numbers and dates (converted to English)

### CSS Selectors (in config.py)
```python
SELECTORS = {
    'table_row': 'tr.odd, tr.even',
    'date_cell': 'td:nth-child(1)',
    'buy_price': 'td:nth-child(2)',
    'sell_price': 'td:nth-child(3)',
    'low_price': 'td:nth-child(4)',
    'high_price': 'td:nth-child(5)'
}
```

## Future Maintenance

### If Website Changes
1. Update CSS selectors in config.py
2. Test data extraction logic
3. Verify date/price parsing functions

### Adding Features
- Extend data_manager.py for new output formats
- Add new utility functions to utils.py
- Update config.py for new parameters

### Performance Optimization
- Current setup handles 3,648+ records efficiently
- Uses incremental updates to avoid re-scraping
- Memory-efficient pandas operations

## Agent Handoff Checklist

When taking over this project:
1. Understand the modular architecture
2. Review data format requirements (integers, specific filename)
3. Test the scraper with `python3 main.py`
4. Verify CSV output format matches specifications
5. Check that prices are integers, not floats
6. Ensure no emojis or Persian text in output
7. Understand incremental update logic

## Critical Notes

### DO NOT CHANGE
- CSV filename: Must remain "Dollar_Rial_Price_Dataset.csv"
- Price format: Must be integers (1012100, not 1012100.0)
- Column headers: English names as specified
- Chrome configuration: Tested and working settings

### SAFE TO MODIFY
- Add new utility functions
- Extend error handling
- Add new output formats (while keeping CSV)
- Optimize performance
- Add logging features

## Success Metrics
- Project successfully scrapes all available historical data
- CSV format matches exact specifications
- No code contains emojis or Persian text
- Incremental updates work correctly
- Professional terminal output

This instruction file contains all the knowledge and context needed to understand and maintain this USD to IRR scraper project. The code is production-ready and follows all specified requirements.
