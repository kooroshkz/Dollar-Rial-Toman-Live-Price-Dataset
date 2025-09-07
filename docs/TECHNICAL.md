# Technical Documentation

This document provides technical details for developers who want to understand the implementation, contribute to the project, or run the scraping scripts locally.

## Project Architecture

### Directory Structure
```
Dollar-Rial-Toman-Live-Price-Dataset/
├── main.py                     # Main orchestrator script
├── requirements.txt           # Python dependencies
├── config/                    # Configuration settings
│   ├── __init__.py
│   └── settings.py           # All configuration constants
├── src/                      # Source code modules
│   ├── data/                 # Data processing modules
│   │   ├── dataset_manager.py  # Dataset handling
│   │   └── processor.py        # CSV operations
│   ├── scraper/              # Web scraping modules
│   │   └── web_scraper.py      # TGJU.org scraping logic
│   └── utils/                # Utility functions
│       └── formatters.py       # Date formatting and validation
├── scripts/                  # Update scripts
│   ├── daily_update.py        # Automated daily updates
│   └── manual_update.py       # Manual update with options
├── data/                     # Output CSV files
│   ├── Dollar_Rial_Price_Dataset.csv
│   └── Dollar_Toman_Price_Dataset.csv
├── test/                     # Test suites
│   ├── test_daily_update.py   # Test daily update functionality
│   ├── test_modules.py        # Unit tests for modules
│   ├── test_data_processing.py # Data processing tests
│   ├── test_integration.py    # Integration tests
│   └── run_tests.py           # Test runner
└── .github/workflows/        # GitHub Actions
    └── daily-update.yml       # Automated daily update workflow
```

## Update Scripts

### 1. `scripts/daily_update.py` - Automated Daily Updates

**Purpose**: Lightweight script designed to run daily via GitHub Actions to check for new records.

**Features**:
- Checks only the first page of TGJU.org (last 3 records)
- Compares with the end of existing CSV files
- Adds new records to both Rial and Toman datasets
- Optimized for automated execution

**Usage**:
```bash
python scripts/daily_update.py
```

### 2. `scripts/manual_update.py` - Manual Updates with Options

**Purpose**: Provides more control for manual updates with various options.

**Features**:
- Check more records from the website (default: 10)
- Dry-run mode to preview changes
- Interactive confirmation before making changes
- Quick mode for fast updates

**Usage**:
```bash
# Basic manual update (check 10 records)
python scripts/manual_update.py

# Check more records
python scripts/manual_update.py --records 20

# Dry run to see what would be updated
python scripts/manual_update.py --dry-run

# Quick update (same as daily update)
python scripts/manual_update.py --quick

# Combine options
python scripts/manual_update.py --records 15 --dry-run
```

**Arguments**:
- `--records, -r`: Number of records to check from website (default: 10)
- `--dry-run, -d`: Show what would be updated without making changes
- `--quick, -q`: Quick update - check only 3 records

### 3. `test/test_daily_update.py` - Test Script

**Purpose**: Test the daily update functionality without modifying actual CSV files.

**Features**:
- Creates temporary copies of CSV files
- Tests all update components
- Validates Toman conversion
- No risk to actual data

**Usage**:
```bash
python test/test_daily_update.py
```

## Development Setup

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

### Dependencies

Key dependencies:
- `selenium` - Web scraping
- `webdriver-manager` - Chrome driver management  
- `pandas` - Data processing
- `requests` - HTTP requests

## GitHub Actions Workflow

The `.github/workflows/daily-update.yml` file sets up automatic daily updates:

- **Schedule**: Runs every day at 8:00 AM UTC
- **Manual Trigger**: Can be manually triggered from GitHub Actions tab
- **Environment**: Ubuntu with Chrome browser and Python 3.11
- **Auto-commit**: Automatically commits and pushes changes if new records are found

### Workflow Features:
- Installs Chrome browser for web scraping
- Sets up Python environment and dependencies
- Runs the daily update script
- Commits changes only if new records are found
- Creates a summary of the update

## How It Works

### Data Flow:
1. **Website Scraping**: Connect to TGJU.org and extract latest records
2. **Comparison**: Compare website records with last records in CSV
3. **New Record Detection**: Identify records that exist on website but not in CSV
4. **Rial Update**: Add new records to Rial dataset
5. **Toman Conversion**: Convert Rial prices to Toman (÷10) and update Toman dataset

### Data Validation:
- **Date Validation**: Rejects invalid or future dates
- **Price Validation**: Ensures price data is properly formatted
- **Duplicate Prevention**: Checks for existing records before adding

### File Format:
Both CSV files maintain the same structure:
```csv
"Date","Persian_Date","Open","Low","High","Close"
"31/07/2025","1404/05/09","896,100","895,700","908,850","905,600"
```

## Error Handling

All scripts include comprehensive error handling:
- Browser connection failures
- Network timeouts
- Data parsing errors
- File I/O errors
- Invalid date formats

## Testing

### Local Testing:
```bash
# Test before deploying
python test/test_daily_update.py

# Manual dry run
python scripts/manual_update.py --dry-run

# Run all tests
python test/run_tests.py
```

## Monitoring

### GitHub Actions:
- Check the Actions tab in your GitHub repository
- View workflow run logs and summaries
- Monitor for failures and alerts

## Customization

### Update Frequency:
Edit `.github/workflows/daily-update.yml` to change the schedule:
```yaml
schedule:
  - cron: '0 8 * * *'  # 8:00 AM UTC daily
  - cron: '0 */6 * * *'  # Every 6 hours
```

### Records to Check:
Modify `scripts/daily_update.py` to check more records:
```python
website_records = scraper.get_latest_records(count=5)  # Check 5 instead of 3
```

### Time Zone:
The workflow runs in UTC. Adjust the cron schedule according to your preferred local time.

## Configuration

All settings can be customized in `config/settings.py`:

- Web scraping parameters (timeouts, delays, Chrome options)
- Dataset settings (output filenames, paths)
- Data processing settings (date formats, conversion rates)

## Troubleshooting

### Common Issues:

1. **Chrome Driver Issues**:
   - GitHub Actions automatically installs Chrome
   - For local testing, ensure Chrome browser is installed

2. **Network Timeouts**:
   - Scripts include retry logic and timeouts
   - Check TGJU.org website availability

3. **Date Format Issues**:
   - Scripts validate dates before processing
   - Invalid dates are automatically filtered out

4. **CSV Format**:
   - Files use double-quoted format for Excel compatibility
   - Prices include commas as thousand separators

### Debug Mode:
Add verbose logging by modifying the scripts to include more print statements or by running the test script to verify functionality.

## Security

- GitHub Actions uses `GITHUB_TOKEN` for repository access
- No sensitive data is stored in the scripts
- All web scraping respects the website's structure and timing

## Contributing

When modifying the update scripts:
1. Test with `test/test_daily_update.py` first
2. Use `scripts/manual_update.py --dry-run` to preview changes
3. Verify both Rial and Toman datasets are updated correctly
4. Check that date formats remain consistent
5. Run the full test suite before submitting changes

### Code Style
- Follow PEP 8 guidelines
- Include docstrings for all functions and classes
- Add type hints where appropriate
- Maintain comprehensive error handling