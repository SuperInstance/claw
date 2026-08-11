import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Testing Configuration
 * Comprehensive configuration for Spreadsheet Moment platform testing
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers on CI
  workers: process.env.CI ? 4 : undefined,

  // Reporter configuration
  reporter: [
    ['html', {
      outputFolder: 'test-results/html-report',
      open: 'never',
    }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list'],
  ],

  // Shared settings for all tests
  use: {
    // Base URL for tests
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'retain-on-failure',

    // Screenshot configuration
    screenshot: 'only-on-failure',

    // Video configuration
    video: 'retain-on-failure',

    // Action timeout
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 30000,

    // Locale for internationalization tests
    locale: 'en-US',

    // Timezone
    timezoneId: 'America/New_York',

    // User agent
    userAgent: 'Spreadsheet Moment E2E Tests',

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
  },

  // Projects define different test configurations
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against tablet viewports */
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    },

    /* Accessibility testing project */
    {
      name: 'accessibility',
      use: {
        ...devices['Desktop Chrome'],
        // Enable accessibility testing
      },
      testMatch: /.*\.accessibility\.spec\.ts/,
    },

    /* Internationalization testing */
    {
      name: 'i18n-es',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'es-ES',
      },
      testMatch: /.*\.i18n\.spec\.ts/,
    },

    {
      name: 'i18n-fr',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'fr-FR',
      },
      testMatch: /.*\.i18n\.spec\.ts/,
    },

    {
      name: 'i18n-de',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'de-DE',
      },
      testMatch: /.*\.i18n\.spec\.ts/,
    },

    {
      name: 'i18n-zh',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'zh-CN',
      },
      testMatch: /.*\.i18n\.spec\.ts/,
    },

    /* RTL layout testing */
    {
      name: 'i18n-ar',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'ar-SA',
      },
      testMatch: /.*\.i18n\.spec\.ts/,
    },

    /* Visual regression testing */
    {
      name: 'visual-regression',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /.*\.visual\.spec\.ts/,
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Output directory for test artifacts
  outputDir: 'test-results/artifacts',

  // Global setup and teardown
  globalSetup: require.resolve('./tests/e2e/global-setup'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown'),
});
