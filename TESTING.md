# Testing Guide - Settings Model Selection Feature

This document describes the comprehensive test suite for the Anthropic model selection feature.

## Test Suite Overview

The test suite consists of three levels of testing:

1. **E2E Tests (Playwright)** - Test complete user flows
2. **Backend Unit Tests (Python/pytest)** - Test database and provider functions
3. **Component Tests (Vitest + React Testing Library)** - Test UI components

---

## 1. E2E Tests (Playwright)

### Location
`frontend/e2e/settings-model-selection.spec.js`

### What They Test
- Navigation to settings page
- Settings page structure and layout
- Model dropdown functionality
- Cost estimation display
- Settings persistence across page reload
- Settings integration with evaluations
- Accessibility features

### Prerequisites
```bash
# Terminal 1: Start API server
cd api && python3 flask_server.py

# Terminal 2: Start frontend dev server
cd frontend && npm run dev
```

### Running the Tests

**Run all E2E tests:**
```bash
cd frontend
npx playwright test e2e/settings-model-selection.spec.js
```

**Run specific test group:**
```bash
npx playwright test e2e/settings-model-selection.spec.js -g "should navigate to settings page"
```

**Run with UI mode (interactive):**
```bash
npx playwright test e2e/settings-model-selection.spec.js --ui
```

**Run with headed browser (watch execution):**
```bash
npx playwright test e2e/settings-model-selection.spec.js --headed
```

**Generate HTML report:**
```bash
npx playwright show-report
```

### Test Scenarios

#### Navigation
- ✅ Navigate to settings from sidebar
- ✅ Display settings page title and description

#### Page Structure
- ✅ Display AI Model Configuration card
- ✅ Display Stage 1 model dropdown
- ✅ Display Stage 2 model dropdown
- ✅ Display cost estimates for both stages
- ✅ Display model comparison table
- ✅ Display info box about model selection
- ✅ Display save button

#### Model Selection
- ✅ Default models are correctly set
- ✅ Can change Stage 1 model
- ✅ Can change Stage 2 model
- ✅ All 5 Claude models available in dropdowns

#### Cost Estimation
- ✅ Show cost estimate for Stage 1
- ✅ Show cost estimate for Stage 2
- ✅ Update cost when changing model

#### Settings Persistence
- ✅ Save settings successfully
- ✅ Settings persist after page reload
- ✅ Show success notification

#### Model Comparison
- ✅ Display all models with pricing
- ✅ Show cost level badges

#### Accessibility
- ✅ Proper labels for inputs
- ✅ Keyboard navigation support
- ✅ Descriptive button text

---

## 2. Backend Unit Tests (Python/pytest)

### Location
`api/test_settings.py`

### What They Test

#### Settings Database Operations
- Creating settings table
- Initializing default settings
- Getting all user settings
- Getting specific settings
- Updating/creating settings
- Handling missing settings
- Multiple settings per user

#### Model Configuration
- All models have required fields
- Claude 4.5 models are configured
- Legacy Claude 3.5 models are configured
- Correct pricing relationships (cheaper models)
- Default model is set correctly

#### Pricing Calculations
- Model pricing retrieval
- Cost calculation examples
- Fallback pricing for unknown models

#### Provider Instantiation
- Creating provider with default model
- Creating provider with custom model
- Error handling for missing API keys

### Prerequisites
```bash
# Install pytest
pip3 install pytest

# Ensure ANTHROPIC_API_KEY is set in api/.env
echo "ANTHROPIC_API_KEY=your-key-here" >> api/.env
```

### Running the Tests

**Run all backend tests:**
```bash
cd api
pytest test_settings.py -v
```

**Run specific test class:**
```bash
pytest test_settings.py::TestSettingsDatabase -v
```

**Run specific test:**
```bash
pytest test_settings.py::TestSettingsDatabase::test_ensure_settings_table_exists -v
```

**Run with coverage:**
```bash
pip3 install pytest-cov
pytest test_settings.py -v --cov=database --cov=llm_providers
```

**Run with detailed output:**
```bash
pytest test_settings.py -v -s
```

### Test Classes

#### TestSettingsDatabase
Tests database CRUD operations:
- `test_ensure_settings_table_exists` - Table creation
- `test_ensure_default_settings` - Default initialization
- `test_get_user_settings_returns_dict` - Retrieve all settings
- `test_get_user_setting_existing_key` - Get specific setting
- `test_update_user_setting_creates_new` - Create new setting
- `test_update_user_setting_updates_existing` - Update existing setting

#### TestModelConfiguration
Tests model configuration:
- `test_anthropic_models_have_pricing` - All models have pricing
- `test_anthropic_models_include_claude_45` - Claude 4.5 models present
- `test_anthropic_models_include_legacy` - Legacy models present
- `test_haiku_35_legacy_cheaper_than_45` - Pricing order correct

#### TestAnthropicProviderPricing
Tests pricing calculations:
- `test_get_model_pricing_*` - Correct pricing for each model
- `test_cost_calculation_*` - Cost calculation examples

---

## 3. Component Tests (Vitest + React Testing Library)

### Location
`frontend/src/tests/SettingsPage.test.jsx`

### What They Test
- Page structure and layout
- Model dropdown functionality
- Cost estimation display
- Form submission and saving
- Model comparison table
- Error handling
- Loading states
- Accessibility

### Prerequisites
```bash
# Component tests use mocked API calls, no backend needed
cd frontend
npm install
```

### Running the Tests

**Run all component tests:**
```bash
cd frontend
npm run test:run -- src/tests/SettingsPage.test.jsx
```

**Run in watch mode (re-run on file change):**
```bash
npm run test:run -- src/tests/SettingsPage.test.jsx --watch
```

**Run specific test:**
```bash
npm run test:run -- src/tests/SettingsPage.test.jsx -t "should render the settings page title"
```

**Run with coverage:**
```bash
npm run test:run -- src/tests/SettingsPage.test.jsx --coverage
```

### Test Groups

#### Page Structure and Display
- ✅ Render page title
- ✅ Display description
- ✅ Display AI Model Configuration card
- ✅ Display Stage 1 and Stage 2 labels
- ✅ Display info box
- ✅ Display comparison table
- ✅ Display save button

#### Model Dropdowns
- ✅ Display both dropdowns
- ✅ Populate with available models
- ✅ Show default models
- ✅ Allow changing models

#### Cost Estimation
- ✅ Display cost for Stage 1
- ✅ Display cost for Stage 2
- ✅ Update when changing model
- ✅ Calculate correct costs

#### Form Submission
- ✅ Save settings on button click
- ✅ Show success message
- ✅ Disable button while saving
- ✅ Send correct payload

#### Model Comparison Table
- ✅ Display all models
- ✅ Show pricing
- ✅ Show cost level badges
- ✅ Show model names

#### Error Handling
- ✅ Handle missing data gracefully
- ✅ Show loading state

#### Accessibility
- ✅ Have proper labels
- ✅ Have descriptive button text

---

## Running All Tests Together

### Full Test Suite (Sequential)
```bash
# Terminal 1: Start API
cd api && python3 flask_server.py

# Terminal 2: Start Frontend
cd frontend && npm run dev

# Terminal 3: Run all tests
cd api && pytest test_settings.py -v
cd ../frontend && npm run test:run -- src/tests/SettingsPage.test.jsx
cd ../frontend && npx playwright test e2e/settings-model-selection.spec.js
```

### Parallel Execution (if desired)
```bash
# In different terminals, run each test suite independently:

# Terminal 1: Backend tests
cd api && pytest test_settings.py -v

# Terminal 2: Component tests (no backend needed)
cd frontend && npm run test:run -- src/tests/SettingsPage.test.jsx

# Terminal 3: E2E tests (requires both servers running)
# (After starting API and frontend)
cd frontend && npx playwright test e2e/settings-model-selection.spec.js
```

---

## Test Coverage

### Covered Scenarios

**Backend (database.py):**
- ✅ Settings table creation and initialization
- ✅ CRUD operations (Create, Read, Update)
- ✅ Default settings initialization
- ✅ Model configuration and pricing

**Backend (llm_providers.py):**
- ✅ Model configuration completeness
- ✅ Pricing data accuracy
- ✅ Dynamic pricing calculations
- ✅ Fallback pricing for unknown models

**Frontend (SettingsPage component):**
- ✅ Page rendering and structure
- ✅ Model dropdown interactions
- ✅ Cost estimation display
- ✅ Form submission and saving
- ✅ Success/error notifications
- ✅ Settings persistence

**Frontend (E2E flows):**
- ✅ Complete user journey
- ✅ Navigation and routing
- ✅ Page load and data fetching
- ✅ User interactions
- ✅ Settings persistence across reloads
- ✅ Integration with other features

---

## Continuous Integration

### GitHub Actions Setup (Example)

Create `.github/workflows/test.yml`:

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      api:
        image: python:3.13
        options: >-
          --health-cmd "python -c 'import requests; requests.get(\"http://localhost:8000/health\")'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v2

      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.13

      - name: Set up Node
        uses: actions/setup-node@v2
        with:
          node-version: 18

      - name: Backend Tests
        run: |
          cd api
          pip install -r requirements.txt pytest pytest-cov
          pytest test_settings.py -v --cov

      - name: Frontend Component Tests
        run: |
          cd frontend
          npm install
          npm run test:run -- src/tests/SettingsPage.test.jsx

      - name: Frontend E2E Tests
        run: |
          cd frontend
          npx playwright install
          npm run dev &
          sleep 5
          npx playwright test e2e/settings-model-selection.spec.js
```

---

## Debugging Tests

### Backend Tests

**Add print statements:**
```python
def test_example():
    value = get_user_setting(LOCAL_USER_ID, 'stage1_model')
    print(f"DEBUG: Retrieved value = {value}")  # Will print when run with -s flag
    assert value is not None
```

**Run with verbose output:**
```bash
pytest test_settings.py -v -s
```

### Component Tests

**Use screen.debug():**
```javascript
it('should display title', async () => {
  renderWithQueryClient(<SettingsPage />)

  await waitFor(() => {
    screen.debug() // Print current DOM
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })
})
```

**Run with watch mode:**
```bash
npm run test:run -- src/tests/SettingsPage.test.jsx --watch
```

### E2E Tests

**Take screenshots:**
```javascript
test('example', async ({ page }) => {
  await page.goto('/app/settings')
  await page.screenshot({ path: 'screenshot.png' })
})
```

**Use page.pause() to debug:**
```javascript
test('example', async ({ page }) => {
  await page.goto('/app/settings')
  await page.pause() // Pauses execution, opens inspector
})
```

**Run with UI mode:**
```bash
npx playwright test e2e/settings-model-selection.spec.js --ui
```

---

## Known Issues & Limitations

1. **API Key Required**: Backend tests require `ANTHROPIC_API_KEY` in environment
2. **Mocked Service Calls**: Component tests mock API calls (don't hit real API)
3. **Single Worker E2E**: Playwright config uses single worker to avoid conflicts
4. **Network Dependency**: E2E tests require both API and frontend servers running

---

## Best Practices

### Writing New Tests

1. **Be Descriptive**: Test names should clearly describe what's being tested
   ```javascript
   // Good
   it('should update cost estimate when changing model')

   // Bad
   it('should work')
   ```

2. **Use Test Groups**: Organize related tests with `describe` blocks
   ```javascript
   describe('Model Selection', () => {
     it('test 1', () => {})
     it('test 2', () => {})
   })
   ```

3. **Follow AAA Pattern**: Arrange, Act, Assert
   ```javascript
   it('example', async () => {
     // Arrange
     await page.goto('/app/settings')

     // Act
     await page.getByRole('button').click()

     // Assert
     await expect(page.getByText(/saved/i)).toBeVisible()
   })
   ```

4. **Use Meaningful Assertions**:
   ```javascript
   // Good
   expect(dropdown).toHaveValue('claude-opus-4-5-20251101')

   // Bad
   expect(dropdown.value).toBe('claude-opus-4-5-20251101')
   ```

---

## Test Metrics

### Target Coverage
- Backend: 80%+ coverage
- Components: 70%+ coverage
- E2E: All critical user paths covered

### Performance
- Backend tests: < 1 second per test
- Component tests: < 100ms per test
- E2E tests: < 5 seconds per test

---

## Troubleshooting

### Tests Won't Run

**Backend tests fail:**
```bash
# Ensure database is initialized
cd api && python3 -c "from database import ensure_settings_table_exists; ensure_settings_table_exists()"
```

**Component tests fail:**
```bash
# Clear node_modules and reinstall
cd frontend && rm -rf node_modules && npm install
```

**E2E tests fail:**
```bash
# Ensure both servers are running
# Check that ports 3000 and 8000 are available
lsof -i :3000
lsof -i :8000
```

### Tests Timeout

**E2E tests timing out:**
- Increase timeout in `playwright.config.js`
- Check network latency
- Verify API server is responding

**Component tests timing out:**
- Use `waitFor` with explicit timeout
- Check for infinite loops in test setup
- Verify mocks are working

---

## Quick Reference

| Test Type | Location | Command | Duration |
|-----------|----------|---------|----------|
| E2E | `frontend/e2e/*.spec.js` | `npx playwright test` | 5-30s |
| Backend | `api/test_*.py` | `pytest test_*.py -v` | 1-5s |
| Component | `frontend/src/tests/*.test.jsx` | `npm run test:run` | 1-10s |

---

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Pytest Documentation](https://docs.pytest.org)
- [Vitest Documentation](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
