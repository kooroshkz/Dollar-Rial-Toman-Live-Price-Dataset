import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def test_imports():
    """Test that all modules can be imported successfully"""
    try:
        print("Testing imports...")
        
        # Test configuration
        from config.settings import TGJU_URL, CHROME_OPTIONS
        print("✓ Configuration imported successfully")
        
        # Test utilities
        from src.utils.formatters import DateFormatter, DataValidator
        print("✓ Utilities imported successfully")
        
        # Test data modules
        from src.data.dataset_manager import DatasetManager
        from src.data.processor import DataProcessor
        print("✓ Data modules imported successfully")
        
        # Test scraper
        from src.scraper.web_scraper import TGJUWebScraper
        print("✓ Scraper imported successfully")
        
        return True
        
    except ImportError as e:
        print(f"✗ Import failed: {str(e)}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {str(e)}")
        return False

def test_basic_functionality():
    """Test basic functionality of key components"""
    try:
        print("\nTesting basic functionality...")
        
        # Test date formatter
        from src.utils.formatters import DateFormatter
        formatter = DateFormatter()
        
        test_date = "2025/08/01"
        converted = formatter.convert_date_format(test_date)
        assert converted == "01/08/2025", f"Expected '01/08/2025', got '{converted}'"
        print("✓ Date formatter working correctly")
        
        # Test data validator
        from src.utils.formatters import DataValidator
        validator = DataValidator()
        
        assert validator.is_valid_price("123,456"), "Price validation failed"
        assert validator.is_valid_price('"789,012"'), "Quoted price validation failed"
        print("✓ Data validator working correctly")
        
        # Test dataset manager initialization
        from src.data.dataset_manager import DatasetManager
        dataset_manager = DatasetManager()
        assert dataset_manager.existing_data is None, "Dataset manager initialization failed"
        print("✓ Dataset manager initialized correctly")
        
        # Test data processor initialization
        from src.data.processor import DataProcessor
        processor = DataProcessor()
        assert processor.date_formatter is not None, "Data processor initialization failed"
        print("✓ Data processor initialized correctly")
        
        return True
        
    except AssertionError as e:
        print(f"✗ Assertion failed: {str(e)}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error during testing: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("Dollar-Rial-Toman Scraper - Module Tests")
    print("=" * 45)
    
    # Test imports
    import_success = test_imports()
    
    if not import_success:
        print("\nERROR: Import tests failed. Please check your module structure.")
        return False
    
    # Test basic functionality
    functionality_success = test_basic_functionality()
    
    if not functionality_success:
        print("\nERROR: Functionality tests failed.")
        return False

    print("\nSUCCESS: All tests passed! The modular structure is working correctly.")
    print("\nYou can now run the main scraper with:")
    print("python main.py")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
