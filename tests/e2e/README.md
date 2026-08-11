# Spreadsheet Moment - E2E Testing Guide

Comprehensive end-to-end testing suite for the Spreadsheet Moment platform using Playwright.

## Table of Contents

- [Overview](#overview)
- [Test Coverage](#test-coverage)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Page Object Model](#page-object-model)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

This E2E test suite provides comprehensive coverage of the Spreadsheet Moment platform with **150+ tests** across multiple categories:

- **User Authentication** (15 tests)
- **Spreadsheet Operations** (40 tests)
- **Analytics Dashboard** (20 tests)
- **Community Features** (30 tests)
- **Accessibility** (20 tests)
- **Internationalization** (15 tests)
- **Mobile Responsiveness** (10 tests)

### Test Statistics

| Category | Tests | Coverage |
|----------|-------|----------|
| Authentication | 15 | Login flows, 2FA, OAuth, password reset |
| Spreadsheet | 40 | CRUD, formulas, charts, collaboration |
| Analytics | 20 | Metrics, reports, widgets, dashboards |
| Community | 30 | Forum, templates, profiles, badges |
| Accessibility | 20 | WCAG 2.1 AA compliance, screen readers |
| i18n | 15 | Languages, RTL, currencies, dates |
| Mobile | 10 | Responsive design, touch gestures |
| **Total** | **150** | **Cross-browser, multi-device** |

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Operating System**: Windows, macOS, or Linux
- **Memory**: 4GB RAM minimum (8GB recommended)
- **Disk Space**: 2GB for browser binaries

### Required Software

```bash
# Check Node.js version
node --version  # Should be v18+

# Check npm version
npm --version   # Should be v9+
```

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Playwright Browsers

```bash
# Install all browsers
npm run test:e2e:install

# Or install specific browsers
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

### 3. Verify Installation

```bash
# Run tests to verify installation
npm run test:e2e -- --project=chromium
```

## Running Tests

### Quick Start

```bash
# Run all tests
npm run test:e2e

# Run tests in UI mode
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run tests with visible browser
npm run test:e2e:headed
```

### Run Specific Test Suites

```bash
# Authentication tests
npm run test:e2e -- tests/e2e/tests/auth/

# Spreadsheet tests
npm run test:e2e -- tests/e2e/tests/spreadsheet/

# Analytics tests
npm run test:e2e -- tests/e2e/tests/analytics/

# Community tests
npm run test:e2e -- tests/e2e/tests/community/

# Accessibility tests
npm run test:e2e:accessibility

# Internationalization tests
npm run test:e2e:i18n

# Mobile tests
npm run test:e2e:mobile
```

### Run by Browser

```bash
# Chromium only
npm run test:e2e:chromium

# Firefox only
npm run test:e2e:firefox

# WebKit (Safari) only
npm run test:e2e:webkit
```

### Run Specific Test

```bash
# Run single test file
npm run test:e2e -- tests/e2e/tests/auth/auth.spec.ts

# Run tests matching pattern
npm run test:e2e -- --grep "should login"

# Run tests in specific file with line numbers
npm run test:e2e -- tests/e2e/tests/auth/auth.spec.ts:15
```

### Test Reports

```bash
# View HTML report
npm run test:e2e:report

# Generate JSON report
npm run test:e2e -- --reporter=json
```

## Test Structure

```
tests/e2e/
├── playwright.config.ts         # Playwright configuration
├── global-setup.ts              # Global test setup
├── global-teardown.ts           # Global test teardown
├── pages/                       # Page Object Models
│   ├── BasePage.ts             # Base page with common methods
│   ├── AuthPage.ts             # Authentication page object
│   ├── SpreadsheetPage.ts      # Spreadsheet page object
│   ├── AnalyticsPage.ts        # Analytics page object
│   └── CommunityPage.ts        # Community page object
├── helpers/                     # Test helpers
│   └── test-data-generator.ts  # Random test data generator
├── fixtures/                    # Test fixtures
│   └── test-fixtures.ts        # Custom Playwright fixtures
├── tests/                       # Test suites
│   ├── auth/                   # Authentication tests (15)
│   ├── spreadsheet/            # Spreadsheet tests (40)
│   ├── analytics/              # Analytics tests (20)
│   ├── community/              # Community tests (30)
│   ├── accessibility/          # Accessibility tests (20)
│   ├── i18n/                   # i18n tests (15)
│   └── mobile/                 # Mobile tests (10)
└── README.md                    # This file
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '../../fixtures/test-fixtures';

test.describe('My Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/my-feature');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const element = page.locator('[data-testid="my-element"]');

    // Act
    await element.click();

    // Assert
    await expect(element).toBeVisible();
  });
});
```

### Using Page Objects

```typescript
import { test, expect } from '../../fixtures/test-fixtures';
import { AuthPage } from '../../pages/AuthPage';

test('should login user', async ({ authPage, testUser }) => {
  await authPage.gotoLoginPage();
  await authPage.login(testUser.email, testUser.password);
  await authPage.verifyLoginSuccess();
});
```

### Test Data Generation

```typescript
import { test } from '../../fixtures/test-fixtures';
import { TestDataGenerator } from '../../helpers/test-data-generator';

test('should create user with random data', async () => {
  const user = {
    email: TestDataGenerator.email(),
    password: TestDataGenerator.password(),
    name: TestDataGenerator.name(),
  };
  // Use test data...
});
```

### Using Fixtures

```typescript
import { test, expect } from '../../fixtures/test-fixtures';

test('should use test user fixture', async ({ testUser, authPage }) => {
  await authPage.gotoLoginPage();
  await authPage.login(testUser.email, testUser.password);
  await authPage.verifyLoginSuccess();
});
```

### Test Configuration

```typescript
test.describe('My Feature Tests', () => {
  // Configure test options
  test.describe.configure({
    mode: 'serial',      // Run tests serially
    timeout: 60000,      // 60 second timeout
    retries: 2,          // Retry failed tests twice
  });

  test('my test', async ({ page }) => {
    // Test code...
  });
});
```

## Page Object Model

### Base Page

The `BasePage` class provides common functionality for all pages:

```typescript
import { BasePage } from '../pages/BasePage';

class MyPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async myMethod() {
    await this.goto('/my-page');
    await this.click('[data-testid="button"]');
  }
}
```

### Creating Custom Page Objects

```typescript
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class MyPage extends BasePage {
  // Define locators
  readonly myButton: string;
  readonly myInput: string;

  constructor(page: Page) {
    super(page);
    this.myButton = '[data-testid="my-button"]';
    this.myInput = '[data-testid="my-input"]';
  }

  // Define page-specific methods
  async clickMyButton() {
    await this.click(this.myButton);
  }

  async fillMyInput(value: string) {
    await this.fill(this.myInput, value);
  }
}
```

## Best Practices

### Test Organization

1. **Use describe blocks** to group related tests
2. **Use beforeEach hooks** for common setup
3. **Keep tests independent** - don't rely on test execution order
4. **Use descriptive test names** that explain what is being tested

### Test Data

1. **Use TestDataGenerator** for random data
2. **Avoid hardcoding values** that might change
3. **Clean up test data** in afterEach hooks
4. **Use fixtures** for common test objects

### Selectors

1. **Prefer data-testid** attributes over CSS selectors
2. **Avoid XPath** unless necessary
3. **Use stable selectors** that won't break with UI changes
4. **Define selectors as constants** in page objects

### Assertions

1. **Use explicit assertions** with expect()
2. **Wait for elements** before asserting
3. **Use specific matchers** (toBeVisible vs toExist)
4. **Provide custom error messages** for better debugging

### Performance

1. **Use waitForLoadState** for network idle
2. **Avoid arbitrary waits** (page.waitForTimeout)
3. **Use locators efficiently** (page.locator vs page.$)
4. **Reuse page objects** instead of creating new instances

## CI/CD Integration

### GitHub Actions

The test suite includes a GitHub Actions workflow (`.github/workflows/e2e-tests.yml`) that:

- Runs tests on multiple browsers (Chromium, Firefox, WebKit)
- Tests mobile viewports
- Runs accessibility tests
- Tests internationalization
- Generates combined reports
- Posts results to pull requests

### Environment Variables

Set these in your CI environment:

```bash
BASE_URL=http://localhost:3000
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=TestPassword123!
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

### Docker Integration

```dockerfile
FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

CMD ["npm", "run", "test:e2e"]
```

## Troubleshooting

### Common Issues

#### Tests Fail to Start

```bash
# Ensure browsers are installed
npx playwright install --with-deps

# Check Node.js version
node --version  # Should be v18+
```

#### Tests Time Out

```bash
# Increase timeout in playwright.config.ts
timeout: 60000,  // 60 seconds
```

#### Browser Binary Issues

```bash
# Reinstall browsers
npx playwright install --force --with-deps
```

#### Port Already in Use

```bash
# Kill process using port 3000
npx kill-port 3000

# Or use a different port
BASE_URL=http://localhost:3001 npm run test:e2e
```

### Debug Mode

Run tests in debug mode for step-by-step execution:

```bash
npm run test:e2e:debug

# Or use Playwright Inspector
npx playwright test --debug
```

### Visual Debugging

```bash
# Run with headed browser
npm run test:e2e:headed

# Slow down execution
npx playwright test --headed --slow-mo=1000
```

### Video Recording

Videos are automatically recorded for failed tests. Find them in:

```
test-results/videos/
```

### Screenshots

Screenshots are automatically captured on failures. Find them in:

```
test-results/screenshots/
```

### Traces

Traces provide detailed execution information. View them with:

```bash
npx playwright show-trace test-results/trace.zip
```

## Test Configuration

### Playwright Config

Key configuration options in `playwright.config.ts`:

```typescript
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Parallel execution
  fullyParallel: true,

  // Retries on CI
  retries: process.env.CI ? 2 : 0,

  // Timeout
  timeout: 30000,

  // Workers
  workers: process.env.CI ? 4 : undefined,

  // Base URL
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  // Projects (browsers)
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

### Environment-Specific Configs

```bash
# Development
BASE_URL=http://localhost:3000 npm run test:e2e

# Staging
BASE_URL=https://staging.spreadsheetmoment.com npm run test:e2e

# Production
BASE_URL=https://spreadsheetmoment.com npm run test:e2e
```

## Contributing

When adding new tests:

1. **Follow the existing structure** - Use page objects and fixtures
2. **Add appropriate tests** - Cover happy path and edge cases
3. **Update this README** - Document new test suites
4. **Run tests locally** - Ensure tests pass before committing
5. **Add data-testid attributes** - To elements you need to test

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Test Runner](https://playwright.dev/docs/test-runners)

## Support

For issues or questions:

1. Check this README first
2. Review Playwright documentation
3. Check existing issues
4. Create a new issue with details

---

**Last Updated**: 2026-03-14
**Test Suite Version**: 1.0.0
**Total Tests**: 150+
