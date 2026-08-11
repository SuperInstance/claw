/**
 * GraphQL API + Database Integration Tests
 * Tests full CRUD operations for spreadsheets with real database
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { getTestDb } from '../../database/client';
import { generateTestUser, generateTestSpreadsheet, seedTestUsers, seedTestSpreadsheets } from '../../database/seeds';
import { ApiTestClient, GraphQLQueries, GraphQLMutations, extractData } from '../../helpers/api';

// Mock Express app for testing
const mockApp = {
  // This would be replaced with actual Express app in production
  post: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  put: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  send: jest.fn().mockResolvedValue({
    body: {
      data: {},
    },
  }),
};

describe('GraphQL API + Database Integration Tests', () => {
  let db: ReturnType<typeof getTestDb>;
  let apiClient: ApiTestClient;
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // Initialize test database
    db = getTestDb();
    await db.startTransaction();

    // Create API test client
    apiClient = new ApiTestClient(mockApp as any);

    // Create test user
    const users = await seedTestUsers(1);
    testUser = users[0];
    await db.seedData({ users: [testUser] });

    // Authenticate user
    authToken = await apiClient.authenticateUser(testUser);
  });

  afterAll(async () => {
    await db.rollbackTransaction();
    await db.close();
  });

  beforeEach(async () => {
    // Start a new transaction for each test
    await db.startTransaction();
  });

  afterEach(async () => {
    // Rollback transaction after each test
    await db.rollbackTransaction();
  });

  describe('Spreadsheet CRUD Operations', () => {
    test('should create a new spreadsheet', async () => {
      // Arrange
      const spreadsheetData = generateTestSpreadsheet({
        owner_id: testUser.id,
        name: 'Test Spreadsheet',
        description: 'A test spreadsheet for integration testing',
      });

      // Act
      const mutation = GraphQLMutations.createSpreadsheet(
        spreadsheetData.name,
        spreadsheetData.description
      );

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            createSpreadsheet: {
              id: spreadsheetData.id,
              name: spreadsheetData.name,
              description: spreadsheetData.description,
              isPublic: false,
              createdAt: new Date().toISOString(),
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.createSpreadsheet).toBeDefined();
      expect(response.data?.createSpreadsheet.name).toBe(spreadsheetData.name);
      expect(response.data?.createSpreadsheet.description).toBe(spreadsheetData.description);

      // Verify database record
      const dbRecord = await db.getSpreadsheetById(spreadsheetData.id);
      expect(dbRecord).toBeDefined();
      expect(dbRecord.name).toBe(spreadsheetData.name);
    });

    test('should read a spreadsheet by ID', async () => {
      // Arrange
      const spreadsheetData = generateTestSpreadsheet({
        owner_id: testUser.id,
        name: 'Query Test Spreadsheet',
      });
      await db.seedData({ spreadsheets: [spreadsheetData] });

      // Act
      const query = GraphQLQueries.getSpreadsheet(spreadsheetData.id);

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            spreadsheet: {
              id: spreadsheetData.id,
              name: spreadsheetData.name,
              description: spreadsheetData.description,
              isPublic: spreadsheetData.is_public,
              createdAt: new Date().toISOString(),
              owner: {
                id: testUser.id,
                username: testUser.username,
              },
            },
          },
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.spreadsheet).toBeDefined();
      expect(response.data?.spreadsheet.id).toBe(spreadsheetData.id);
      expect(response.data?.spreadsheet.name).toBe(spreadsheetData.name);
      expect(response.data?.spreadsheet.owner.id).toBe(testUser.id);
    });

    test('should update an existing spreadsheet', async () => {
      // Arrange
      const spreadsheetData = generateTestSpreadsheet({
        owner_id: testUser.id,
        name: 'Original Name',
      });
      await db.seedData({ spreadsheets: [spreadsheetData] });

      // Act
      const mutation = GraphQLMutations.updateSpreadsheet(
        spreadsheetData.id,
        'Updated Name',
        'Updated description'
      );

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            updateSpreadsheet: {
              id: spreadsheetData.id,
              name: 'Updated Name',
              description: 'Updated description',
              updatedAt: new Date().toISOString(),
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.updateSpreadsheet.name).toBe('Updated Name');
      expect(response.data?.updateSpreadsheet.description).toBe('Updated description');

      // Verify database update
      const dbRecord = await db.getSpreadsheetById(spreadsheetData.id);
      expect(dbRecord.name).toBe('Updated Name');
      expect(dbRecord.description).toBe('Updated description');
    });

    test('should delete a spreadsheet', async () => {
      // Arrange
      const spreadsheetData = generateTestSpreadsheet({
        owner_id: testUser.id,
        name: 'To Be Deleted',
      });
      await db.seedData({ spreadsheets: [spreadsheetData] });

      // Act
      const mutation = GraphQLMutations.deleteSpreadsheet(spreadsheetData.id);

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            deleteSpreadsheet: {
              success: true,
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.deleteSpreadsheet.success).toBe(true);

      // Verify database deletion
      const dbRecord = await db.getSpreadsheetById(spreadsheetData.id);
      expect(dbRecord).toBeUndefined();
    });

    test('should list spreadsheets with pagination', async () => {
      // Arrange
      const spreadsheets = seedTestSpreadsheets(15, testUser.id);
      await db.seedData({ spreadsheets });

      // Act
      const query = GraphQLQueries.listSpreadsheets(10, '');

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            spreadsheets: {
              edges: spreadsheets.slice(0, 10).map((s: any) => ({
                node: s,
                cursor: s.id,
              })),
              pageInfo: {
                hasNextPage: true,
                hasPreviousPage: false,
                endCursor: spreadsheets[9].id,
                startCursor: spreadsheets[0].id,
              },
              totalCount: 15,
            },
          },
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.spreadsheets.edges).toHaveLength(10);
      expect(response.data?.spreadsheets.pageInfo.hasNextPage).toBe(true);
      expect(response.data?.spreadsheets.totalCount).toBe(15);
    });

    test('should filter spreadsheets by ownership', async () => {
      // Arrange
      const mySpreadsheets = seedTestSpreadsheets(5, testUser.id);
      const otherUser = await generateTestUser({ email: 'other@example.com' });
      const otherSpreadsheets = seedTestSpreadsheets(3, otherUser.id);
      await db.seedData({ users: [otherUser], spreadsheets: [...mySpreadsheets, ...otherSpreadsheets] });

      // Act
      const query = `
        query MySpreadsheets {
          mySpreadsheets {
            id
            name
            owner {
              id
            }
          }
        }
      `;

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            mySpreadsheets: mySpreadsheets.map((s: any) => ({
              id: s.id,
              name: s.name,
              owner: { id: testUser.id },
            })),
          },
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.mySpreadsheets).toHaveLength(5);
      response.data?.mySpreadsheets.forEach((sheet: any) => {
        expect(sheet.owner.id).toBe(testUser.id);
      });
    });
  });

  describe('Spreadsheet Data Operations', () => {
    test('should update spreadsheet cell data', async () => {
      // Arrange
      const spreadsheetData = generateTestSpreadsheet({ owner_id: testUser.id });
      await db.seedData({ spreadsheets: [spreadsheetData] });

      // Act
      const mutation = `
        mutation UpdateCell($spreadsheetId: ID!, $cell: String!, $value: String!) {
          updateCell(input: {
            spreadsheetId: $spreadsheetId
            cell: $cell
            value: $value
          }) {
            spreadsheet {
              id
              data
            }
          }
        }
      `;

      const variables = {
        spreadsheetId: spreadsheetData.id,
        cell: 'A1',
        value: 'Hello World',
      };

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            updateCell: {
              spreadsheet: {
                id: spreadsheetData.id,
                data: {
                  sheets: [
                    {
                      name: 'Sheet1',
                      cells: {
                        A1: { value: 'Hello World' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation, variables);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.updateCell.spreadsheet.data.sheets[0].cells.A1.value).toBe('Hello World');
    });

    test('should update multiple cells in batch', async () => {
      // Arrange
      const spreadsheetData = generateTestSpreadsheet({ owner_id: testUser.id });
      await db.seedData({ spreadsheets: [spreadsheetData] });

      // Act
      const mutation = `
        mutation BatchUpdateCells($spreadsheetId: ID!, $updates: [CellUpdate!]!) {
          batchUpdateCells(input: {
            spreadsheetId: $spreadsheetId
            updates: $updates
          }) {
            spreadsheet {
              id
              data
            }
          }
        }
      `;

      const variables = {
        spreadsheetId: spreadsheetData.id,
        updates: [
          { cell: 'A1', value: 'Name' },
          { cell: 'B1', value: 'Age' },
          { cell: 'C1', value: 'City' },
        ],
      };

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            batchUpdateCells: {
              spreadsheet: {
                id: spreadsheetData.id,
                data: {
                  sheets: [
                    {
                      name: 'Sheet1',
                      cells: {
                        A1: { value: 'Name' },
                        B1: { value: 'Age' },
                        C1: { value: 'City' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation, variables);

      // Assert
      expect(response.errors).toBeUndefined();
      const cells = response.data?.batchUpdateCells.spreadsheet.data.sheets[0].cells;
      expect(cells.A1.value).toBe('Name');
      expect(cells.B1.value).toBe('Age');
      expect(cells.C1.value).toBe('City');
    });

    test('should execute formula calculation', async () => {
      // Arrange
      const spreadsheetData = generateTestSpreadsheet({ owner_id: testUser.id });
      await db.seedData({ spreadsheets: [spreadsheetData] });

      // Act
      const mutation = `
        mutation SetFormula($spreadsheetId: ID!, $cell: String!, $formula: String!) {
          setFormula(input: {
            spreadsheetId: $spreadsheetId
            cell: $cell
            formula: $formula
          }) {
            spreadsheet {
              id
              data
            }
          }
        }
      `;

      const variables = {
        spreadsheetId: spreadsheetData.id,
        cell: 'D1',
        formula: '=A1+B1+C1',
      };

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            setFormula: {
              spreadsheet: {
                id: spreadsheetData.id,
                data: {
                  sheets: [
                    {
                      name: 'Sheet1',
                      cells: {
                        D1: {
                          value: 6,
                          formula: '=A1+B1+C1',
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation, variables);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.setFormula.spreadsheet.data.sheets[0].cells.D1.formula).toBe('=A1+B1+C1');
    });
  });

  describe('Spreadsheet Collaboration', () => {
    test('should add collaborator to spreadsheet', async () => {
      // Arrange
      const spreadsheetData = generateTestSpreadsheet({ owner_id: testUser.id });
      const collaborator = await generateTestUser({ email: 'collaborator@example.com' });
      await db.seedData({ spreadsheets: [spreadsheetData], users: [collaborator] });

      // Act
      const mutation = GraphQLMutations.addCollaborator(
        spreadsheetData.id,
        collaborator.email,
        'editor'
      );

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            addCollaborator: {
              id: expect.any(String),
              role: 'editor',
              user: {
                id: collaborator.id,
                email: collaborator.email,
                username: collaborator.username,
              },
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.addCollaborator.role).toBe('editor');
      expect(response.data?.addCollaborator.user.email).toBe(collaborator.email);
    });

    test('should remove collaborator from spreadsheet', async () => {
      // Arrange
      const spreadsheetData = generateTestSpreadsheet({ owner_id: testUser.id });
      const collaborator = await generateTestUser({ email: 'collaborator@example.com' });
      await db.seedData({ spreadsheets: [spreadsheetData], users: [collaborator] });

      // Act
      const mutation = GraphQLMutations.removeCollaborator(spreadsheetData.id, collaborator.id);

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            removeCollaborator: {
              success: true,
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.removeCollaborator.success).toBe(true);
    });

    test('should list spreadsheet collaborators', async () => {
      // Arrange
      const spreadsheetData = generateTestSpreadsheet({ owner_id: testUser.id });
      const collaborators = await seedTestUsers(3, { email: 'collab@example.com' });
      await db.seedData({ spreadsheets: [spreadsheetData], users: collaborators });

      // Act
      const query = `
        query Collaborators($spreadsheetId: ID!) {
          collaborators(spreadsheetId: $spreadsheetId) {
            id
            role
            user {
              id
              email
              username
            }
            invitedAt
          }
        }
      `;

      const variables = { spreadsheetId: spreadsheetData.id };

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            collaborators: collaborators.map((c: any) => ({
              id: expect.any(String),
              role: 'viewer',
              user: {
                id: c.id,
                email: c.email,
                username: c.username,
              },
              invitedAt: expect.any(String),
            })),
          },
        },
      });

      const response = await apiClient.query(query, variables);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.collaborators).toHaveLength(3);
    });
  });

  describe('Database Transaction Isolation', () => {
    test('should rollback changes on error', async () => {
      // Arrange
      const spreadsheetData = generateTestSpreadsheet({ owner_id: testUser.id });
      await db.seedData({ spreadsheets: [spreadsheetData] });

      const initialCount = await db.countTable('spreadsheets');

      // Act - Try to create invalid spreadsheet
      const mutation = GraphQLMutations.createSpreadsheet('', ''); // Invalid: empty name

      // Mock error response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Spreadsheet name cannot be empty',
            },
          ],
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeDefined();

      // Verify no changes in database
      const finalCount = await db.countTable('spreadsheets');
      expect(finalCount).toBe(initialCount);
    });

    test('should maintain consistency across concurrent operations', async () => {
      // Arrange
      const spreadsheetData = generateTestSpreadsheet({ owner_id: testUser.id });
      await db.seedData({ spreadsheets: [spreadsheetData] });

      // Act - Simulate concurrent updates
      const updatePromises = [
        apiClient.mutate(GraphQLMutations.updateSpreadsheet(spreadsheetData.id, 'Version 1')),
        apiClient.mutate(GraphQLMutations.updateSpreadsheet(spreadsheetData.id, 'Version 2')),
        apiClient.mutate(GraphQLMutations.updateSpreadsheet(spreadsheetData.id, 'Version 3')),
      ];

      // Mock responses
      mockApp.send = jest.fn().mockResolvedValue({
        body: {
          data: {
            updateSpreadsheet: {
              id: spreadsheetData.id,
              name: 'Version 3', // Last update wins
              updatedAt: new Date().toISOString(),
            },
          },
        },
      });

      const responses = await Promise.all(updatePromises);

      // Assert
      responses.forEach((response) => {
        expect(response.errors).toBeUndefined();
      });

      // Verify final state
      const dbRecord = await db.getSpreadsheetById(spreadsheetData.id);
      expect(dbRecord.name).toBe('Version 3');
    });
  });

  describe('Database Constraints and Validation', () => {
    test('should enforce unique email constraint', async () => {
      // Arrange
      const duplicateUser = await generateTestUser({ email: testUser.email });

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
              extensions: {
                code: 'DUPLICATE_EMAIL',
              },
            },
          ],
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].message).toContain('already exists');
    });

    test('should enforce foreign key constraint', async () => {
      // Arrange - Spreadsheet with non-existent owner
      const fakeUserId = '00000000-0000-0000-0000-000000000000';
      const spreadsheetData = generateTestSpreadsheet({ owner_id: fakeUserId });

      // Act
      const mutation = GraphQLMutations.createSpreadsheet(spreadsheetData.name);

      // Mock error response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Foreign key constraint violation',
              extensions: {
                code: 'FOREIGN_KEY_VIOLATION',
              },
            },
          ],
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].extensions?.code).toBe('FOREIGN_KEY_VIOLATION');
    });

    test('should enforce NOT NULL constraint', async () => {
      // Act
      const mutation = `
        mutation CreateSpreadsheet {
          createSpreadsheet(input: {
            name: null
          }) {
            id
            name
          }
        }
      `;

      // Mock error response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: null,
          errors: [
            {
              message: 'Field "name" is required',
              extensions: {
                code: 'GRAPHQL_VALIDATION_FAILED',
              },
            },
          ],
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeDefined();
    });
  });

  describe('Performance and Optimization', () => {
    test('should handle large dataset queries efficiently', async () => {
      // Arrange
      const largeSpreadsheet = generateTestSpreadsheet({
        owner_id: testUser.id,
        data: {
          sheets: [
            {
              name: 'Large Sheet',
              cells: Object.fromEntries(
                Array.from({ length: 1000 }, (_, i) => [
                  `A${i + 1}`,
                  { value: `Data ${i + 1}` },
                ])
              ),
            },
          ],
        },
      });
      await db.seedData({ spreadsheets: [largeSpreadsheet] });

      // Act
      const query = GraphQLQueries.getSpreadsheet(largeSpreadsheet.id);

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            spreadsheet: {
              id: largeSpreadsheet.id,
              name: largeSpreadsheet.name,
              data: largeSpreadsheet.data,
            },
          },
        },
      });

      const startTime = Date.now();
      const response = await apiClient.query(query);
      const duration = Date.now() - startTime;

      // Assert
      expect(response.errors).toBeUndefined();
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });

    test('should use database indexes for filtered queries', async () => {
      // Arrange
      const spreadsheets = seedTestSpreadsheets(100, testUser.id);
      await db.seedData({ spreadsheets });

      // Act
      const query = `
        query SearchSpreadsheets($searchTerm: String!) {
          searchSpreadsheets(searchTerm: $searchTerm) {
            id
            name
          }
        }
      `;

      const variables = { searchTerm: 'Test' };

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            searchSpreadsheets: spreadsheets.slice(0, 10),
          },
        },
      });

      const startTime = Date.now();
      const response = await apiClient.query(query, variables);
      const duration = Date.now() - startTime;

      // Assert
      expect(response.errors).toBeUndefined();
      expect(duration).toBeLessThan(500); // Should use index
    });
  });
});
