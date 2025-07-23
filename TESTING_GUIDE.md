# Testing Guide for Agricultural Super App

This guide provides instructions for setting up and running tests for the Agricultural Super App.

## Prerequisites

- Python 3.x
- PostgreSQL database
- Virtual environment (recommended)

## Setting Up the Environment

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure databases**:
   - Make sure you have PostgreSQL databases for development and testing
   - Update the `.env` file with your database credentials:
     ```
     DATABASE_URL=postgresql://username:password@localhost:5432/agri_app_dev
     TEST_DATABASE_URL=postgresql://username:password@localhost:5432/agri_app_test
     ```

3. **Reset the development database** (if needed):
   ```bash
   python reset_dev_db.py
   ```
   This script will drop all tables and recreate them with a clean schema.

4. **Reset the test database** (if needed):
   ```bash
   python reset_test_db.py
   ```
   This script will drop all tables and recreate them with a clean schema.

## Running Tests

### Run all tests:
```bash
pytest server/tests/
```

### Run a specific test file:
```bash
pytest server/tests/test_auth.py
```

### Run a specific test:
```bash
pytest server/tests/test_auth.py::test_register_user
```

### Run tests with verbose output:
```bash
pytest server/tests/ -v
```

## Troubleshooting Common Test Issues

### 1. Database Connection Issues
If tests fail due to database connection issues:
- Verify your database credentials in the `.env` file
- Check if the test database exists
- Test the connection using:
  ```bash
  python test_db_connection.py testing
  ```

### 2. Unique Constraint Violations
If tests fail with unique constraint violations:
- Reset the test database:
  ```bash
  python reset_test_db.py
  ```

### 3. Missing Tables or Schema Issues
If tests fail due to missing tables:
- Initialize the test database:
  ```bash
  python init_test_db.py
  ```

### 4. JWT Token Issues
If authentication tests fail:
- Check that the JWT_SECRET_KEY is properly set in your `.env` file
- Verify that the token generation and validation logic is working correctly

## Writing New Tests

When writing new tests:
1. Create test functions in the appropriate test file
2. Use the fixtures provided in `conftest.py` for common setup
3. Follow the existing test patterns for consistency
4. Make sure to clean up any test data created during the test

## Continuous Integration

The tests are automatically run in the CI/CD pipeline when code is pushed to the repository. Make sure all tests pass locally before pushing changes.