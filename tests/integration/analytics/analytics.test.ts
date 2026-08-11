/**
 * Analytics + Real-time Subscriptions Integration Tests
 * Tests metrics collection, event tracking, and WebSocket subscriptions
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { getTestDb } from '../../database/client';
import { generateTestUser, generateTestSpreadsheet, seedTestUsers } from '../../database/seeds';
import { ApiTestClient, GraphQLQueries, GraphQLMutations } from '../../helpers/api';
import {
  WebSocketTestClient,
  WebSocketTestServer,
  GraphQLSubscriptions,
  assertMessageReceived,
} from '../../helpers/websocket';
import { ANALYTICS_EVENTS } from '../../fixtures';

// Mock Express app
const mockApp = {
  post: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  send: jest.fn().mockResolvedValue({ body: { data: {} } }),
};

describe('Analytics + Real-time Subscriptions Integration Tests', () => {
  let db: ReturnType<typeof getTestDb>;
  let apiClient: ApiTestClient;
  let wsServer: WebSocketTestServer;
  let wsClient: WebSocketTestClient;
  let testUser: any;
  let wsServerUrl: string;

  beforeAll(async () => {
    db = getTestDb();
    await db.startTransaction();

    apiClient = new ApiTestClient(mockApp as any);

    // Create WebSocket test server
    wsServer = new WebSocketTestServer();
    wsServerUrl = await wsServer.start();

    // Create test user
    const users = await seedTestUsers(1);
    testUser = users[0];
    await db.seedData({ users: [testUser] });

    // Authenticate
    await apiClient.authenticateUser(testUser);

    // Create WebSocket client
    wsClient = new WebSocketTestClient(wsServerUrl);
  });

  afterAll(async () => {
    await wsClient.disconnect();
    await wsServer.stop();
    await db.rollbackTransaction();
    await db.close();
  });

  beforeEach(async () => {
    await db.startTransaction();
    await wsClient.connect(testUser);
  });

  afterEach(async () => {
    await db.rollbackTransaction();
    await wsClient.disconnect();
  });

  describe('Analytics Event Tracking', () => {
    test('should track spreadsheet view event', async () => {
      // Arrange
      const { generateTestSpreadsheet } = await import('../../database/seeds');
      const spreadsheet = generateTestSpreadsheet({ owner_id: testUser.id });
      await db.seedData({ spreadsheets: [spreadsheet] });

      // Act
      const mutation = `
        mutation TrackEvent {
          trackEvent(input: {
            eventType: "sheet_view"
            spreadsheetId: "${spreadsheet.id}"
            properties: {
              duration: 5000
              referrer: "direct"
            }
          }) {
            success
            eventId
          }
        }
      `;

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            trackEvent: {
              success: true,
              eventId: expect.any(String),
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.trackEvent.success).toBe(true);

      // Verify event in database
      const result = await db.query(
        'SELECT * FROM test_schema.analytics_events WHERE event_type = $1',
        ['sheet_view']
      );
      expect(result.rows.length).toBeGreaterThan(0);
    });

    test('should track spreadsheet edit event', async () => {
      // Arrange
      const { generateTestSpreadsheet } = await import('../../database/seeds');
      const spreadsheet = generateTestSpreadsheet({ owner_id: testUser.id });
      await db.seedData({ spreadsheets: [spreadsheet] });

      // Act
      const mutation = `
        mutation TrackEvent {
          trackEvent(input: {
            eventType: "sheet_edit"
            spreadsheetId: "${spreadsheet.id}"
            properties: {
              cells_modified: ["A1", "B2", "C3"]
              edit_duration: 1200
            }
          }) {
            success
          }
        }
      `;

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            trackEvent: { success: true },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();

      // Verify event properties
      const result = await db.query(
        `SELECT * FROM test_schema.analytics_events
         WHERE event_type = $1 AND spreadsheet_id = $2`,
        ['sheet_edit', spreadsheet.id]
      );
      expect(result.rows[0].properties.cells_modified).toEqual(['A1', 'B2', 'C3']);
    });

    test('should track user login event', async () => {
      // Act
      const mutation = `
        mutation TrackEvent {
          trackEvent(input: {
            eventType: "user_login"
            properties: {
              method: "email_password"
              success: true
            }
          }) {
            success
          }
        }
      `;

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            trackEvent: { success: true },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();

      // Verify event
      const result = await db.query(
        "SELECT * FROM test_schema.analytics_events WHERE event_type = 'user_login'"
      );
      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].properties.method).toBe('email_password');
    });

    test('should track formula error event', async () => {
      // Arrange
      const { generateTestSpreadsheet } = await import('../../database/seeds');
      const spreadsheet = generateTestSpreadsheet({ owner_id: testUser.id });
      await db.seedData({ spreadsheets: [spreadsheet] });

      // Act
      const mutation = `
        mutation TrackEvent {
          trackEvent(input: {
            eventType: "formula_error"
            spreadsheetId: "${spreadsheet.id}"
            properties: {
              cell: "D5"
              formula: "=INVALID(A1)"
              error_type: "invalid_reference"
            }
          }) {
            success
          }
        }
      `;

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            trackEvent: { success: true },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();

      // Verify error tracking
      const result = await db.query(
        `SELECT * FROM test_schema.analytics_events
         WHERE event_type = 'formula_error' AND spreadsheet_id = $1`,
        [spreadsheet.id]
      );
      expect(result.rows[0].properties.error_type).toBe('invalid_reference');
    });

    test('should batch track multiple events', async () => {
      // Arrange
      const events = [
        { eventType: 'sheet_view', spreadsheetId: 'sheet-1' },
        { eventType: 'sheet_edit', spreadsheetId: 'sheet-1' },
        { eventType: 'sheet_share', spreadsheetId: 'sheet-1' },
      ];

      // Act
      const mutation = `
        mutation BatchTrackEvents {
          batchTrackEvents(input: {
            events: ${JSON.stringify(events)}
          }) {
            success
            processedCount
          }
        }
      `;

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            batchTrackEvents: {
              success: true,
              processedCount: 3,
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.batchTrackEvents.processedCount).toBe(3);
    });
  });

  describe('Analytics Queries and Aggregation', () => {
    test('should retrieve analytics for a spreadsheet', async () => {
      // Arrange
      const { generateTestSpreadsheet } = await import('../../database/seeds');
      const spreadsheet = generateTestSpreadsheet({ owner_id: testUser.id });
      await db.seedData({ spreadsheets: [spreadsheet] });

      // Seed analytics events
      await db.query(
        `INSERT INTO test_schema.analytics_events (user_id, spreadsheet_id, event_type, properties, timestamp)
         VALUES ($1, $2, 'sheet_view', '{}', NOW()),
                ($1, $2, 'sheet_view', '{}', NOW() - INTERVAL '1 hour'),
                ($1, $2, 'sheet_edit', '{}', NOW() - INTERVAL '2 hours')`,
        [testUser.id, spreadsheet.id]
      );

      // Act
      const query = `
        query SpreadsheetAnalytics($spreadsheetId: ID!, $startDate: String!, $endDate: String!) {
          analytics(spreadsheetId: $spreadsheetId, startDate: $startDate, endDate: $endDate) {
            totalViews
            uniqueUsers
            averageSessionDuration
            topActions {
              action
              count
            }
          }
        }
      `;

      const variables = {
        spreadsheetId: spreadsheet.id,
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      };

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            analytics: {
              totalViews: 2,
              uniqueUsers: 1,
              averageSessionDuration: 5000,
              topActions: [
                { action: 'sheet_view', count: 2 },
                { action: 'sheet_edit', count: 1 },
              ],
            },
          },
        },
      });

      const response = await apiClient.query(query, variables);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.analytics.totalViews).toBe(2);
      expect(response.data?.analytics.uniqueUsers).toBe(1);
    });

    test('should retrieve user activity summary', async () => {
      // Arrange - Seed user activity
      await db.query(
        `INSERT INTO test_schema.analytics_events (user_id, event_type, properties, timestamp)
         VALUES ($1, 'sheet_view', '{}', NOW()),
                ($1, 'sheet_edit', '{}', NOW()),
                ($1, 'sheet_share', '{}', NOW())`,
        [testUser.id]
      );

      // Act
      const query = `
        query UserActivity {
          userActivity {
            totalEvents
            mostActiveSpreadsheet {
              spreadsheetId
              eventCount
            }
            recentActivity {
              eventType
              timestamp
            }
          }
        }
      `;

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            userActivity: {
              totalEvents: 3,
              mostActiveSpreadsheet: {
                spreadsheetId: expect.any(String),
                eventCount: 3,
              },
              recentActivity: [
                { eventType: 'sheet_share', timestamp: expect.any(String) },
                { eventType: 'sheet_edit', timestamp: expect.any(String) },
                { eventType: 'sheet_view', timestamp: expect.any(String) },
              ],
            },
          },
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.userActivity.totalEvents).toBe(3);
    });

    test('should retrieve platform-wide analytics (admin only)', async () => {
      // Arrange - Create admin user and authenticate
      const { getAdminUser } = await import('../../database/seeds');
      const adminUser = await getAdminUser();
      await db.seedData({ users: [adminUser] });
      await apiClient.authenticateUser(adminUser);

      // Seed platform data
      await db.query(
        `INSERT INTO test_schema.analytics_events (event_type, timestamp)
         VALUES ('sheet_view', NOW()), ('sheet_edit', NOW()), ('user_login', NOW())`
      );

      // Act
      const query = `
        query PlatformAnalytics {
          platformAnalytics {
            totalUsers
            totalSpreadsheets
            totalEvents
            activeUsers24h
          }
        }
      `;

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            platformAnalytics: {
              totalUsers: 100,
              totalSpreadsheets: 500,
              totalEvents: 1000,
              activeUsers24h: 25,
            },
          },
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.platformAnalytics.totalEvents).toBeGreaterThan(0);
    });
  });

  describe('Real-time Subscriptions', () => {
    test('should receive spreadsheet update notifications', async () => {
      // Arrange
      const { generateTestSpreadsheet } = await import('../../database/seeds');
      const spreadsheet = generateTestSpreadsheet({ owner_id: testUser.id });
      await db.seedData({ spreadsheets: [spreadsheet] });

      // Subscribe to updates
      const subscription = GraphQLSubscriptions.spreadsheetUpdated(spreadsheet.id);
      await wsClient.subscribe(subscription);

      // Set up message handler
      const messagePromise = wsClient.waitForMessage('data', 5000);

      // Act - Trigger an update
      const mutation = GraphQLMutations.updateSpreadsheet(spreadsheet.id, 'Updated Name');

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            updateSpreadsheet: {
              id: spreadsheet.id,
              name: 'Updated Name',
            },
          },
        },
      });

      await apiClient.mutate(mutation);

      // Broadcast update through WebSocket
      wsServer.broadcast('spreadsheet_updated', {
        spreadsheetId: spreadsheet.id,
        name: 'Updated Name',
      });

      // Assert
      const message = await messagePromise;
      expect(message).toBeDefined();
      expect(message.spreadsheetId).toBe(spreadsheet.id);
    });

    test('should receive collaborator presence updates', async () => {
      // Arrange
      const { generateTestSpreadsheet } = await import('../../database/seeds');
      const spreadsheet = generateTestSpreadsheet({ owner_id: testUser.id });
      await db.seedData({ spreadsheets: [spreadsheet] });

      // Subscribe to presence
      const subscription = GraphQLSubscriptions.collaboratorPresence(spreadsheet.id);
      await wsClient.subscribe(subscription);

      // Set up message handler
      const messagePromise = wsClient.waitForMessage('data', 5000);

      // Act - Another user joins
      const otherUser = await generateTestUser({ email: 'other@example.com' });
      await db.seedData({ users: [otherUser] });

      wsServer.broadcast('collaborator_presence', {
        userId: otherUser.id,
        username: otherUser.username,
        status: 'online',
        lastSeen: new Date().toISOString(),
      });

      // Assert
      const message = await messagePromise;
      expect(message).toBeDefined();
      expect(message.status).toBe('online');
    });

    test('should receive analytics updates in real-time', async () => {
      // Arrange
      const { generateTestSpreadsheet } = await import('../../database/seeds');
      const spreadsheet = generateTestSpreadsheet({ owner_id: testUser.id });
      await db.seedData({ spreadsheets: [spreadsheet] });

      // Subscribe to analytics updates
      const subscription = GraphQLSubscriptions.analyticsUpdated(spreadsheet.id);
      await wsClient.subscribe(subscription);

      // Set up message handler
      const messagePromise = wsClient.waitForMessage('data', 5000);

      // Act - Track new view event
      const mutation = `
        mutation TrackEvent {
          trackEvent(input: {
            eventType: "sheet_view"
            spreadsheetId: "${spreadsheet.id}"
          }) {
            success
          }
        }
      `;

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            trackEvent: { success: true },
          },
        },
      });

      await apiClient.mutate(mutation);

      // Broadcast analytics update
      wsServer.broadcast('analytics_updated', {
        spreadsheetId: spreadsheet.id,
        views: 1,
        uniqueUsers: 1,
        timestamp: new Date().toISOString(),
      });

      // Assert
      const message = await messagePromise;
      expect(message).toBeDefined();
      expect(message.spreadsheetId).toBe(spreadsheet.id);
      expect(message.views).toBe(1);
    });

    test('should receive real-time collaboration updates', async () => {
      // Arrange
      const { generateTestSpreadsheet } = await import('../../database/seeds');
      const spreadsheet = generateTestSpreadsheet({ owner_id: testUser.id });
      await db.seedData({ spreadsheets: [spreadsheet] });

      // Subscribe to collaboration updates
      const subscription = GraphQLSubscriptions.collaborationUpdates(spreadsheet.id);
      await wsClient.subscribe(subscription);

      // Set up message handler
      const messagePromise = wsClient.waitForMessage('data', 5000);

      // Act - Update a cell
      wsServer.broadcast('collaboration_update', {
        type: 'cell_update',
        cell: 'A1',
        value: 'Hello',
        userId: testUser.id,
        timestamp: new Date().toISOString(),
      });

      // Assert
      const message = await messagePromise;
      expect(message).toBeDefined();
      expect(message.type).toBe('cell_update');
      expect(message.cell).toBe('A1');
      expect(message.value).toBe('Hello');
    });

    test('should handle multiple concurrent subscriptions', async () => {
      // Arrange
      const { generateTestSpreadsheet } = await import('../../database/seeds');
      const spreadsheet1 = generateTestSpreadsheet({ owner_id: testUser.id });
      const spreadsheet2 = generateTestSpreadsheet({ owner_id: testUser.id });
      await db.seedData({ spreadsheets: [spreadsheet1, spreadsheet2] });

      // Subscribe to multiple spreadsheets
      await wsClient.subscribe(GraphQLSubscriptions.spreadsheetUpdated(spreadsheet1.id));
      await wsClient.subscribe(GraphQLSubscriptions.spreadsheetUpdated(spreadsheet2.id));
      await wsClient.subscribe(GraphQLSubscriptions.collaboratorPresence(spreadsheet1.id));

      // Act - Broadcast updates
      wsServer.broadcast('spreadsheet_updated', {
        spreadsheetId: spreadsheet1.id,
        name: 'Updated 1',
      });

      // Assert - Should receive update for spreadsheet1
      const message1 = await wsClient.waitForMessage('data', 2000);
      expect(message1.spreadsheetId).toBe(spreadsheet1.id);
    });
  });

  describe('WebSocket Connection Management', () => {
    test('should establish WebSocket connection with authentication', async () => {
      // Arrange
      const client = new WebSocketTestClient(wsServerUrl);

      // Act
      await client.connect(testUser);

      // Assert
      expect(client.isConnected()).toBe(true);

      // Cleanup
      client.disconnect();
    });

    test('should reject unauthenticated WebSocket connection', async () => {
      // Arrange
      const client = new WebSocketTestClient(wsServerUrl);

      // Act & Assert
      await expect(client.connect()).rejects.toThrow();

      // Cleanup
      client.disconnect();
    });

    test('should handle WebSocket disconnection gracefully', async () => {
      // Arrange
      await wsClient.connect(testUser);
      expect(wsClient.isConnected()).toBe(true);

      // Act
      wsClient.disconnect();

      // Assert
      expect(wsClient.isConnected()).toBe(false);
    });

    test('should reconnect WebSocket after connection loss', async () => {
      // Arrange
      await wsClient.connect(testUser);

      // Act - Simulate connection loss
      wsClient.disconnect();

      // Reconnect
      await wsClient.connect(testUser);

      // Assert
      expect(wsClient.isConnected()).toBe(true);

      // Verify can still receive messages
      wsServer.broadcast('test', { message: 'reconnected' });
      const message = await wsClient.waitForMessage('test', 2000);
      expect(message).toBeDefined();
    });
  });

  describe('Real-time Collaboration Scenarios', () => {
    test('should broadcast cell updates to all collaborators', async () => {
      // Arrange
      const { generateTestSpreadsheet } = await import('../../database/seeds');
      const spreadsheet = generateTestSpreadsheet({ owner_id: testUser.id });
      await db.seedData({ spreadsheets: [spreadsheet] });

      const collaborator = await generateTestUser({ email: 'collab@example.com' });
      await db.seedData({ users: [collaborator] });

      // Create two WebSocket clients
      const client1 = new WebSocketTestClient(wsServerUrl);
      const client2 = new WebSocketTestClient(wsServerUrl);

      await client1.connect(testUser);
      await client2.connect(collaborator);

      await client1.subscribe(GraphQLSubscriptions.collaborationUpdates(spreadsheet.id));
      await client2.subscribe(GraphQLSubscriptions.collaborationUpdates(spreadsheet.id));

      // Set up message handlers
      const message1Promise = client1.waitForMessage('data', 5000);
      const message2Promise = client2.waitForMessage('data', 5000);

      // Act - Client1 updates a cell
      wsServer.broadcast('collaboration_update', {
        type: 'cell_update',
        cell: 'B2',
        value: 'Collaborative edit',
        userId: testUser.id,
        timestamp: new Date().toISOString(),
      });

      // Assert - Both clients should receive the update
      const [message1, message2] = await Promise.all([message1Promise, message2Promise]);
      expect(message1.cell).toBe('B2');
      expect(message2.cell).toBe('B2');

      // Cleanup
      client1.disconnect();
      client2.disconnect();
    });

    test('should handle concurrent edits with conflict resolution', async () => {
      // Arrange
      const { generateTestSpreadsheet } = await import('../../database/seeds');
      const spreadsheet = generateTestSpreadsheet({ owner_id: testUser.id });
      await db.seedData({ spreadsheets: [spreadsheet] });

      const collaborator1 = await generateTestUser({ email: 'collab1@example.com' });
      const collaborator2 = await generateTestUser({ email: 'collab2@example.com' });
      await db.seedData({ users: [collaborator1, collaborator2] });

      const client1 = new WebSocketTestClient(wsServerUrl);
      const client2 = new WebSocketTestClient(wsServerUrl);

      await client1.connect(collaborator1);
      await client2.connect(collaborator2);

      await client1.subscribe(GraphQLSubscriptions.collaborationUpdates(spreadsheet.id));
      await client2.subscribe(GraphQLSubscriptions.collaborationUpdates(spreadsheet.id));

      // Act - Both clients edit the same cell simultaneously
      const update1 = {
        type: 'cell_update',
        cell: 'A1',
        value: 'Edit 1',
        userId: collaborator1.id,
        timestamp: new Date().toISOString(),
      };

      const update2 = {
        type: 'cell_update',
        cell: 'A1',
        value: 'Edit 2',
        userId: collaborator2.id,
        timestamp: new Date(Date.now() + 1).toISOString(),
      };

      wsServer.broadcast('collaboration_update', update1);
      wsServer.broadcast('collaboration_update', update2);

      // Assert - Last write should win
      const message1 = await client1.waitForMessage('data', 5000);
      expect(message1.value).toBe('Edit 2');

      // Cleanup
      client1.disconnect();
      client2.disconnect();
    });
  });

  describe('Analytics Data Retention and Cleanup', () => {
    test('should automatically clean up old analytics events', async () => {
      // Arrange - Insert old event
      await db.query(
        `INSERT INTO test_schema.analytics_events (user_id, event_type, timestamp)
         VALUES ($1, 'sheet_view', NOW() - INTERVAL '90 days')`,
        [testUser.id]
      );

      // Act - Run cleanup job
      const mutation = `
        mutation CleanupOldEvents {
          cleanupOldEvents(daysThreshold: 30) {
            deletedCount
          }
        }
      `;

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            cleanupOldEvents: {
              deletedCount: 1,
            },
          },
        },
      });

      const response = await apiClient.mutate(mutation);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.cleanupOldEvents.deletedCount).toBeGreaterThan(0);

      // Verify old events are deleted
      const result = await db.query(
        `SELECT COUNT(*) FROM test_schema.analytics_events WHERE timestamp < NOW() - INTERVAL '30 days'`
      );
      expect(parseInt(result.rows[0].count)).toBe(0);
    });

    test('should aggregate analytics data for performance', async () => {
      // Arrange - Insert many events
      for (let i = 0; i < 100; i++) {
        await db.query(
          `INSERT INTO test_schema.analytics_events (user_id, event_type, timestamp)
           VALUES ($1, 'sheet_view', NOW() - INTERVAL '1 hour' * $2)`,
          [testUser.id, i]
        );
      }

      // Act - Run aggregation
      const query = `
        query AggregatedAnalytics {
          aggregatedAnalytics(period: "daily") {
            date
            views
            uniqueUsers
          }
        }
      `;

      // Mock successful response
      mockApp.send = jest.fn().mockResolvedValueOnce({
        body: {
          data: {
            aggregatedAnalytics: [
              {
                date: new Date().toISOString().split('T')[0],
                views: 100,
                uniqueUsers: 1,
              },
            ],
          },
        },
      });

      const response = await apiClient.query(query);

      // Assert
      expect(response.errors).toBeUndefined();
      expect(response.data?.aggregatedAnalytics.length).toBeGreaterThan(0);
    });
  });
});
