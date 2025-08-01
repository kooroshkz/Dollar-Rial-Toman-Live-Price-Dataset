"""
Test runner for Dollar-Rial-Toman Live Price Dataset Scraper

Author: Koorosh Komeili Zadeh
Date: Aug 2025
"""

import sys
import unittest
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))


def run_all_tests():
    """Run all test suites"""
    
    # Import test modules directly
    from test_modules import TestImports, TestDateFormatter, TestDataValidator, TestDatasetManager, TestDataProcessor, TestWebScraper
    from test_data_processing import TestDataProcessing, TestDateFormatterAdvanced, TestDataValidatorAdvanced
    from test_integration import TestIntegration, TestFileStructure
    
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add all test classes
    test_classes = [
        TestImports, TestDateFormatter, TestDataValidator, 
        TestDatasetManager, TestDataProcessor, TestWebScraper,
        TestDataProcessing, TestDateFormatterAdvanced, TestDataValidatorAdvanced,
        TestIntegration, TestFileStructure
    ]
    
    for test_class in test_classes:
        tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
        test_suite.addTests(tests)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Print summary
    print(f"\nTest Summary:")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.failures:
        print("\nFailures:")
        for test, traceback in result.failures:
            print(f"- {test}: {traceback}")
    
    if result.errors:
        print("\nErrors:")
        for test, traceback in result.errors:
            print(f"- {test}: {traceback}")
    
    success = len(result.failures) == 0 and len(result.errors) == 0
    print(f"\nResult: {'PASSED' if success else 'FAILED'}")
    
    return success


def main():
    """Main entry point"""
    print("Dollar-Rial-Toman Dataset Scraper - Test Suite")
    print("=" * 50)
    
    success = run_all_tests()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
