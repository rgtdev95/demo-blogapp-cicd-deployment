# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions for continuous integration and deployment. The pipeline is designed to ensure code quality and consistency across both frontend and backend components.

## Feature Branch Workflow

### Trigger Conditions

The feature branch workflow (`.github/workflows/feature.yml`) runs automatically when:
- Pushing to branches matching `feature/**` or `feat/**`
- Creating pull requests targeting `main` or `develop` branches

### Jobs

#### 1. Frontend Linting (`frontend-lint`)

**Purpose**: Ensures frontend code quality and consistency

**Checks performed**:
- ✅ **ESLint**: Lints TypeScript/React code for common errors and style issues
- ✅ **TypeScript**: Type checking to catch type-related bugs

**Tools used**:
- ESLint with React and TypeScript plugins
- TypeScript compiler (`tsc`)

**Configuration files**:
- `frontend/eslint.config.js` - ESLint rules
- `frontend/tsconfig.json` - TypeScript configuration

#### 2. Backend Linting (`backend-lint`)

**Purpose**: Ensures backend code quality, formatting, and type safety

**Checks performed**:
- ✅ **Flake8**: Python linting for syntax errors and code quality
- ✅ **Black**: Code formatting verification
- ✅ **isort**: Import statement sorting verification
- ✅ **MyPy**: Static type checking (non-blocking)

**Tools used**:
- Flake8 (PEP 8 compliance)
- Black (code formatter)
- isort (import sorter)
- MyPy (type checker)

**Configuration files**:
- `backend/.flake8` - Flake8 configuration
- `backend/pyproject.toml` - Black, isort, and MyPy configuration

#### 3. CI Summary (`ci-summary`)

**Purpose**: Provides a summary of all checks and fails the workflow if any check fails

## Local Development Setup

### Frontend Linting

```bash
cd frontend

# Install dependencies
npm install

# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Type check
npx tsc --noEmit
```

### Backend Linting

```bash
cd backend

# Create virtual environment (if not exists)
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dev dependencies
pip install -r requirements-dev.txt

# Run all checks
flake8 app/
black --check app/
isort --check-only app/
mypy app/ --ignore-missing-imports

# Auto-fix formatting
black app/
isort app/
```

## Pre-commit Setup (Recommended)

To catch issues before committing, you can set up pre-commit hooks:

### Option 1: Using pre-commit framework

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

### Option 2: Manual git hooks

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

echo "Running frontend linting..."
cd frontend && npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Frontend linting failed"
    exit 1
fi

echo "Running backend linting..."
cd ../backend
source .venv/bin/activate
flake8 app/
if [ $? -ne 0 ]; then
    echo "❌ Backend linting failed"
    exit 1
fi

black --check app/
if [ $? -ne 0 ]; then
    echo "❌ Backend formatting check failed"
    exit 1
fi

echo "✅ All checks passed"
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

## Linting Configuration Details

### Frontend ESLint Rules

The frontend uses:
- **@eslint/js** - Core ESLint rules
- **typescript-eslint** - TypeScript-specific rules
- **eslint-plugin-react-hooks** - React Hooks rules
- **eslint-plugin-react-refresh** - React Fast Refresh rules

Key settings:
- Ignores `dist/` directory
- Targets ES2020
- Disabled unused vars warning for TypeScript

### Backend Linting Rules

#### Flake8
- Max line length: 127 characters
- Max complexity: 10
- Ignores:
  - E203 (whitespace before ':')
  - E501 (line too long - handled by Black)
  - W503 (line break before binary operator)

#### Black
- Line length: 127 characters
- Target: Python 3.10+
- Compatible with Flake8

#### isort
- Profile: Black (compatible with Black formatting)
- Line length: 127 characters
- Skips: `.venv`, `__pycache__`, `migrations`

#### MyPy
- Python version: 3.10
- Ignores missing imports (for third-party libraries)
- Non-strict mode (allows untyped functions)

## Troubleshooting

### Frontend Issues

**ESLint errors on valid code:**
- Check `eslint.config.js` for rule overrides
- Update ESLint: `npm update eslint`

**TypeScript errors:**
- Ensure `tsconfig.json` is properly configured
- Run `npm install` to update type definitions

### Backend Issues

**Flake8 and Black conflicts:**
- Both tools are configured to work together
- Black takes precedence for formatting
- Run `black app/` to auto-fix

**Import order issues:**
- Run `isort app/` to auto-fix
- isort is configured to be compatible with Black

**MyPy errors:**
- MyPy is set to non-blocking in CI
- Add type hints gradually
- Use `# type: ignore` for unavoidable issues

## CI/CD Best Practices

1. **Always run linting locally** before pushing
2. **Fix issues before creating PR** - don't rely on CI to catch everything
3. **Use auto-formatters** - Black and ESLint can fix most issues automatically
4. **Keep dependencies updated** - regularly update linting tools
5. **Review CI logs** - understand why checks fail

## Future Enhancements

Potential additions to the pipeline:

- [ ] Unit tests (frontend and backend)
- [ ] Integration tests
- [ ] Code coverage reporting
- [ ] Security scanning (Snyk, Dependabot)
- [ ] Build verification
- [ ] Docker image building
- [ ] Deployment to staging environment
- [ ] Performance testing
- [ ] Accessibility testing (frontend)

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Flake8 Documentation](https://flake8.pycqa.org/)
- [Black Documentation](https://black.readthedocs.io/)
- [MyPy Documentation](https://mypy.readthedocs.io/)
