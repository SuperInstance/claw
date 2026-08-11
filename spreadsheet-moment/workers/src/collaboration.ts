/**
 * Spreadsheet Moment - Real-time Collaboration via Durable Objects
 *
 * Implements real-time collaborative editing using Cloudflare Durable Objects.
 * Multiple users can edit the same spreadsheet simultaneously with automatic
 * conflict resolution using CRDT (Conflict-free Replicated Data Types).
 *
 * @author SuperInstance Evolution Team
 * @date 2026-03-14
 * @version Round 2 Implementation
 */

import {
  DurableObject,
  DurableObjectState
} from 'cloudflare:workers';

// ============================================================================
// Types
// ============================================================================

interface UserConnection {
  socket: WebSocket;
  userId: string;
  userName: string;
  cursor?: { cellId: string; position: [number, number] };
}

interface CellOperation {
  type: 'set' | 'delete' | 'format';
  cellId: string;
  userId: string;
  timestamp: number;
  data: any;
}

interface CollaborationState {
  spreadsheetId: string;
  users: Map<string, UserConnection>;
  operations: CellOperation[];
  version: number;
}

// ============================================================================
// CRDT Implementation
// ============================================================================

/**
 * Last-Writer-Wins Register (LWW-Register)
 *
 * A simple CRDT for handling concurrent cell updates.
 * The operation with the highest timestamp wins.
 */
class LWWRegister {
  private value: any;
  private timestamp: number;
  private nodeId: string;

  constructor(nodeId: string, initialValue: any = null, timestamp: number = 0) {
    this.nodeId = nodeId;
    this.value = initialValue;
    this.timestamp = timestamp;
  }

  setValue(value: any, timestamp: number, nodeId: string): boolean {
    if (timestamp > this.timestamp || (timestamp === this.timestamp && nodeId > this.nodeId)) {
      this.value = value;
      this.timestamp = timestamp;
      this.nodeId = nodeId;
      return true;  // Value changed
    }
    return false;  // Value not changed (lost conflict)
  }

  getValue(): any {
    return this.value;
  }

  getTimestamp(): number {
    return this.timestamp;
  }

  merge(other: LWWRegister): void {
    if (other.timestamp > this.timestamp ||
        (other.timestamp === this.timestamp && other.nodeId > this.nodeId)) {
      this.value = other.value;
      this.timestamp = other.timestamp;
      this.nodeId = other.nodeId;
    }
  }

  toJSON(): object {
    return {
      value: this.value,
      timestamp: this.timestamp,
      nodeId: this.nodeId
    };
  }

  static fromJSON(data: any, nodeId: string): LWWRegister {
    const reg = new LWWRegister(nodeId, data.value, data.timestamp);
    reg.nodeId = data.nodeId;
    return reg;
  }
}

/**
 * OR-Set (Observed-Remove Set)
 *
 * CRDT set for tracking collections with add/remove operations.
 */
class ORSet {
  private elements: Map<string, Set<string>> = new Map();
  private tombstones: Map<string, Set<string>> = new Map();

  add(element: string, tag: string): void {
    if (!this.elements.has(element)) {
      this.elements.set(element, new Set());
    }
    this.elements.get(element)!.add(tag);
  }

  remove(element: string, tag: string): void {
    if (!this.tombstones.has(element)) {
      this.tombstones.set(element, new Set());
    }
    this.tombstones.get(element)!.add(tag);
  }

  has(element: string): boolean {
    const elementTags = this.elements.get(element);
    const tombstoneTags = this.tombstones.get(element);

    if (!elementTags) return false;
    if (!tombstoneTags) return true;

    // Element exists if there are tags that aren't tombstoned
    for (const tag of elementTags) {
      if (!tombstoneTags.has(tag)) {
        return true;
      }
    }
    return false;
  }

  elements(): string[] {
    const result: string[] = [];
    for (const [element, tags] of this.elements) {
      if (this.has(element)) {
        result.push(element);
      }
    }
    return result;
  }

  merge(other: ORSet): void {
    // Merge elements
    for (const [element, tags] of other.elements) {
      if (!this.elements.has(element)) {
        this.elements.set(element, new Set(tags));
      } else {
        const myTags = this.elements.get(element)!;
        for (const tag of tags) {
          myTags.add(tag);
        }
      }
    }

    // Merge tombstones
    for (const [element, tags] of other.tombstones) {
      if (!this.tombstones.has(element)) {
        this.tombstones.set(element, new Set(tags));
      } else {
        const myTags = this.tombstones.get(element)!;
        for (const tag of tags) {
          myTags.add(tag);
        }
      }
    }
  }
}

// ============================================================================
// Collaboration Durable Object
// ============================================================================

/**
 * Real-time collaboration coordinator for a spreadsheet.
 *
 * Each spreadsheet has one CollaborationDurableObject that:
 * 1. Manages WebSocket connections for all users
 * 2. Broadcasts operations to all connected users
 * 3. Resolves conflicts using CRDTs
 * 4. Maintains consistent state across all clients
 */
export class CollaborationDurableObject implements DurableObject {
  private state: DurableObjectState;
  private env: Env;
  private sessions: Map<string, UserConnection> = new Map();
  private cells: Map<string, LWWRegister> = new Map();
  private cursors: Map<string, { cellId: string; userId: string }> = new Map();
  private spreadsheetId: string;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.spreadsheetId = 'default';  // Will be set on first connection

    // Load existing state from storage
    this.loadState();
  }

  /**
   * Load state from durable storage
   */
  private async loadState(): Promise<void> {
    const storedCells = await this.state.storage.get<Record<string, any>>('cells');
    if (storedCells) {
      for (const [cellId, data] of Object.entries(storedCells)) {
        this.cells.set(cellId, LWWRegister.fromJSON(data, 'server'));
      }
    }

    const spreadsheetId = await this.state.storage.get<string>('spreadsheetId');
    if (spreadsheetId) {
      this.spreadsheetId = spreadsheetId;
    }
  }

  /**
   * Save state to durable storage
   */
  private async saveState(): Promise<void> {
    const cellsData: Record<string, any> = {};
    for (const [cellId, register] of this.cells) {
      cellsData[cellId] = register.toJSON();
    }
    await this.state.storage.put('cells', cellsData);
    await this.state.storage.put('spreadsheetId', this.spreadsheetId);
  }

  /**
   * Handle WebSocket connection
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'anonymous';
    const userName = url.searchParams.get('userName') || 'Anonymous';

    // Upgrade to WebSocket
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    await this.state.acceptWebSocket(server);

    // Store connection
    const connection: UserConnection = {
      socket: server,
      userId,
      userName
    };
    this.sessions.set(userId, connection);

    // Send welcome message
    server.send(JSON.stringify({
      type: 'connected',
      spreadsheetId: this.spreadsheetId,
      userId,
      users: Array.from(this.sessions.values()).map(s => ({
        userId: s.userId,
        userName: s.userName
      }))
    }));

    // Broadcast user joined
    this.broadcast({
      type: 'userJoined',
      userId,
      userName
    }, userId);

    // Set up message handler
    server.deserialize(data => JSON.parse(data));
    server.addEventListener('message', async (data: any) => {
      try {
        await this.handleMessage(userId, data.data);
      } catch (error) {
        console.error('Error handling message:', error);
        server.send(JSON.stringify({
          type: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    });

    server.addEventListener('close', async () => {
      this.sessions.delete(userId);
      this.broadcast({
        type: 'userLeft',
        userId,
        userName
      });
      await this.saveState();
    });

    server.addEventListener('error', (error: any) => {
      console.error('WebSocket error:', error);
    });

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  /**
   * Handle incoming WebSocket message
   */
  private async handleMessage(userId: string, message: any): Promise<void> {
    switch (message.type) {
      case 'setCell':
        await this.handleSetCell(userId, message);
        break;

      case 'deleteCell':
        await this.handleDeleteCell(userId, message);
        break;

      case 'moveCursor':
        this.handleMoveCursor(userId, message);
        break;

      case 'getCells':
        await this.handleGetCells(userId);
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }

  /**
   * Handle cell update operation
   */
  private async handleSetCell(userId: string, message: any): Promise<void> {
    const { cellId, value, timestamp = Date.now() } = message;

    // Get or create cell register
    let cell = this.cells.get(cellId);
    if (!cell) {
      cell = new LWWRegister(userId, null, 0);
      this.cells.set(cellId, cell);
    }

    // Set value with timestamp
    const changed = cell.setValue(value, timestamp, userId);

    if (changed) {
      // Broadcast to all users
      this.broadcast({
        type: 'cellUpdated',
        cellId,
        value,
        userId,
        timestamp
      });

      // Save state
      await this.saveState();
    }
  }

  /**
   * Handle cell delete operation
   */
  private async handleDeleteCell(userId: string, message: any): Promise<void> {
    const { cellId, timestamp = Date.now() } = message;

    const cell = this.cells.get(cellId);
    if (cell) {
      cell.setValue(null, timestamp, userId);

      this.broadcast({
        type: 'cellDeleted',
        cellId,
        userId,
        timestamp
      });

      await this.saveState();
    }
  }

  /**
   * Handle cursor movement
   */
  private handleMoveCursor(userId: string, message: any): void {
    const { cellId, position } = message;

    // Update cursor position
    const session = this.sessions.get(userId);
    if (session) {
      session.cursor = { cellId, position };
    }

    // Broadcast to other users
    this.broadcast({
      type: 'cursorMoved',
      userId,
      cellId,
      position
    }, userId);  // Don't send back to sender
  }

  /**
   * Handle get cells request
   */
  private async handleGetCells(userId: string): Promise<void> {
    const session = this.sessions.get(userId);
    if (!session) return;

    const cells: Record<string, any> = {};
    for (const [cellId, register] of this.cells) {
      cells[cellId] = {
        value: register.getValue(),
        timestamp: register.getTimestamp()
      };
    }

    session.socket.send(JSON.stringify({
      type: 'cells',
      cells
    }));
  }

  /**
   * Broadcast message to all connected users
   *
   * @param message Message to broadcast
   * @param excludeUserId Optional user ID to exclude from broadcast
   */
  private broadcast(message: any, excludeUserId?: string): void {
    const messageStr = JSON.stringify(message);

    for (const [userId, session] of this.sessions) {
      if (userId !== excludeUserId) {
        try {
          session.socket.send(messageStr);
        } catch (error) {
          console.error(`Error sending to user ${userId}:`, error);
        }
      }
    }
  }

  /**
   * Get current collaboration state
   */
  getState(): CollaborationState {
    return {
      spreadsheetId: this.spreadsheetId,
      users: new Map(this.sessions),
      operations: [],  // Would store operation history
      version: 1
    };
  }
}

// ============================================================================
// Export
// ============================================================================

export interface Env {
  COLLABORATION: DurableObjectNamespace;
}
