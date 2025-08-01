# Tests

This directory contains unit and integration tests for the Dollar-Rial-Toman Live Price Dataset Scraper.

## Running Tests

### Run all tests:
```bash
python test/run_tests.py
```

### Run specific test files:
```bash
python -m unittest test.test_modules
python -m unittest test.test_data_processing  
python -m unittest test.test_integration
```

## Test Structure

- `test_modules.py` - Basic module import and functionality tests
- `test_data_processing.py` - Data processing and validation tests
- `test_integration.py` - Integration tests for complete workflows
- `run_tests.py` - Test runner for all test suites

## Coverage

Tests cover:
- Module imports and basic functionality
- Date formatting and validation
- Data processing pipelines
- File structure and organization
- Integration workflows
