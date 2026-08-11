/**
 * Spreadsheet Moment - Durable Objects for Real-time Collaboration
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 *
 * Collaboration Durable Object
 * Manages real-time collaboration on spreadsheets with presence awareness
 */

import {
  DurableObject,
} from 'cloudflare:workers';

/**
 * Cell update
 */
interface CellUpdate {
  spreadsheetId: string;
  cell: {
    row: number;
    column: number;
    value: string;
    formula?: string;
    type: string;
  };
  userId: string;
  timestamp: number;
}

/**
 * User presence
 */
interface UserPresence {
  userId: string;
  name: string;
  avatar: string;
  cursor?: {
    row: number;
    column: number;
  };
  selection?: {
    startRow: number;
    startColumn: number;
    endRow: number;
    endColumn: number;
  };
  color: string;
  lastSeen: number;
}

/**
 * Collaboration message
 */
interface CollaborationMessage {
  type: 'cell_update' | 'presence' | 'cursor' | 'selection' | 'user_joined' | 'user_left';
  data: any;
  userId: string;
  timestamp: number;
}

/**
 * Collaboration Durable Object
 * Manages real-time collaboration for a single spreadsheet
 */
export class CollaborationObject extends DurableObject {
  private sessions: Set<WebSocket> = new Set();
  private presence: Map<string, UserPresence> = new Map();
  private cellUpdates: CellUpdate[] = [];
  private readonly maxCellUpdates = 1000;

  constructor(state: any, env: any) {
    super(state, env);

    // Set up alarm for cleanup
    this.ctx.setAlarm(Date.now() + 60000).catch(() => {
      // Ignore alarm errors
    });
  }

  /**
   * Handle WebSocket connections
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response('Missing userId', { status: 400 });
    }

    // Upgrade to WebSocket
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept the WebSocket
    server.accept();

    // Add to sessions
    this.sessions.add(server);

    // Handle incoming messages
    server.addEventListener('message', async (event) => {
      try {
        const message: CollaborationMessage = JSON.parse(event.data as string);
        await this.handleMessage(server, userId, message);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    // Handle disconnection
    server.addEventListener('close', async () => {
      await this.handleDisconnect(server, userId);
    });

    // Handle errors
    server.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  /**
   * Handle incoming messages from clients
   */
  private async handleMessage(
    socket: WebSocket,
    userId: string,
    message: CollaborationMessage
  ): Promise<void> {
    switch (message.type) {
      case 'cell_update':
        await this.handleCellUpdate(userId, message.data);
        break;
      case 'presence':
        await this.handlePresence(userId, message.data);
        break;
      case 'cursor':
        await this.handleCursor(userId, message.data);
        break;
      case 'selection':
        await this.handleSelection(userId, message.data);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  /**
   * Handle cell update
   */
  private async handleCellUpdate(
    userId: string,
    data: CellUpdate
  ): Promise<void> {
    // Store update
    this.cellUpdates.push(data);
    if (this.cellUpdates.length > this.maxCellUpdates) {
      this.cellUpdates.shift();
    }

    // Persist to storage
    await this.storage.put({
      type: 'cell_update',
      data,
      timestamp: Date.now(),
    });

    // Broadcast to all other clients
    this.broadcast({
      type: 'cell_update',
      data,
      userId,
      timestamp: Date.now(),
    }, userId);
  }

  /**
   * Handle user presence
   */
  private async handlePresence(
    userId: string,
    data: Partial<UserPresence>
  ): Promise<void> {
    const presence: UserPresence = {
      userId,
      name: data.name || '',
      avatar: data.avatar || '',
      color: this.getUserColor(userId),
      lastSeen: Date.now(),
      ...data,
    };

    this.presence.set(userId, presence);

    // Broadcast to all other clients
    this.broadcast({
      type: 'presence',
      data: presence,
      userId,
      timestamp: Date.now(),
    }, userId);

    // Send current presence to new user
    this.sendToUser(userId, {
      type: 'user_joined',
      data: Array.from(this.presence.values()),
      timestamp: Date.now(),
    });
  }

  /**
   * Handle cursor movement
   */
  private async handleCursor(
    userId: string,
    data: { row: number; column: number }
  ): Promise<void> {
    const presence = this.presence.get(userId);
    if (presence) {
      presence.cursor = data;
      presence.lastSeen = Date.now();

      this.broadcast({
        type: 'cursor',
        data: { userId, ...data },
        userId,
        timestamp: Date.now(),
      }, userId);
    }
  }

  /**
   * Handle selection change
   */
  private async handleSelection(
    userId: string,
    data: {
      startRow: number;
      startColumn: number;
      endRow: number;
      endColumn: number;
    }
  ): Promise<void> {
    const presence = this.presence.get(userId);
    if (presence) {
      presence.selection = data;
      presence.lastSeen = Date.now();

      this.broadcast({
        type: 'selection',
        data: { userId, ...data },
        userId,
        timestamp: Date.now(),
      }, userId);
    }
  }

  /**
   * Handle disconnection
   */
  private async handleDisconnect(
    socket: WebSocket,
    userId: string
  ): Promise<void> {
    // Remove session
    this.sessions.delete(socket);

    // Remove presence
    this.presence.delete(userId);

    // Broadcast to remaining users
    this.broadcast({
      type: 'user_left',
      data: { userId },
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast message to all connected clients
   */
  private broadcast(message: any, excludeUserId?: string): void {
    const serialized = JSON.stringify(message);

    for (const socket of this.sessions) {
      try {
        socket.send(serialized);
      } catch (error) {
        console.error('Error broadcasting:', error);
        this.sessions.delete(socket);
      }
    }
  }

  /**
   * Send message to specific user
   */
  private sendToUser(userId: string, message: any): void {
    const serialized = JSON.stringify(message);
    const presence = this.presence.get(userId);

    if (presence) {
      // Find the socket for this user
      for (const socket of this.sessions) {
        try {
          socket.send(serialized);
          break;
        } catch (error) {
          this.sessions.delete(socket);
        }
      }
    }
  }

  /**
   * Get consistent color for user
   */
  private getUserColor(userId: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];
    const hash = userId.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Handle alarm for cleanup
   */
  async alarm(): Promise<void> {
    const now = Date.now();
    const timeout = 300000; // 5 minutes

    // Clean up inactive presence
    for (const [userId, presence] of this.presence.entries()) {
      if (now - presence.lastSeen > timeout) {
        this.presence.delete(userId);
        this.broadcast({
          type: 'user_left',
          data: { userId },
          timestamp: now,
        });
      }
    }

    // Set next alarm
    this.ctx.setAlarm(Date.now() + 60000).catch(() => {
      // Ignore alarm errors
    });
  }
}

/**
 * Export the Durable Object class
 */
export default {
  CollaborationObject,
};
