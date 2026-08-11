/**
 * CudaClaw Client
 *
 * HTTP/WebSocket client for CudaClaw GPU-accelerated SmartCRDT server.
 * Provides high-level API for cell operations, batch updates, and GPU statistics.
 *
 * @packageDocumentation
 */

import { v4 as uuidv4 } from 'uuid';
import {
  CudaClawClientConfig,
  CellUpdateRequest,
  CellUpdateResult,
  BatchUpdateRequest,
  BatchUpdateResult,
  GPUStats,
  SmartCRDTCell,
  ConflictResolutionRequest,
  ResolvedCell,
  CellID,
  Command,
  CommandType,
  WorkerStats,
  ExecutorStats,
  CudaClawError,
  ConnectionError,
  TimeoutError,
  GPUError,
  CudaClawEvent,
  EventHandler,
  CellUpdatedEvent,
  BatchCompletedEvent,
  BatchProgressEvent,
  GPUStatsUpdateEvent,
} from './types';

// ============================================================================
// CONFIGURATION DEFAULTS
// ============================================================================

const DEFAULT_CONFIG: Omit<CudaClawClientConfig, 'serverUrl' | 'apiKey'> & {
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  enableWebSocket: boolean;
  enableGPUAcceleration: boolean;
  enableSmartCRDT: boolean;
  maxBatchSize: number;
  debug: boolean;
} = {
  websocketUrl: '',
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
  enableWebSocket: false,
  enableGPUAcceleration: true,
  enableSmartCRDT: true,
  maxBatchSize: 1000,
  debug: false,
};

// ============================================================================
// CUDACLAWS CLIENT
// ============================================================================

/**
 * CudaClaw Client
 *
 * Main client class for communicating with CudaClaw server.
 * Supports both HTTP and WebSocket connections.
 */
export class CudaClawClient {
  private config: CudaClawClientConfig & {
    timeout: number;
    maxRetries: number;
    retryDelay: number;
    enableWebSocket: boolean;
    enableGPUAcceleration: boolean;
    enableSmartCRDT: boolean;
    maxBatchSize: number;
    debug: boolean;
  };
  private eventHandlers: Map<CudaClawEvent, Set<EventHandler>>;
  private websocket: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnectedFlag: boolean = false;
  private currentBatchId: string | null = null;

  constructor(config: CudaClawClientConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config } as typeof this.config;
    this.eventHandlers = new Map();

    // Initialize event handler sets
    const events: CudaClawEvent[] = [
      'connected',
      'disconnected',
      'error',
      'cellUpdated',
      'batchCompleted',
      'batchProgress',
      'conflictDetected',
      'conflictResolved',
      'gpuStatsUpdate',
    ];
    events.forEach(event => this.eventHandlers.set(event, new Set()));

    // Auto-connect if WebSocket enabled
    if (this.config.enableWebSocket && this.config.websocketUrl) {
      this.connectWebSocket();
    }
  }

  // ========================================================================
  // CONNECTION MANAGEMENT
  // ========================================================================

  /**
   * Connect to CudaClaw server
   */
  async connect(): Promise<void> {
    try {
      // Test HTTP connection
      const response = await this.fetchWithTimeout(`${this.config.serverUrl}/health`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new ConnectionError(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.isConnectedFlag = true;
      this.emit('connected', { timestamp: Date.now() });

      // Connect WebSocket if enabled
      if (this.config.enableWebSocket && this.config.websocketUrl) {
        await this.connectWebSocket();
      }

      this.log('Connected to CudaClaw server');
    } catch (error) {
      this.isConnectedFlag = false;
      throw new ConnectionError(
        `Failed to connect to CudaClaw server: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Disconnect from CudaClaw server
   */
  async disconnect(): Promise<void> {
    this.isConnectedFlag = false;

    // Close WebSocket
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    // Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.emit('disconnected', { timestamp: Date.now() });
    this.log('Disconnected from CudaClaw server');
  }

  /**
   * Check if connected to server
   */
  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  // ========================================================================
  // CELL OPERATIONS
  // ========================================================================

  /**
   * Update a single cell
   */
  async updateCell(
    sheetId: string,
    cellId: CellID,
    value: number | string,
    options?: {
      type?: 'NUMBER' | 'STRING' | 'FORMULA';
      formula?: string;
      node_id?: string;
      timestamp?: number;
    }
  ): Promise<CellUpdateResult> {
    const startTime = Date.now();

    try {
      const request: CellUpdateRequest = {
        sheet_id: sheetId,
        cell_id: cellId,
        value: value,
        type: options?.type === 'NUMBER' ? 1 : options?.type === 'STRING' ? 2 : 3,
        formula: options?.formula,
        node_id: options?.node_id || this.generateNodeId(),
        timestamp: options?.timestamp || this.generateTimestamp(),
      };

      const response = await this.fetchWithTimeout(
        `${this.config.serverUrl}/api/cells/${sheetId}/${cellId.row}/${cellId.col}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new CudaClawError(
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR',
          response.status
        );
      }

      const result = (await response.json()) as CellUpdateResult;
      const executionTime = Date.now() - startTime;

      this.emit('cellUpdated', {
        sheet_id: sheetId,
        cell_id: cellId,
        cell: result.cell,
        timestamp: Date.now(),
      } as CellUpdatedEvent);

      this.log(`Cell updated: ${sheetId}!${cellId.row},${cellId.col} in ${executionTime}ms`);

      return result;
    } catch (error) {
      this.emit('error', {
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  /**
   * Get a single cell
   */
  async getCell(sheetId: string, cellId: CellID): Promise<SmartCRDTCell> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.config.serverUrl}/api/cells/${sheetId}/${cellId.row}/${cellId.col}`,
        {
          method: 'GET',
          headers: {
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
          },
        }
      );

      if (!response.ok) {
        throw new CudaClawError(
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR',
          response.status
        );
      }

      const cell = (await response.json()) as SmartCRDTCell;
      return cell;
    } catch (error) {
      this.emit('error', {
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  /**
   * Delete a cell
   */
  async deleteCell(sheetId: string, cellId: CellID): Promise<void> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.config.serverUrl}/api/cells/${sheetId}/${cellId.row}/${cellId.col}`,
        {
          method: 'DELETE',
          headers: {
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
          },
        }
      );

      if (!response.ok) {
        throw new CudaClawError(
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR',
          response.status
        );
      }

      this.log(`Cell deleted: ${sheetId}!${cellId.row},${cellId.col}`);
    } catch (error) {
      this.emit('error', {
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  // ========================================================================
  // BATCH OPERATIONS
  // ========================================================================

  /**
   * Create a new batch operation
   */
  createBatch(sheetId: string, options?: { use_gpu?: boolean }): string {
    this.currentBatchId = uuidv4();
    return this.currentBatchId;
  }

  /**
   * Execute a batch update
   */
  async executeBatch(request: BatchUpdateRequest): Promise<BatchUpdateResult> {
    const startTime = Date.now();

    try {
      const response = await this.fetchWithTimeout(
        `${this.config.serverUrl}/api/batch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new CudaClawError(
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR',
          response.status
        );
      }

      const result = (await response.json()) as BatchUpdateResult;
      const executionTime = Date.now() - startTime;

      this.emit('batchCompleted', {
        batch_id: request.batch_id,
        result: result,
        timestamp: Date.now(),
      } as BatchCompletedEvent);

      this.log(
        `Batch completed: ${request.batch_id} (${result.cells_processed} cells in ${executionTime}ms)`
      );

      return result;
    } catch (error) {
      this.emit('error', {
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  // ========================================================================
  // SMART CRDT OPERATIONS
  // ========================================================================

  /**
   * Resolve conflicts in a cell
   */
  async resolveConflict(request: ConflictResolutionRequest): Promise<ResolvedCell> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.config.serverUrl}/api/crdt/resolve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new CudaClawError(
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR',
          response.status
        );
      }

      const resolved = (await response.json()) as ResolvedCell;

      this.emit('conflictResolved', {
        cell_id: request.cell_id,
        resolved: resolved,
        timestamp: Date.now(),
      });

      this.log(`Conflict resolved: ${request.cell_id.row},${request.cell_id.col}`);

      return resolved;
    } catch (error) {
      this.emit('error', {
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  // ========================================================================
  // GPU OPERATIONS
  // ========================================================================

  /**
   * Get GPU statistics
   */
  async getGPUStats(): Promise<GPUStats> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.config.serverUrl}/api/gpu/stats`,
        {
          method: 'GET',
          headers: {
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
          },
        }
      );

      if (!response.ok) {
        throw new CudaClawError(
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR',
          response.status
        );
      }

      const stats = (await response.json()) as GPUStats;

      this.emit('gpuStatsUpdate', {
        stats: stats,
        timestamp: Date.now(),
      } as GPUStatsUpdateEvent);

      return stats;
    } catch (error) {
      this.emit('error', {
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  /**
   * Get queue depth
   */
  async getQueueDepth(): Promise<number> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.config.serverUrl}/api/queue/depth`,
        {
          method: 'GET',
          headers: {
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
          },
        }
      );

      if (!response.ok) {
        throw new CudaClawError(
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR',
          response.status
        );
      }

      const data = (await response.json()) as { depth: number };
      return data.depth;
    } catch (error) {
      this.emit('error', {
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  /**
   * Subscribe to events
   */
  on<T = unknown>(event: CudaClawEvent, handler: EventHandler<T>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.add(handler as EventHandler);
    }
  }

  /**
   * Unsubscribe from events
   */
  off<T = unknown>(event: CudaClawEvent, handler: EventHandler<T>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler as EventHandler);
    }
  }

  /**
   * Emit event to all subscribers
   */
  private emit<T = unknown>(event: CudaClawEvent, data: T): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // ========================================================================
  // WEBSOCKET CONNECTION
  // ========================================================================

  /**
   * Connect to WebSocket server
   */
  private async connectWebSocket(): Promise<void> {
    if (!this.config.websocketUrl) {
      return;
    }

    try {
      this.websocket = new WebSocket(this.config.websocketUrl);

      this.websocket.onopen = () => {
        this.log('WebSocket connected');
        this.emit('connected', { timestamp: Date.now() });
      };

      this.websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', { error, timestamp: Date.now() });
      };

      this.websocket.onclose = () => {
        this.log('WebSocket disconnected');
        this.emit('disconnected', { timestamp: Date.now() });

        // Attempt to reconnect
        if (this.config.enableWebSocket) {
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      throw new ConnectionError(
        `Failed to connect WebSocket: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Schedule WebSocket reconnection
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connectWebSocket();
    }, this.config.retryDelay);
  }

  /**
   * Handle WebSocket message
   */
  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'cellUpdated':
        this.emit('cellUpdated', message.data as CellUpdatedEvent);
        break;
      case 'batchCompleted':
        this.emit('batchCompleted', message.data as BatchCompletedEvent);
        break;
      case 'batchProgress':
        this.emit('batchProgress', message.data as BatchProgressEvent);
        break;
      case 'gpuStatsUpdate':
        this.emit('gpuStatsUpdate', message.data as GPUStatsUpdateEvent);
        break;
      case 'error':
        this.emit('error', message.data);
        break;
      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError(`Request timeout after ${this.config.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Generate unique node ID
   */
  private generateNodeId(): string {
    return `node_${uuidv4()}`;
  }

  /**
   * Generate Lamport timestamp
   */
  private generateTimestamp(): number {
    return Date.now();
  }

  /**
   * Log debug message
   */
  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[CudaClawClient] ${message}`);
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default CudaClawClient;
