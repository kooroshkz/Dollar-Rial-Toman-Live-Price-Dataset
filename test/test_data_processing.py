"""
Data processing tests for Dollar-Rial-Toman Live Price Dataset Scraper

Author: Koorosh Komeili Zadeh
Date: Aug 2025
"""

import sys
import unittest
import pandas as pd
import tempfile
import os
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.data.processor import DataProcessor
from src.utils.formatters import DateFormatter, DataValidator


class TestDataProcessing(unittest.TestCase):
    """Test data processing functionality"""
    
    def setUp(self):
        self.processor = DataProcessor()
        self.temp_dir = tempfile.mkdtemp()
    
    def tearDown(self):
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_toman_conversion(self):
        """Test Rial to Toman conversion"""
        test_data = {
            'Date': ['01/08/2025'],
            'Persian_Date': ['1404/05/10'],
            'Open': ['"500,000"'],  # String format like in CSV
            'Low': ['"490,000"'],
            'High': ['"510,000"'],
            'Close': ['"505,000"']
        }
        df = pd.DataFrame(test_data)
        
        temp_file = os.path.join(self.temp_dir, 'test_toman.csv')
        result = self.processor.create_toman_dataset(df, temp_file)
        
        self.assertTrue(result)
        self.assertTrue(os.path.exists(temp_file))
        
        # Read and verify conversion
        toman_df = pd.read_csv(temp_file)
        # Check that values are divided by 10 (converted to Toman)
        # Values are stored as strings with commas (no quotes in CSV output)
        self.assertEqual(toman_df['Open'].iloc[0], '50,000')  # 500000 / 10, formatted
    
    def test_data_validation(self):
        """Test data integrity validation"""
        valid_data = {
            'Date': ['01/08/2025', '02/08/2025'],
            'Persian_Date': ['1404/05/10', '1404/05/11'],
            'Open': [500000, 505000],
            'Low': [490000, 495000],
            'High': [510000, 515000],
            'Close': [505000, 510000]
        }
        df = pd.DataFrame(valid_data)
        
        self.assertTrue(self.processor.validate_data_integrity(df))
    
    def test_empty_data_handling(self):
        """Test handling of empty datasets"""
        empty_df = pd.DataFrame()
        result = self.processor.validate_data_integrity(empty_df)
        self.assertFalse(result)


class TestDateFormatterAdvanced(unittest.TestCase):
    """Advanced tests for DateFormatter"""
    
    def setUp(self):
        self.formatter = DateFormatter()
    
    def test_edge_cases(self):
        """Test date formatter edge cases"""
        test_cases = [
            ("2025/01/01", "01/01/2025"),
            ("2025/12/31", "31/12/2025"),
        ]
        
        for input_date, expected in test_cases:
            result = self.formatter.convert_date_format(input_date)
            self.assertEqual(result, expected)
    
    def test_invalid_date_handling(self):
        """Test handling of invalid dates"""
        # The formatter handles invalid dates gracefully by returning original string
        result = self.formatter.convert_date_format("invalid/date/format")
        self.assertEqual(result, "invalid/date/format")


class TestDataValidatorAdvanced(unittest.TestCase):
    """Advanced tests for DataValidator"""
    
    def setUp(self):
        self.validator = DataValidator()
    
    def test_price_formats(self):
        """Test various price formats"""
        valid_prices = [
            "123,456",
            '"789,012"',
            "1,000,000",
            '"500,000"'
        ]
        
        for price in valid_prices:
            self.assertTrue(self.validator.is_valid_price(price), f"Failed for: {price}")
    
    def test_invalid_prices(self):
        """Test invalid price formats"""
        invalid_prices = [
            "abc",
            "",
            "12.34.56",
            "not-a-number"
        ]
        
        for price in invalid_prices:
            self.assertFalse(self.validator.is_valid_price(price), f"Should fail for: {price}")


if __name__ == '__main__':
    unittest.main(verbosity=2)
