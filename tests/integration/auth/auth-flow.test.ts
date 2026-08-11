/**
 * Authentication + Authorization Integration Tests
 * Tests JWT flow, role-based access control, and permissions
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { getTestDb } from '../../database/client';
import { generateTestUser, getAdminUser, getRegularUser } from '../../database/seeds';
import { ApiTestClient, GraphQLMutations, GraphQLQueries } from '../../helpers/api';
import jwt from 'jsonwebtoken';

// Mock Express app
const mockApp = {
  post: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  send: jest.fn().mockResolvedValue({ body: { data: {} } }),
};

describe('Authentication + Authorization Integration Tests', () => {
  let db: ReturnType<typeof getTestDb>;
  let apiClient: ApiTestClient;
  let adminUser: any;
  let regularUser: any;
  let unauthenticatedUser: any;

  beforeAll(async () => {
    db = getTestDb();
    await db.startTransaction();

    apiClient = new ApiTestClient(mockApp as any);

    // Create test users
    adminUser = await getAdminUser();
    regularUser = await getRegularUser();
    unauthenticatedUser = await generateTestUser({
      email: 'unauth@example.com',
      username: 'unauth',
    });

    await db.seedData({ users: [adminUser, regularUser, unauthenticatedUser] });
  });

  afterAll(async () => {
    await db.rollbackTransaction();
    await db.close();
  });

  beforeEach(async () => {
    await db.startTransaction();
    apiClient.clearAuth();
  });

  afterEach(async () => {
    await db.rollbackTransaction();
  });

  describe('User Registration', () => {
    test('should register a new user with valid data', async () => {
      // Arrange
      const newUser = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'SecurePass123!',
        locale: 'en-US',
      };

      // Act
      const mutation = GraphQLMutations.register(
        newUser.email,
        newUser.username,
        newUser.password,
        newUser.locale
      );

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            register: {
              user: {
                id: expect.any(String),
                email: newUser.email,
                username: newUser.username,
                locale: newUser.locale,
              },
              token: expect.any(String),
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.register.user).toBeDefined();
      expect(response.data?.register.user.email).toBe(newUser.email);
      expect(response.data?.register.token).toBeDefined();

      // Verify user exists in database
      const dbUser = await db.getUserByEmail(newUser.email);
      expect(dbUser).toBeDefined();
      expect(dbUser.email).toBe(newUser.email);
    });

    test('should reject registration with duplicate email', async () => {
      // Arrange
      const duplicateUser = {
        email: regularUser.email,
        username: 'different',
        password: 'SecurePass123!',
      };

      // Act
      const mutation = GraphQLMutations.register(
        duplicateUser.email,
        duplicateUser.username,
        duplicateUser.password
      );

      // Mock error response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Email already exists',
              extensions: { code: 'DUPLICATE_EMAIL' },
            },
          ],
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].extensions?.code).toBe('DUPLICATE_EMAIL');
    });

    test('should reject registration with weak password', async () => {
      // Arrange
      const weakPasswordUser = {
        email: 'weak@example.com',
        username: 'weak',
        password: '123', // Too short
      };

      // Act
      const mutation = GraphQLMutations.register(
        weakPasswordUser.email,
        weakPasswordUser.username,
        weakPasswordUser.password
      );

      // Mock error response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Password must be at least 8 characters long',
              extensions: { code: 'WEAK_PASSWORD' },
            },
          ],
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].extensions?.code).toBe('WEAK_PASSWORD');
    });

    test('should reject registration with invalid email format', async () => {
      // Arrange
      const invalidEmailUser = {
        email: 'not-an-email',
        username: 'invalid',
        password: 'SecurePass123!',
      };

      // Act
      const mutation = GraphQLMutations.register(
        invalidEmailUser.email,
        invalidEmailUser.username,
        invalidEmailUser.password
      );

      // Mock error response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Invalid email format',
              extensions: { code: 'INVALID_EMAIL' },
            },
          ],
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].extensions?.code).toBe('INVALID_EMAIL');
    });
  });

  describe('User Login', () => {
    test('should login with valid credentials', async () => {
      // Act
      const mutation = GraphQLMutations.login(regularUser.email, regularUser.password);

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            login: {
              user: {
                id: regularUser.id,
                email: regularUser.email,
                username: regularUser.username,
                locale: regularUser.locale,
              },
              token: expect.any(String),
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.login.user.email).toBe(regularUser.email);
      expect(response.data?.login.token).toBeDefined();

      // Verify JWT token is valid
      const decoded = jwt.verify(
        response.data?.login.token,
        process.env.JWT_SECRET || 'test-jwt-secret-key-for-integration-tests'
      );
      expect(decoded.sub).toBe(regularUser.id);
    });

    test('should reject login with invalid email', async () => {
      // Act
      const mutation = GraphQLMutations.login('nonexistent@example.com', 'password');

      // Mock error response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Invalid email or password',
              extensions: { code: 'INVALID_CREDENTIALS' },
            },
          ],
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].extensions?.code).toBe('INVALID_CREDENTIALS');
    });

    test('should reject login with invalid password', async () => {
      // Act
      const mutation = GraphQLMutations.login(regularUser.email, 'wrongpassword');

      // Mock error response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Invalid email or password',
              extensions: { code: 'INVALID_CREDENTIALS' },
            },
          ],
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].extensions?.code).toBe('INVALID_CREDENTIALS');
    });

    test('should reject login for inactive user', async () => {
      // Arrange
      const inactiveUser = await generateTestUser({
        email: 'inactive@example.com',
        is_active: false,
      });
      await db.seedData({ users: [inactiveUser] });

      // Act
      const mutation = GraphQLMutations.login(inactiveUser.email, inactiveUser.password);

      // Mock error response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Account is inactive',
              extensions: { code: 'ACCOUNT_INACTIVE' },
            },
          ],
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].extensions?.code).toBe('ACCOUNT_INACTIVE');
    });
  });

  describe('JWT Token Management', () => {
    test('should authenticate requests with valid JWT token', async () => {
      // Arrange
      await apiClient.authenticateUser(regularUser);

      // Act
      const query = GraphQLQueries.getMe;

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            me: {
              id: regularUser.id,
              email: regularUser.email,
              username: regularUser.username,
              locale: regularUser.locale,
              role: regularUser.role,
            },
          },
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.me.email).toBe(regularUser.email);
    });

    test('should reject requests with expired JWT token', async () => {
      // Arrange
      const expiredPayload = {
        sub: regularUser.id,
        email: regularUser.email,
        username: regularUser.username,
        role: regularUser.role,
        iat: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        exp: Math.floor(Date.now() / 1000) - 1800, // Expired 30 minutes ago
      };
      const expiredToken = jwt.sign(
        expiredPayload,
        process.env.JWT_SECRET || 'test-jwt-secret-key-for-integration-tests'
      );
      apiClient.setAuthToken(expiredToken);

      // Act
      const query = GraphQLQueries.getMe;

      // Mock error response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Token expired',
              extensions: { code: 'TOKEN_EXPIRED' },
            },
          ],
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].extensions?.code).toBe('TOKEN_EXPIRED');
    });

    test('should reject requests with invalid JWT token', async () => {
      // Arrange
      apiClient.setAuthToken('invalid.token.here');

      // Act
      const query = GraphQLQueries.getMe;

      // Mock error response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Invalid token',
              extensions: { code: 'INVALID_TOKEN' },
            },
          ],
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].extensions?.code).toBe('INVALID_TOKEN');
    });

    test('should reject requests with tampered JWT token', async () => {
      // Arrange
      const validToken = await apiClient.authenticateUser(regularUser);
      const tamperedToken = validToken.slice(0, -10) + 'tampered123';
      apiClient.setAuthToken(tamperedToken);

      // Act
      const query = GraphQLQueries.getMe;

      // Mock error response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Invalid token signature',
              extensions: { code: 'INVALID_SIGNATURE' },
            },
          ],
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].extensions?.code).toBe('INVALID_SIGNATURE');
    });
  });

  describe('Role-Based Access Control', () => {
    test('should allow admin to access admin-only endpoints', async () => {
      // Arrange
      await apiClient.authenticateUser(adminUser);

      // Act
      const query = `
        query AdminDashboard {
          adminDashboard {
            totalUsers
            totalSpreadsheets
            activeSessions
          }
        }
      `;

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            adminDashboard: {
              totalUsers: 100,
              totalSpreadsheets: 500,
              activeSessions: 25,
            },
          },
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.adminDashboard).toBeDefined();
    });

    test('should deny regular user access to admin-only endpoints', async () => {
      // Arrange
      await apiClient.authenticateUser(regularUser);

      // Act
      const query = `
        query AdminDashboard {
          adminDashboard {
            totalUsers
          }
        }
      `;

      // Mock error response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Admin access required',
              extensions: { code: 'ADMIN_ACCESS_REQUIRED' },
            },
          ],
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].extensions?.code).toBe('ADMIN_ACCESS_REQUIRED');
    });

    test('should allow users to access their own data', async () => {
      // Arrange
      await apiClient.authenticateUser(regularUser);

      // Act
      const query = GraphQLQueries.getMe;

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            me: {
              id: regularUser.id,
              email: regularUser.email,
              username: regularUser.username,
            },
          },
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.me.id).toBe(regularUser.id);
    });

    test('should deny users access to other users data', async () => {
      // Arrange
      await apiClient.authenticateUser(regularUser);

      // Act
      const query = GraphQLQueries.getUser(adminUser.id);

      // Mock error response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Not authorized to access this user',
              extensions: { code: 'NOT_AUTHORIZED' },
            },
          ],
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].extensions?.code).toBe('NOT_AUTHORIZED');
    });
  });

  describe('Resource-Level Authorization', () => {
    test('should allow owner to delete their spreadsheet', async () => {
      // Arrange
      await apiClient.authenticateUser(regularUser);
      const { generateTestSpreadsheet } = await import('../../database/seeds');
      const spreadsheet = generateTestSpreadsheet({ owner_id: regularUser.id });
      await db.seedData({ spreadsheets: [spreadsheet] });

      // Act
      const mutation = GraphQLMutations.deleteSpreadsheet(spreadsheet.id);

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            deleteSpreadsheet: { success: true },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.deleteSpreadsheet.success).toBe(true);
    });

    test('should deny non-owner from deleting spreadsheet', async () => {
      // Arrange
      await apiClient.authenticateUser(unauthenticatedUser);
      const { generateTestSpreadsheet } = await import('../../database/seeds');
      const spreadsheet = generateTestSpreadsheet({ owner_id: regularUser.id });
      await db.seedData({ spreadsheets: [spreadsheet] });

      // Act
      const mutation = GraphQLMutations.deleteSpreadsheet(spreadsheet.id);

      // Mock error response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Not authorized to delete this spreadsheet',
              extensions: { code: 'NOT_AUTHORIZED' },
            },
          ],
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].extensions?.code).toBe('NOT_AUTHORIZED');
    });

    test('should allow collaborator with edit permission to modify spreadsheet', async () => {
      // Arrange
      await apiClient.authenticateUser(unauthenticatedUser);
      const { generateTestSpreadsheet } = await import('../../database/seeds');
      const spreadsheet = generateTestSpreadsheet({ owner_id: regularUser.id });
      await db.seedData({ spreadsheets: [spreadsheet] });

      // Add as editor
      await db.query(
        `INSERT INTO test_schema.collaborators (spreadsheet_id, user_id, role)
         VALUES ($1, $2, $3)`,
        [spreadsheet.id, unauthenticatedUser.id, 'editor']
      );

      // Act
      const mutation = GraphQLMutations.updateSpreadsheet(
        spreadsheet.id,
        'Updated by collaborator'
      );

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            updateSpreadsheet: {
              id: spreadsheet.id,
              name: 'Updated by collaborator',
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
    });

    test('should deny viewer collaborator from modifying spreadsheet', async () => {
      // Arrange
      await apiClient.authenticateUser(unauthenticatedUser);
      const { generateTestSpreadsheet } = await import('../../database/seeds');
      const spreadsheet = generateTestSpreadsheet({ owner_id: regularUser.id });
      await db.seedData({ spreadsheets: [spreadsheet] });

      // Add as viewer
      await db.query(
        `INSERT INTO test_schema.collaborators (spreadsheet_id, user_id, role)
         VALUES ($1, $2, $3)`,
        [spreadsheet.id, unauthenticatedUser.id, 'viewer']
      );

      // Act
      const mutation = GraphQLMutations.updateSpreadsheet(
        spreadsheet.id,
        'Should not work'
      );

      // Mock error response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Read-only access',
              extensions: { code: 'READ_ONLY' },
            },
          ],
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].extensions?.code).toBe('READ_ONLY');
    });
  });

  describe('Session Management', () => {
    test('should create session on login', async () => {
      // Act
      const mutation = GraphQLMutations.login(regularUser.email, regularUser.password);

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            login: {
              user: regularUser,
              token: expect.any(String),
            },
          },
        },
      });

      await apiClient.mutate(mutation);

      // Verify session in database
      const result = await db.query(
        'SELECT * FROM test_schema.sessions WHERE user_id = $1',
        [regularUser.id]
      );
      expect(result.rows.length).toBeGreaterThan(0);
    });

    test('should invalidate session on logout', async () => {
      // Arrange
      await apiClient.authenticateUser(regularUser);

      // Act
      const mutation = GraphQLMutations.logout;

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            logout: { success: true },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.logout.success).toBe(true);

      // Verify session is invalidated
      const result = await db.query(
        'SELECT * FROM test_schema.sessions WHERE user_id = $1 AND expires_at > NOW()',
        [regularUser.id]
      );
      expect(result.rows.length).toBe(0);
    });

    test('should handle multiple concurrent sessions', async () => {
      // Arrange
      const tokens: string[] = [];

      // Create multiple sessions
      for (let i = 0; i < 3; i++) {
        const mutation = GraphQLMutations.login(regularUser.email, regularUser.password);
        mockApp.send = jest.fn().mockResolvedValueOnce({
          body: {
            data: {
              login: {
                user: regularUser,
                token: `token_${i}`,
              },
            },
          },
        });
        const response = await apiClient.mutate(mutation);
        tokens.push(response.data?.login.token);
      }

      // Verify all sessions exist
      const result = await db.query(
        'SELECT * FROM test_schema.sessions WHERE user_id = $1',
        [regularUser.id]
      );
      expect(result.rows.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Password Security', () => {
    test('should hash passwords before storing', async () => {
      // Act
      const dbUser = await db.getUserByEmail(regularUser.email);

      // Assert
      expect(dbUser.password_hash).toBeDefined();
      expect(dbUser.password_hash).not.toBe(regularUser.password);
      expect(dbUser.password_hash.length).toBeGreaterThan(20);
    });

    test('should use strong hashing algorithm (bcrypt)', async () => {
      // Arrange
      const dbUser = await db.getUserByEmail(regularUser.email);

      // Assert - bcrypt hashes start with $2b$ or $2a$
      expect(dbUser.password_hash).toMatch(/^\$2[ab]\$/);
    });

    test('should not expose password in API responses', async () => {
      // Arrange
      await apiClient.authenticateUser(regularUser);

      // Act
      const query = GraphQLQueries.getMe;

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            me: {
              id: regularUser.id,
              email: regularUser.email,
              username: regularUser.username,
            },
          },
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.data?.me.password_hash).toBeUndefined();
      expect(response.data?.me.password).toBeUndefined();
    });
  });

  describe('Rate Limiting for Auth Endpoints', () => {
    test('should enforce rate limit on login attempts', async () => {
      // Arrange
      const maxAttempts = 5;

      // Act - Attempt multiple logins with invalid password
      for (let i = 0; i < maxAttempts; i++) {
        const mutation = GraphQLMutations.login(regularUser.email, 'wrongpassword');
        mockApp.send = jest.fn().mockResolvedValueOnce({
          body: {
            data: null,
            errors: [
              {
                message: 'Invalid email or password',
                extensions: { code: 'INVALID_CREDENTIALS' },
              },
            ],
          },
        });
        await apiClient.mutate(mutation);
      }

      // Next attempt should be rate limited
      const mutation = GraphQLMutations.login(regularUser.email, 'wrongpassword');
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Too many login attempts',
              extensions: { code: 'RATE_LIMIT_EXCEEDED' },
            },
          ],
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors?.[0].extensions?.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    test('should enforce rate limit on registration attempts', async () => {
      // Arrange
      const maxRegistrations = 3;

      // Act - Attempt multiple registrations from same IP
      for (let i = 0; i < maxRegistrations; i++) {
        const mutation = GraphQLMutations.register(
          `user${i}@example.com`,
          `user${i}`,
          'password123!'
        );
        mockApp.send = jest.fn().mockResolvedValueOnce({
          body: { data: { register: { user: {}, token: 'token' } } },
        });
        await apiClient.mutate(mutation);
      }

      // Next registration should be rate limited
      const mutation = GraphQLMutations.register('too@example.com', 'too', 'password123!');
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Too many registration attempts',
              extensions: { code: 'RATE_LIMIT_EXCEEDED' },
            },
          ],
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors?.[0].extensions?.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });
});
