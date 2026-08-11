/**
 * Global Jest Setup
 * Runs once before all test suites
 */

import { Pool } from 'pg';
import Redis from 'ioredis';

export default async function globalSetup() {
  console.log('🧪 Setting up test environment...');

  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test_user:test_password@localhost:5432/polln_test';
  process.env.REDIS_URL = process.env.TEST_REDIS_URL || 'redis://localhost:6379/1';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-integration-tests';
  process.env.ENCRYPTION_KEY = 'test-encryption-key-32-bytes-long';

  // Mock external service credentials
  process.env.API_KEY = 'test-api-key';
  process.env.SECRET_KEY = 'test-secret-key';

  // Initialize test database
  const pool = new Pool({
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '5432'),
    database: process.env.TEST_DB_NAME || 'polln_test',
    user: process.env.TEST_DB_USER || 'test_user',
    password: process.env.TEST_DB_PASSWORD || 'test_password',
  });

  try {
    // Wait for database to be ready
    await pool.query('SELECT 1');
    console.log('✅ Test database connected');

    // Run migrations
    await runMigrations(pool);
    console.log('✅ Database migrations completed');

    // Store pool for global teardown
    (global as any).__TEST_DB_POOL__ = pool;
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    // Don't throw - allow tests to run with mocked database
  }

  // Initialize test Redis
  const redis = new Redis({
    host: process.env.TEST_REDIS_HOST || 'localhost',
    port: parseInt(process.env.TEST_REDIS_PORT || '6379'),
    db: parseInt(process.env.TEST_REDIS_DB || '1'), // Use separate DB for tests
  });

  try {
    await redis.ping();
    console.log('✅ Test Redis connected');

    // Flush test database
    await redis.flushdb();
    console.log('✅ Test Redis flushed');

    // Store redis for global teardown
    (global as any).__TEST_REDIS__ = redis;
  } catch (error) {
    console.error('❌ Failed to setup test Redis:', error);
    // Don't throw - allow tests to run with mocked Redis
  }

  console.log('✅ Test environment ready');
}

async function runMigrations(pool: Pool) {
  // Create test schema
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS test_schema;

    -- Users table
    CREATE TABLE IF NOT EXISTS test_schema.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      locale VARCHAR(10) DEFAULT 'en-US',
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      preferences JSONB DEFAULT '{}'
    );

    -- Spreadsheets table
    CREATE TABLE IF NOT EXISTS test_schema.spreadsheets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id UUID REFERENCES test_schema.users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      data JSONB DEFAULT '{}',
      is_public BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_accessed TIMESTAMP,
      version INTEGER DEFAULT 1
    );

    -- Collaborators table
    CREATE TABLE IF NOT EXISTS test_schema.collaborators (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      spreadsheet_id UUID REFERENCES test_schema.spreadsheets(id) ON DELETE CASCADE,
      user_id UUID REFERENCES test_schema.users(id) ON DELETE CASCADE,
      role VARCHAR(50) DEFAULT 'viewer',
      invited_by UUID REFERENCES test_schema.users(id),
      invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(spreadsheet_id, user_id)
    );

    -- Analytics events table
    CREATE TABLE IF NOT EXISTS test_schema.analytics_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES test_schema.users(id) ON DELETE SET NULL,
      spreadsheet_id UUID REFERENCES test_schema.spreadsheets(id) ON DELETE SET NULL,
      event_type VARCHAR(100) NOT NULL,
      properties JSONB DEFAULT '{}',
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON test_schema.analytics_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON test_schema.analytics_events(timestamp);

    -- Rate limiting table
    CREATE TABLE IF NOT EXISTS test_schema.rate_limits (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      identifier VARCHAR(255) NOT NULL,
      endpoint VARCHAR(255) NOT NULL,
      request_count INTEGER DEFAULT 1,
      window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(identifier, endpoint, window_start)
    );

    -- Sessions table
    CREATE TABLE IF NOT EXISTS test_schema.sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES test_schema.users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_used TIMESTAMP,
      ip_address VARCHAR(45),
      user_agent TEXT
    );

    -- Community posts table
    CREATE TABLE IF NOT EXISTS test_schema.community_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      author_id UUID REFERENCES test_schema.users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      locale VARCHAR(10) DEFAULT 'en-US',
      tags TEXT[],
      upvotes INTEGER DEFAULT 0,
      downvotes INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_pinned BOOLEAN DEFAULT false
    );

    -- Comments table
    CREATE TABLE IF NOT EXISTS test_schema.comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID REFERENCES test_schema.community_posts(id) ON DELETE CASCADE,
      author_id UUID REFERENCES test_schema.users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      upvotes INTEGER DEFAULT 0
    );

    -- Audit log table
    CREATE TABLE IF NOT EXISTS test_schema.audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES test_schema.users(id) ON DELETE SET NULL,
      action VARCHAR(100) NOT NULL,
      resource_type VARCHAR(100),
      resource_id UUID,
      ip_address VARCHAR(45),
      user_agent TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      metadata JSONB DEFAULT '{}'
    );
  `);

  console.log('✅ Test schema created');
}
