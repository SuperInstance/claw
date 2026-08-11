import { FullConfig } from '@playwright/test';
import { TestDataGenerator } from './helpers/test-data-generator';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...');

  // Set environment variables
  process.env.NODE_ENV = 'test';
  process.env.BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

  // Generate test data
  const testAdminUser = {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@spreadsheetmoment.test',
    password: process.env.TEST_ADMIN_PASSWORD || 'TestAdmin123!',
    username: 'testadmin',
    name: 'Test Admin',
  };

  console.log('✅ E2E test setup complete');
  console.log(`📧 Test admin email: ${testAdminUser.email}`);
  console.log(`🌐 Base URL: ${process.env.BASE_URL}`);

  // Store test data for use in tests
  process.env.TEST_ADMIN_EMAIL = testAdminUser.email;
  process.env.TEST_ADMIN_PASSWORD = testAdminUser.password;
}

export default globalSetup;
