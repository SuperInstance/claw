/**
 * Global Jest Teardown
 * Runs once after all test suites
 */

export default async function globalTeardown() {
  console.log('🧹 Cleaning up test environment...');

  // Close database connections
  const pool = (global as any).__TEST_DB_POOL__;
  if (pool) {
    try {
      // Clean up test data
      await pool.query('DROP SCHEMA IF EXISTS test_schema CASCADE');
      console.log('✅ Test schema dropped');

      await pool.end();
      console.log('✅ Database connections closed');
    } catch (error) {
      console.error('❌ Error closing database:', error);
    }
  }

  // Close Redis connections
  const redis = (global as any).__TEST_REDIS__;
  if (redis) {
    try {
      await redis.flushdb();
      await redis.quit();
      console.log('✅ Redis connections closed');
    } catch (error) {
      console.error('❌ Error closing Redis:', error);
    }
  }

  // Close any test servers
  const testServer = (global as any).__TEST_SERVER__;
  if (testServer) {
    try {
      await testServer.close();
      console.log('✅ Test server closed');
    } catch (error) {
      console.error('❌ Error closing test server:', error);
    }
  }

  // Clean up temporary files
  const fs = await import('fs/promises');
  const path = await import('path');
  const tempDir = path.join(process.cwd(), 'tests', 'temp');

  try {
    await fs.rm(tempDir, { recursive: true, force: true });
    console.log('✅ Temporary files cleaned');
  } catch (error) {
    // Ignore if temp directory doesn't exist
  }

  // Reset global state
  delete (global as any).__TEST_DB_POOL__;
  delete (global as any).__TEST_REDIS__;
  delete (global as any).__TEST_SERVER__;

  console.log('✅ Test cleanup complete');
}
