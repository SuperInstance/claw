/**
 * Test Data Seeds
 * Provides test data fixtures for integration tests
 */

import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

export interface TestUser {
  id: string;
  email: string;
  username: string;
  password: string;
  password_hash: string;
  locale: string;
  role: string;
  is_active: boolean;
}

export interface TestSpreadsheet {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  data: any;
  is_public: boolean;
}

export interface TestPost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  locale: string;
  tags: string[];
}

/**
 * Generate a test user with hashed password
 */
export async function generateTestUser(overrides: Partial<TestUser> = {}): Promise<TestUser> {
  const id = overrides.id || uuidv4();
  const password = overrides.password || 'TestPassword123!';
  const password_hash = await bcrypt.hash(password, 10);

  return {
    id,
    email: overrides.email || `test-${id.slice(0, 8)}@example.com`,
    username: overrides.username || `testuser_${id.slice(0, 8)}`,
    password,
    password_hash,
    locale: overrides.locale || 'en-US',
    role: overrides.role || 'user',
    is_active: overrides.is_active !== false,
  };
}

/**
 * Generate a test spreadsheet
 */
export function generateTestSpreadsheet(overrides: Partial<TestSpreadsheet> = {}): TestSpreadsheet {
  const id = overrides.id || uuidv4();

  return {
    id,
    owner_id: overrides.owner_id || uuidv4(),
    name: overrides.name || 'Test Spreadsheet',
    description: overrides.description || 'A test spreadsheet',
    data: overrides.data || {
      sheets: [
        {
          name: 'Sheet1',
          cells: {
            A1: { value: 'Hello', formula: '', style: {} },
            B1: { value: 'World', formula: '', style: {} },
          },
        },
      ],
    },
    is_public: overrides.is_public || false,
  };
}

/**
 * Generate a test community post
 */
export function generateTestPost(overrides: Partial<TestPost> = {}): TestPost {
  const id = overrides.id || uuidv4();

  return {
    id,
    author_id: overrides.author_id || uuidv4(),
    title: overrides.title || 'Test Post Title',
    content: overrides.content || 'This is a test post content for integration testing.',
    locale: overrides.locale || 'en-US',
    tags: overrides.tags || ['testing', 'integration'],
  };
}

/**
 * Seed multiple test users
 */
export async function seedTestUsers(count: number, overrides: Partial<TestUser> = {}): Promise<TestUser[]> {
  const users: TestUser[] = [];

  for (let i = 0; i < count; i++) {
    const user = await generateTestUser({
      ...overrides,
      email: overrides.email || `testuser${i}@example.com`,
      username: overrides.username || `testuser${i}`,
    });
    users.push(user);
  }

  return users;
}

/**
 * Seed multiple test spreadsheets
 */
export function seedTestSpreadsheets(count: number, ownerId: string, overrides: Partial<TestSpreadsheet> = {}): TestSpreadsheet[] {
  const spreadsheets: TestSpreadsheet[] = [];

  for (let i = 0; i < count; i++) {
    const spreadsheet = generateTestSpreadsheet({
      ...overrides,
      owner_id: ownerId,
      name: overrides.name || `Test Spreadsheet ${i + 1}`,
    });
    spreadsheets.push(spreadsheet);
  }

  return spreadsheets;
}

/**
 * Seed multiple test community posts
 */
export function seedTestPosts(count: number, authorId: string, overrides: Partial<TestPost> = {}): TestPost[] {
  const posts: TestPost[] = [];

  for (let i = 0; i < count; i++) {
    const post = generateTestPost({
      ...overrides,
      author_id: authorId,
      title: overrides.title || `Test Post ${i + 1}`,
    });
    posts.push(post);
  }

  return posts;
}

/**
 * Predefined test user fixture - Admin
 */
export async function getAdminUser(): Promise<TestUser> {
  return generateTestUser({
    email: 'admin@example.com',
    username: 'admin',
    password: 'AdminPassword123!',
    role: 'admin',
    locale: 'en-US',
  });
}

/**
 * Predefined test user fixture - Regular User
 */
export async function getRegularUser(): Promise<TestUser> {
  return generateTestUser({
    email: 'user@example.com',
    username: 'regularuser',
    password: 'UserPassword123!',
    role: 'user',
    locale: 'en-US',
  });
}

/**
 * Predefined test user fixture - Spanish User
 */
export async function getSpanishUser(): Promise<TestUser> {
  return generateTestUser({
    email: 'usuario@example.com',
    username: 'usuario',
    password: 'UsuarioPassword123!',
    role: 'user',
    locale: 'es-ES',
  });
}

/**
 * Predefined test user fixture - Japanese User
 */
export async function getJapaneseUser(): Promise<TestUser> {
  return generateTestUser({
    email: 'nihongo@example.com',
    username: 'nihongo',
    password: 'NihongoPassword123!',
    role: 'user',
    locale: 'ja-JP',
  });
}

/**
 * Get a set of diverse test users for i18n testing
 */
export async function getDiverseTestUsers(): Promise<TestUser[]> {
  return Promise.all([
    getAdminUser(),
    getRegularUser(),
    getSpanishUser(),
    getJapaneseUser(),
    generateTestUser({
      email: 'french@example.com',
      username: 'francais',
      locale: 'fr-FR',
    }),
    generateTestUser({
      email: 'german@example.com',
      username: 'deutsch',
      locale: 'de-DE',
    }),
    generateTestUser({
      email: 'chinese@example.com',
      username: 'zhongwen',
      locale: 'zh-CN',
    }),
  ]);
}

/**
 * Generate JWT token payload for testing
 */
export function generateTestJwtPayload(user: TestUser) {
  return {
    sub: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    locale: user.locale,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
  };
}

/**
 * Mock analytics event data
 */
export function generateAnalyticsEvent(overrides: any = {}) {
  return {
    event_type: overrides.event_type || 'sheet_view',
    properties: {
      sheet_id: overrides.sheet_id || uuidv4(),
      action: overrides.action || 'open',
      duration: overrides.duration || 1000,
      ...overrides.properties,
    },
    timestamp: overrides.timestamp || new Date().toISOString(),
    user_id: overrides.user_id || uuidv4(),
  };
}

/**
 * Generate test comments
 */
export function generateTestComment(overrides: any = {}) {
  return {
    id: overrides.id || uuidv4(),
    post_id: overrides.post_id || uuidv4(),
    author_id: overrides.author_id || uuidv4(),
    content: overrides.content || 'This is a test comment.',
    created_at: overrides.created_at || new Date().toISOString(),
    upvotes: overrides.upvotes || 0,
  };
}
