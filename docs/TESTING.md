# Testing Guide

## Overview

This project has comprehensive unit testing for both backend (Python/FastAPI) and frontend (React/TypeScript).

## Backend Testing (pytest)

### Structure

```
backend/tests/
├── __init__.py
├── conftest.py              # Pytest fixtures and configuration
├── test_auth.py             # Authentication endpoint tests
├── test_posts.py            # Posts endpoint tests
└── utils.py                 # Test utilities
```

### Running Tests

```bash
cd backend

# Install dependencies (first time)
pip install -r requirements-dev.txt

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_auth.py

# Run specific test class
pytest tests/test_auth.py::TestAuthRegistration

# Run specific test
pytest tests/test_auth.py::TestAuthRegistration::test_register_new_user

# Run with coverage
pytest --cov=app --cov-report=term-missing

# Generate HTML coverage report
pytest --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

### Writing Tests

**Example test:**

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
class TestMyFeature:
    async def test_something(self, client: AsyncClient):
        """Test description."""
        response = await client.get("/api/endpoint")

        assert response.status_code == 200
        assert response.json()["key"] == "expected_value"
```

**Using test utilities:**

```python
from tests.utils import create_test_user, get_auth_headers

async def test_authenticated_endpoint(client: AsyncClient):
    # Create and authenticate user
    user_data = await create_test_user(client)
    headers = await get_auth_headers(user_data["access_token"])

    # Make authenticated request
    response = await client.get("/api/protected", headers=headers)
    assert response.status_code == 200
```

### Test Database

Tests use an in-memory SQLite database for fast, isolated testing. The database is created fresh for each test and automatically cleaned up.

### Configuration

- **pytest.ini**: Pytest configuration
- **conftest.py**: Shared fixtures and test setup

## Frontend Testing (Vitest)

### Structure

```
frontend/tests/
├── setup.ts                 # Test setup and mocks
├── components/
│   └── ui/
│       └── button.test.tsx  # Component tests
└── lib/
    └── utils.test.ts        # Utility tests
```

### Running Tests

```bash
cd frontend

# Install dependencies (first time)
npm install

# Run tests in watch mode
npm run test

# Run tests once
npm run test -- --run

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- button.test.tsx

# Run tests matching pattern
npm run test -- --grep "Button"
```

### Writing Tests

**Component test example:**

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MyComponent } from "@/components/MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);

    const button = screen.getByRole("button");
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

**Utility test example:**

```typescript
import { describe, it, expect } from "vitest";
import { myUtilFunction } from "@/lib/utils";

describe("myUtilFunction", () => {
  it("returns expected value", () => {
    const result = myUtilFunction("input");
    expect(result).toBe("expected output");
  });
});
```

### Configuration

- **vitest.config.ts**: Vitest configuration
- **tests/setup.ts**: Global test setup and mocks

## CI/CD Integration

Tests run automatically on every push to feature branches and pull requests.

### GitHub Actions Workflow

The workflow includes:

1. **Backend Lint** - Flake8, Black, isort, MyPy
2. **Backend Test** - pytest with coverage
3. **Frontend Lint** - ESLint, TypeScript
4. **Frontend Test** - Vitest with coverage
5. **CI Summary** - Overall pass/fail status

### Viewing Results

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select the workflow run
4. View individual job logs

### Coverage Reports

Coverage reports are generated for both backend and frontend:

- **Backend**: `backend/htmlcov/index.html`
- **Frontend**: `frontend/coverage/index.html`

## Best Practices

### General

- ✅ Write tests for new features
- ✅ Test both success and failure cases
- ✅ Use descriptive test names
- ✅ Keep tests isolated and independent
- ✅ Mock external dependencies
- ✅ Aim for high coverage (>80%)

### Backend

- ✅ Use async/await for all tests
- ✅ Test API endpoints with different inputs
- ✅ Test authentication and authorization
- ✅ Test database operations
- ✅ Use fixtures for common setup

### Frontend

- ✅ Test user interactions
- ✅ Test component rendering
- ✅ Test edge cases and error states
- ✅ Use React Testing Library queries
- ✅ Avoid testing implementation details

## Troubleshooting

### Backend

**Tests fail with database errors:**

- Ensure `aiosqlite` is installed
- Check that `conftest.py` is properly configured

**Import errors:**

- Run tests from the `backend/` directory
- Ensure all dependencies are installed

### Frontend

**Module not found errors:**

- Run `npm install` to install dependencies
- Check that `vitest.config.ts` has correct path aliases

**Tests timeout:**

- Increase timeout in `vitest.config.ts`
- Check for infinite loops or missing awaits

## Quick Commands

### Backend

```bash
# Run all backend checks
cd backend && flake8 app/ && black --check app/ && isort --check-only app/ && pytest -v

# Auto-fix and test
cd backend && black app/ && isort app/ && pytest -v
```

### Frontend

```bash
# Run all frontend checks
cd frontend && npm run lint && npm run test -- --run

# Auto-fix and test
cd frontend && npm run lint -- --fix && npm run test -- --run
```

### Both

```bash
# Run everything from project root
(cd backend && pytest -v) && (cd frontend && npm run test -- --run)
```

## Coverage Goals

- **Backend**: Aim for >80% coverage
- **Frontend**: Aim for >70% coverage (UI components can be harder to test)

## Adding New Tests

1. Create test file in appropriate directory
2. Follow naming convention: `test_*.py` or `*.test.tsx`
3. Write tests following examples above
4. Run tests locally before committing
5. Ensure CI passes on GitHub
