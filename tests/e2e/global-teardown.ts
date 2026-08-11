import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test cleanup...');

  // Clean up test data
  // Delete test users
  // Delete test spreadsheets
  // Delete test dashboards
  // Delete test threads

  console.log('✅ E2E test cleanup complete');
}

export default globalTeardown;
