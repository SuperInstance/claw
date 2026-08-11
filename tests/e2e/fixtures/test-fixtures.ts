import { test as base } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';
import { SpreadsheetPage } from '../pages/SpreadsheetPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { CommunityPage } from '../pages/CommunityPage';
import { TestDataGenerator } from '../helpers/test-data-generator';

/**
 * Test User Fixture
 */
interface TestUser {
  email: string;
  password: string;
  username: string;
  name: string;
}

/**
 * Test Spreadsheet Fixture
 */
interface TestSpreadsheet {
  id: string;
  name: string;
  data: Record<string, string>;
}

/**
 * Test Analytics Fixture
 */
interface TestAnalytics {
  dashboardId: string;
  metrics: Array<{ name: string; value: number }>;
  dateRange: { start: string; end: string };
}

/**
 * Custom test fixtures extending Playwright base
 */
export const test = base.extend<{
  authPage: AuthPage;
  spreadsheetPage: SpreadsheetPage;
  analyticsPage: AnalyticsPage;
  communityPage: CommunityPage;
  testUser: TestUser;
  testSpreadsheet: TestSpreadsheet;
  testAnalytics: TestAnalytics;
}>({
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },

  spreadsheetPage: async ({ page }, use) => {
    await use(new SpreadsheetPage(page));
  },

  analyticsPage: async ({ page }, use) => {
    await use(new AnalyticsPage(page));
  },

  communityPage: async ({ page }, use) => {
    await use(new CommunityPage(page));
  },

  testUser: async ({}, use) => {
    const user: TestUser = {
      email: TestDataGenerator.email(),
      password: TestDataGenerator.password(),
      username: TestDataGenerator.username(),
      name: TestDataGenerator.name(),
    };
    await use(user);
  },

  testSpreadsheet: async ({}, use) => {
    const spreadsheet: TestSpreadsheet = {
      id: TestDataGenerator.spreadsheetId(),
      name: TestDataGenerator.spreadsheetName(),
      data: {
        A1: 'Product',
        B1: 'Quantity',
        C1: 'Price',
        D1: 'Total',
        A2: 'Widget A',
        B2: '10',
        C2: '19.99',
        D2: '=B2*C2',
        A3: 'Widget B',
        B3: '15',
        C3: '24.99',
        D3: '=B3*C3',
      },
    };
    await use(spreadsheet);
  },

  testAnalytics: async ({}, use) => {
    const analytics: TestAnalytics = {
      dashboardId: TestDataGenerator.dashboardId(),
      metrics: [
        { name: 'Revenue', value: TestDataGenerator.number(10000, 100000) },
        { name: 'Users', value: TestDataGenerator.number(1000, 10000) },
        { name: 'Sessions', value: TestDataGenerator.number(5000, 50000) },
      ],
      dateRange: {
        start: TestDataGenerator.dateString('ISO'),
        end: TestDataGenerator.dateString('ISO'),
      },
    };
    await use(analytics);
  },
});

/**
 * Re-export expect from Playwright
 */
export { expect } from '@playwright/test';

/**
 * Re-export test types
 */
export type { TestUser, TestSpreadsheet, TestAnalytics };
