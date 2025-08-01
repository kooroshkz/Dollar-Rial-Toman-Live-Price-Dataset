"""
Unit tests for Dollar-Rial-Toman Live Price Dataset Scraper

Author: Koorosh Komeili Zadeh  
Date: Aug 2025
"""

import sys
import unittest
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))


class TestImports(unittest.TestCase):
    """Test module imports"""
    
    def test_config_imports(self):
        """Test configuration module imports"""
        from config.settings import TGJU_URL, CHROME_OPTIONS
        self.assertIsInstance(TGJU_URL, str)
        self.assertIsInstance(CHROME_OPTIONS, list)
    
    def test_utils_imports(self):
        """Test utility module imports"""
        from src.utils.formatters import DateFormatter, DataValidator
        self.assertTrue(hasattr(DateFormatter, 'convert_date_format'))
        self.assertTrue(hasattr(DataValidator, 'is_valid_price'))
    
    def test_data_imports(self):
        """Test data module imports"""
        from src.data.dataset_manager import DatasetManager
        from src.data.processor import DataProcessor
        self.assertTrue(hasattr(DatasetManager, 'load_existing_dataset'))
        self.assertTrue(hasattr(DataProcessor, 'combine_and_save_data'))
    
    def test_scraper_imports(self):
        """Test scraper module imports"""
        from src.scraper.web_scraper import TGJUWebScraper
        self.assertTrue(hasattr(TGJUWebScraper, 'scrape_new_data'))


class TestDateFormatter(unittest.TestCase):
    """Test DateFormatter functionality"""
    
    def setUp(self):
        from src.utils.formatters import DateFormatter
        self.formatter = DateFormatter()
    
    def test_date_conversion(self):
        """Test date format conversion"""
        result = self.formatter.convert_date_format("2025/08/01")
        self.assertEqual(result, "01/08/2025")
    
    def test_date_normalization(self):
        """Test date format normalization"""
        result = self.formatter.normalize_date_format("8/1/2025")
        self.assertEqual(result, "01/08/2025")


class TestDataValidator(unittest.TestCase):
    """Test DataValidator functionality"""
    
    def setUp(self):
        from src.utils.formatters import DataValidator
        self.validator = DataValidator()
    
    def test_price_validation(self):
        """Test price validation"""
        self.assertTrue(self.validator.is_valid_price("123,456"))
        self.assertTrue(self.validator.is_valid_price('"789,012"'))
        self.assertFalse(self.validator.is_valid_price("invalid"))
    
    def test_scraping_stop_condition(self):
        """Test scraping stop condition"""
        from datetime import datetime
        from config.settings import DATE_FORMAT_INPUT
        
        last_date = datetime.strptime("2025/07/30", DATE_FORMAT_INPUT)
        
        # Should stop if row date is older than last existing date
        self.assertTrue(self.validator.should_stop_scraping("2025/07/29", last_date))
        
        # Should not stop if row date is newer
        self.assertFalse(self.validator.should_stop_scraping("2025/07/31", last_date))


class TestDatasetManager(unittest.TestCase):
    """Test DatasetManager functionality"""
    
    def setUp(self):
        from src.data.dataset_manager import DatasetManager
        self.manager = DatasetManager()
    
    def test_initialization(self):
        """Test manager initialization"""
        self.assertIsNone(self.manager.existing_data)
    
    def test_has_required_methods(self):
        """Test required methods exist"""
        required_methods = [
            'load_existing_dataset',
            'get_existing_data', 
            'get_last_existing_date',
            'get_dataset_info'
        ]
        for method in required_methods:
            self.assertTrue(hasattr(self.manager, method))


class TestDataProcessor(unittest.TestCase):
    """Test DataProcessor functionality"""
    
    def setUp(self):
        from src.data.processor import DataProcessor
        self.processor = DataProcessor()
    
    def test_initialization(self):
        """Test processor initialization"""
        self.assertIsNotNone(self.processor.date_formatter)
    
    def test_has_required_methods(self):
        """Test required methods exist"""
        required_methods = [
            'combine_and_save_data',
            'create_toman_dataset',
            'validate_data_integrity'
        ]
        for method in required_methods:
            self.assertTrue(hasattr(self.processor, method))


class TestWebScraper(unittest.TestCase):
    """Test TGJUWebScraper functionality"""
    
    def setUp(self):
        from src.scraper.web_scraper import TGJUWebScraper
        self.scraper = TGJUWebScraper()
    
    def test_initialization(self):
        """Test scraper initialization"""
        self.assertIsNotNone(self.scraper)
    
    def test_has_required_methods(self):
        """Test required methods exist"""
        required_methods = [
            'scrape_new_data',
            'get_scraped_data',
            'close'
        ]
        for method in required_methods:
            self.assertTrue(hasattr(self.scraper, method))


if __name__ == '__main__':
    unittest.main(verbosity=2)
