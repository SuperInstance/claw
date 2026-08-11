/**
 * Database Test Client
 * Provides database utilities for integration tests
 */

import { Pool, PoolClient } from 'pg';

export class TestDatabase {
  private pool: Pool;
  private transactionClient: PoolClient | null = null;

  constructor() {
    this.pool = new Pool({
      host: process.env.TEST_DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT || '5432'),
      database: process.env.TEST_DB_NAME || 'polln_test',
      user: process.env.TEST_DB_USER || 'test_user',
      password: process.env.TEST_DB_PASSWORD || 'test_password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  /**
   * Get a database connection
   */
  async getConnection(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Start a transaction for test isolation
   */
  async startTransaction(): Promise<void> {
    if (this.transactionClient) {
      throw new Error('Transaction already active');
    }
    this.transactionClient = await this.getConnection();
    await this.transactionClient.query('BEGIN');
  }

  /**
   * Rollback the transaction (called after each test)
   */
  async rollbackTransaction(): Promise<void> {
    if (!this.transactionClient) {
      throw new Error('No active transaction');
    }
    await this.transactionClient.query('ROLLBACK');
    this.transactionClient.release();
    this.transactionClient = null;
  }

  /**
   * Commit the transaction (rarely used in tests)
   */
  async commitTransaction(): Promise<void> {
    if (!this.transactionClient) {
      throw new Error('No active transaction');
    }
    await this.transactionClient.query('COMMIT');
    this.transactionClient.release();
    this.transactionClient = null;
  }

  /**
   * Execute a query within the transaction if one exists, otherwise use pool
   */
  async query(text: string, params?: any[]): Promise<any> {
    if (this.transactionClient) {
      return await this.transactionClient.query(text, params);
    }
    return await this.pool.query(text, params);
  }

  /**
   * Clean all data from test schema
   */
  async cleanAll(): Promise<void> {
    const tables = [
      'audit_logs',
      'comments',
      'community_posts',
      'sessions',
      'rate_limits',
      'analytics_events',
      'collaborators',
      'spreadsheets',
      'users',
    ];

    for (const table of tables) {
      await this.query(`DELETE FROM test_schema.${table} WHERE 1=1`);
    }
  }

  /**
   * Close the database connection pool
   */
  async close(): Promise<void> {
    if (this.transactionClient) {
      await this.rollbackTransaction();
    }
    await this.pool.end();
  }

  /**
   * Seed test data
   */
  async seedData(data: {
    users?: any[];
    spreadsheets?: any[];
    collaborators?: any[];
    posts?: any[];
  }): Promise<void> {
    if (data.users && data.users.length > 0) {
      for (const user of data.users) {
        await this.query(
          `INSERT INTO test_schema.users (id, email, username, password_hash, locale, role, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (email) DO NOTHING`,
          [
            user.id,
            user.email,
            user.username,
            user.password_hash || 'hash',
            user.locale || 'en-US',
            user.role || 'user',
            user.is_active !== false,
          ]
        );
      }
    }

    if (data.spreadsheets && data.spreadsheets.length > 0) {
      for (const sheet of data.spreadsheets) {
        await this.query(
          `INSERT INTO test_schema.spreadsheets (id, owner_id, name, description, is_public)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [sheet.id, sheet.owner_id, sheet.name, sheet.description, sheet.is_public || false]
        );
      }
    }

    if (data.posts && data.posts.length > 0) {
      for (const post of data.posts) {
        await this.query(
          `INSERT INTO test_schema.community_posts (id, author_id, title, content, locale, tags)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING`,
          [post.id, post.author_id, post.title, post.content, post.locale || 'en-US', post.tags || []]
        );
      }
    }
  }

  /**
   * Get a user by email
   */
  async getUserByEmail(email: string): Promise<any> {
    const result = await this.query('SELECT * FROM test_schema.users WHERE email = $1', [email]);
    return result.rows[0];
  }

  /**
   * Get a spreadsheet by ID
   */
  async getSpreadsheetById(id: string): Promise<any> {
    const result = await this.query('SELECT * FROM test_schema.spreadsheets WHERE id = $1', [id]);
    return result.rows[0];
  }

  /**
   * Count rows in a table
   */
  async countTable(tableName: string): Promise<number> {
    const result = await this.query(`SELECT COUNT(*) as count FROM test_schema.${tableName}`);
    return parseInt(result.rows[0].count);
  }
}

// Singleton instance
let dbInstance: TestDatabase | null = null;

export function getTestDb(): TestDatabase {
  if (!dbInstance) {
    dbInstance = new TestDatabase();
  }
  return dbInstance;
}

export async function closeTestDb(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}
