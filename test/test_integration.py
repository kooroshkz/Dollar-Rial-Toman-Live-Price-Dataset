"""
Integration tests for Dollar-Rial-Toman Live Price Dataset Scraper

Author: Koorosh Komeili Zadeh
Date: Aug 2025
"""

import sys
import unittest
import tempfile
import os
import pandas as pd
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.data.dataset_manager import DatasetManager
from src.data.processor import DataProcessor
from config.settings import OUTPUT_COLUMNS


class TestIntegration(unittest.TestCase):
    """Integration tests for the complete pipeline"""
    
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.dataset_manager = DatasetManager()
        self.processor = DataProcessor()
    
    def tearDown(self):
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_complete_data_pipeline(self):
        """Test complete data processing pipeline"""
        # Create test data
        test_existing_data = pd.DataFrame({
            'Date': ['30/07/2025'],
            'Persian_Date': ['1404/05/08'],
            'Open': ['"480,000"'],  # String format like in CSV
            'Low': ['"475,000"'],
            'High': ['"485,000"'],
            'Close': ['"482,000"']
        })
        
        test_scraped_data = [
            {
                'date_gregorian': '2025/07/31',
                'date_persian': '1404/05/09',
                'opening': '485,000',
                'lowest': '480,000',
                'highest': '490,000',
                'closing': '487,000'
            }
        ]
        
        # Test file paths
        rial_file = os.path.join(self.temp_dir, 'test_rial.csv')
        toman_file = os.path.join(self.temp_dir, 'test_toman.csv')
        
        # Process data
        result_df = self.processor.combine_and_save_data(
            test_existing_data,
            test_scraped_data,
            rial_file
        )
        
        # Verify Rial data
        self.assertIsNotNone(result_df)
        self.assertEqual(len(result_df), 2)
        self.assertTrue(os.path.exists(rial_file))
        
        # Create Toman dataset
        toman_success = self.processor.create_toman_dataset(result_df, toman_file)
        self.assertTrue(toman_success)
        self.assertTrue(os.path.exists(toman_file))
        
        # Validate data integrity
        validation_success = self.processor.validate_data_integrity(result_df)
        self.assertTrue(validation_success)
    
    def test_dataset_manager_workflow(self):
        """Test DatasetManager workflow"""
        # Test initialization
        self.assertIsNone(self.dataset_manager.existing_data)
        
        # Test methods exist and can be called
        self.assertTrue(hasattr(self.dataset_manager, 'load_existing_dataset'))
        self.assertTrue(hasattr(self.dataset_manager, 'get_existing_data'))
        self.assertTrue(hasattr(self.dataset_manager, 'get_last_existing_date'))
        self.assertTrue(hasattr(self.dataset_manager, 'get_dataset_info'))


class TestFileStructure(unittest.TestCase):
    """Test file structure and organization"""
    
    def test_required_directories(self):
        """Test that required directories exist"""
        project_root = Path(__file__).parent.parent
        
        required_dirs = [
            'config',
            'src',
            'src/data',
            'src/scraper', 
            'src/utils',
            'data',
            'test'
        ]
        
        for dir_name in required_dirs:
            dir_path = project_root / dir_name
            self.assertTrue(dir_path.exists(), f"Directory {dir_name} should exist")
    
    def test_config_accessibility(self):
        """Test configuration file accessibility"""
        from config.settings import (
            DEFAULT_RIAL_OUTPUT, 
            DEFAULT_TOMAN_OUTPUT,
            OUTPUT_COLUMNS
        )
        
        # Check that data paths point to data directory
        self.assertTrue(DEFAULT_RIAL_OUTPUT.startswith('data/'))
        self.assertTrue(DEFAULT_TOMAN_OUTPUT.startswith('data/'))
        
        # Check output columns are defined
        self.assertIsInstance(OUTPUT_COLUMNS, list)
        self.assertGreater(len(OUTPUT_COLUMNS), 0)


if __name__ == '__main__':
    unittest.main(verbosity=2)
