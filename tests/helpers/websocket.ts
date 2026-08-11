/**
 * WebSocket Test Utilities
 * Provides utilities for testing WebSocket subscriptions
 */

import { WebSocket, WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { TestUser, generateTestJwtPayload } from '../database/seeds';

export interface WebSocketMessage {
  type: string;
  payload?: any;
  error?: string;
}

export class WebSocketTestClient {
  private ws: WebSocket | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private connectionPromise: Promise<void> | null = null;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Connect to WebSocket server with optional authentication
   */
  async connect(user?: TestUser): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    let wsUrl = this.url;
    if (user) {
      const payload = generateTestJwtPayload(user);
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'test-jwt-secret-key-for-integration-tests');
      wsUrl += `?token=${token}`;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        resolve();
      });

      this.ws.on('error', (error) => {
        reject(error);
      });

      this.ws.on('message', (data: string) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          const handler = this.messageHandlers.get(message.type);
          if (handler) {
            handler(message.payload);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      this.ws.on('close', () => {
        this.messageHandlers.clear();
      });
    });

    await this.connectionPromise;
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connectionPromise = null;
    }
  }

  /**
   * Subscribe to a GraphQL subscription
   */
  async subscribe(query: string, variables?: Record<string, any>): Promise<void> {
    this.ensureConnected();

    const message = {
      type: 'subscription_start',
      payload: {
        query,
        variables,
      },
    };

    this.ws!.send(JSON.stringify(message));
  }

  /**
   * Unsubscribe from a subscription
   */
  unsubscribe(subscriptionId: string): void {
    this.ensureConnected();

    const message = {
      type: 'subscription_end',
      payload: {
        id: subscriptionId,
      },
    };

    this.ws!.send(JSON.stringify(message));
  }

  /**
   * Send a message through WebSocket
   */
  send(type: string, payload?: any): void {
    this.ensureConnected();

    const message: WebSocketMessage = {
      type,
      payload,
    };

    this.ws!.send(JSON.stringify(message));
  }

  /**
   * Register a message handler
   */
  on(type: string, handler: (data: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Remove a message handler
   */
  off(type: string): void {
    this.messageHandlers.delete(type);
  }

  /**
   * Wait for a specific message type
   */
  async waitForMessage(
    type: string,
    timeout = 5000
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.off(type);
        reject(new Error(`Timeout waiting for message type: ${type}`));
      }, timeout);

      this.on(type, (data) => {
        clearTimeout(timer);
        this.off(type);
        resolve(data);
      });
    });
  }

  /**
   * Wait for multiple messages of a type
   */
  async waitForMessages(
    type: string,
    count: number,
    timeout = 5000
  ): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const messages: any[] = [];
      const timer = setTimeout(() => {
        this.off(type);
        reject(new Error(`Timeout waiting for ${count} messages of type: ${type}`));
      }, timeout);

      this.on(type, (data) => {
        messages.push(data);
        if (messages.length === count) {
          clearTimeout(timer);
          this.off(type);
          resolve(messages);
        }
      });
    });
  }

  /**
   * Get connection state
   */
  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Ensure WebSocket is connected
   */
  private ensureConnected(): void {
    if (!this.isConnected()) {
      throw new Error('WebSocket is not connected');
    }
  }
}

/**
 * WebSocket test server for integration testing
 */
export class WebSocketTestServer {
  private wss: WebSocketServer | null = null;
  private port: number;
  private server: any = null;

  constructor(port = 0) {
    // Port 0 lets the OS assign a random available port
    this.port = port;
  }

  /**
   * Start the test WebSocket server
   */
  async start(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Create an HTTP server to wrap WebSocket
        const http = require('http');
        this.server = http.createServer();

        this.wss = new WebSocketServer({ server: this.server });

        this.wss.on('connection', (ws: WebSocket, req) => {
          // Parse authentication token from query params
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const token = url.searchParams.get('token');

          if (token) {
            try {
              const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'test-jwt-secret-key-for-integration-tests'
              );
              (ws as any).user = decoded;
            } catch (error) {
              ws.close(1008, 'Invalid token');
              return;
            }
          }

          ws.on('message', (data: string) => {
            try {
              const message: WebSocketMessage = JSON.parse(data.toString());
              this.handleMessage(ws, message);
            } catch (error) {
              ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }));
            }
          });
        });

        this.server.listen(this.port, () => {
          const address = this.server.address();
          const port = typeof address === 'string' ? parseInt(address.split(':')[1]) : address.port;
          this.port = port;
          const wsUrl = `ws://localhost:${this.port}`;
          resolve(wsUrl);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(ws: WebSocket, message: WebSocketMessage): void {
    switch (message.type) {
      case 'subscription_start':
        // Echo back subscription confirmation
        ws.send(JSON.stringify({
          type: 'subscription_started',
          payload: { id: message.payload?.query || 'sub_1' },
        }));
        break;

      case 'subscription_end':
        ws.send(JSON.stringify({
          type: 'subscription_ended',
          payload: { id: message.payload?.id },
        }));
        break;

      case 'echo':
        ws.send(JSON.stringify({
          type: 'echo_response',
          payload: message.payload,
        }));
        break;

      default:
        ws.send(JSON.stringify({
          type: 'error',
          error: `Unknown message type: ${message.type}`,
        }));
    }
  }

  /**
   * Broadcast a message to all connected clients
   */
  broadcast(type: string, payload?: any): void {
    if (!this.wss) {
      return;
    }

    const message: WebSocketMessage = { type, payload };
    const data = JSON.stringify(message);

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  /**
   * Get number of connected clients
   */
  getConnectedClientsCount(): number {
    return this.wss?.clients.size || 0;
  }

  /**
   * Stop the test WebSocket server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close(() => {
          if (this.server) {
            this.server.close(() => {
              resolve();
            });
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

/**
 * GraphQL subscription builders
 */
export const GraphQLSubscriptions = {
  // Spreadsheet updates subscription
  spreadsheetUpdated: (spreadsheetId: string) => `
    subscription SpreadsheetUpdated {
      spreadsheetUpdated(spreadsheetId: "${spreadsheetId}") {
        id
        name
        data
        updatedBy {
          id
          username
        }
        timestamp
      }
    }
  `,

  // User activity subscription
  userActivity: (userId: string) => `
    subscription UserActivity {
      userActivity(userId: "${userId}") {
        type
        spreadsheetId
        timestamp
      }
    }
  `,

  // Analytics updates subscription
  analyticsUpdated: (spreadsheetId: string) => `
    subscription AnalyticsUpdated {
      analyticsUpdated(spreadsheetId: "${spreadsheetId}") {
        spreadsheetId
        views
        uniqueUsers
        timestamp
      }
    }
  `,

  // Collaborator presence subscription
  collaboratorPresence: (spreadsheetId: string) => `
    subscription CollaboratorPresence {
      collaboratorPresence(spreadsheetId: "${spreadsheetId}") {
        userId
        username
        status
        lastSeen
      }
    }
  `,

  // New comment subscription
  newComment: (postId: string) => `
    subscription NewComment {
      newComment(postId: "${postId}") {
        id
        content
        createdAt
        author {
          id
          username
        }
      }
    }
  `,

  // Real-time collaboration updates
  collaborationUpdates: (spreadsheetId: string) => `
    subscription CollaborationUpdates {
      collaborationUpdates(spreadsheetId: "${spreadsheetId}") {
        type
        cell
        value
        userId
        timestamp
      }
    }
  `,
};

/**
 * Assert WebSocket connection state
 */
export function assertWebSocketConnected(client: WebSocketTestClient): void {
  expect(client.isConnected()).toBe(true);
}

/**
 * Assert WebSocket disconnection
 */
export function assertWebSocketDisconnected(client: WebSocketTestClient): void {
  expect(client.isConnected()).toBe(false);
}

/**
 * Assert WebSocket message received
 */
export async function assertMessageReceived(
  client: WebSocketTestClient,
  type: string,
  timeout = 5000
): Promise<any> {
  return client.waitForMessage(type, timeout);
}

/**
 * Create a pair of connected WebSocket clients for testing
 */
export async function createWebSocketPair(
  serverUrl: string,
  user1?: TestUser,
  user2?: TestUser
): Promise<[WebSocketTestClient, WebSocketTestClient]> {
  const client1 = new WebSocketTestClient(serverUrl);
  const client2 = new WebSocketTestClient(serverUrl);

  if (user1) await client1.connect(user1);
  if (user2) await client2.connect(user2);

  return [client1, client2];
}
