/**
 * CudaClaw Bridge - Type Definitions
 *
 * TypeScript types for CudaClaw GPU-accelerated SmartCRDT system.
 * These types mirror the Rust/CUDA structures in cudaclaw.
 *
 * @packageDocumentation
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Command types for GPU operations
 * Must match cudaclaw CommandType enum
 */
export enum CommandType {
  NOOP = 0,
  SHUTDOWN = 1,
  ADD = 2,
  MULTIPLY = 3,
  BATCH_PROCESS = 4,
  SPREADSHEET_EDIT = 5,
}

/**
 * Cell value types
 * Must match cudaclaw CellValueType enum
 */
export enum CellValueType {
  EMPTY = 0,
  NUMBER = 1,
  STRING = 2,
  FORMULA = 3,
  BOOLEAN = 4,
  ERROR = 5,
}

/**
 * SmartCRDT cell states
 * Must match cudaclaw CellState enum
 */
export enum CellState {
  ACTIVE = 0,
  DELETED = 1,
  CONFLICT = 2,
  MERGED = 3,
  PENDING = 4,
  LOCKED = 5,
}

/**
 * Queue status flags
 * Must match cudaclaw QueueStatus enum
 */
export enum QueueStatus {
  IDLE = 0,
  READY = 1,
  PROCESSING = 2,
  DONE = 3,
  ERROR = 4,
}

/**
 * Polling strategies for GPU worker
 */
export enum PollingStrategy {
  SPIN = 0,
  ADAPTIVE = 1,
  TIMED = 2,
}

// ============================================================================
// BASIC TYPES
// ============================================================================

/**
 * Cell identifier (row, column)
 */
export interface CellID {
  row: number;
  col: number;
}

/**
 * Lamport timestamp for CRDT ordering
 */
export type LamportTimestamp = number;

/**
 * Node identifier for CRDT origin tracking
 */
export type NodeID = string;

// ============================================================================
// SMART CRDT TYPES
// ============================================================================

/**
 * SmartCRDT cell data structure
 * Represents a single cell with CRDT properties
 */
export interface SmartCRDTCell {
  /** Primary cell value */
  value: number;

  /** Lamport timestamp for conflict resolution */
  timestamp: LamportTimestamp;

  /** Origin node identifier */
  node_id: NodeID;

  /** Current cell state */
  state: CellState;

  /** Optional string value (for text cells) */
  string_value?: string;

  /** Optional formula (for formula cells) */
  formula?: string;

  /** Cached result of formula evaluation */
  cached_result?: number;

  /** List of dependencies (for formula cells) */
  dependencies?: CellID[];
}

/**
 * Spreadsheet edit operation for CRDT merge
 */
export interface SpreadsheetEdit {
  /** Cell being edited */
  cell_id: CellID;

  /** New value type */
  new_type: CellValueType;

  /** Numeric value */
  numeric_value: number;

  /** Lamport timestamp */
  timestamp: LamportTimestamp;

  /** Origin node */
  node_id: NodeID;

  /** Is this a delete operation? */
  is_delete: boolean;

  /** String value (if string type) */
  string_value?: string;

  /** Formula (if formula type) */
  formula?: string;

  /** Length of value/formula string */
  value_len: number;
}

// ============================================================================
// COMMAND TYPES
// ============================================================================

/**
 * GPU command structure
 * Must match cudaclaw Command struct (48 bytes)
 */
export interface Command {
  /** Command type */
  cmd_type: CommandType;

  /** Command/cell identifier */
  id: number;

  /** Lamport timestamp */
  timestamp: number;

  /** Primary data value */
  data_a: number;

  /** Secondary data value */
  data_b: number;

  /** Result value */
  result: number;

  /** Batch data pointer (GPU memory address) */
  batch_data: bigint;

  /** Batch count */
  batch_count: number;

  /** Result code */
  result_code: number;
}

/**
 * Batch spreadsheet edit command
 */
export interface BatchSpreadsheetEditCommand extends Command {
  cmd_type: CommandType.SPREADSHEET_EDIT;
  cells_ptr: bigint;  // Pointer to cell array in GPU memory
  edits_ptr: bigint;  // Pointer to edits array in GPU memory
  edit_count: number;
  spreadsheet_id: string;
}

// ============================================================================
// QUEUE TYPES
// ============================================================================

/**
 * Command queue structure
 * Must match cudaclaw CommandQueueHost (49,192 bytes)
 */
export interface CommandQueue {
  /** Ring buffer of commands */
  buffer: Command[];

  /** Queue status */
  status: QueueStatus;

  /** Write index (Rust side) */
  head: number;

  /** Read index (GPU side) */
  tail: number;

  /** Kernel running flag */
  is_running: boolean;

  /** Total commands sent (statistic) */
  commands_sent: bigint;

  /** Total commands processed (statistic) */
  commands_processed: bigint;
}

// ============================================================================
// WORKER STATISTICS
// ============================================================================

/**
 * Worker statistics from GPU
 */
export interface WorkerStats {
  /** Total commands processed */
  commands_processed: bigint;

  /** Total GPU cycles */
  total_cycles: bigint;

  /** Idle GPU cycles */
  idle_cycles: bigint;

  /** Current queue head */
  head: number;

  /** Current queue tail */
  tail: number;

  /** Queue status */
  status: QueueStatus;

  /** Current polling strategy */
  current_strategy: PollingStrategy;

  /** Consecutive commands processed */
  consecutive_commands: number;

  /** Consecutive idle cycles */
  consecutive_idle: number;

  /** Average command latency (cycles) */
  avg_command_latency_cycles: bigint;
}

/**
 * Warp-level performance metrics
 */
export interface WarpMetrics {
  /** GPU utilization percentage */
  utilization_percent: number;

  /** Commands processed by this warp */
  commands_processed: number;

  /** Consecutive commands */
  consecutive_commands: number;

  /** Consecutive idle cycles */
  consecutive_idle: number;
}

/**
 * Executor statistics
 */
export interface ExecutorStats {
  /** Commands processed */
  commands_processed: bigint;

  /** Commands sent */
  commands_sent: bigint;

  /** Queue head */
  head: number;

  /** Queue tail */
  tail: number;

  /** Is kernel running? */
  is_running: boolean;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Cell update request
 */
export interface CellUpdateRequest {
  /** Sheet identifier */
  sheet_id: string;

  /** Cell identifier */
  cell_id: CellID;

  /** New value */
  value: number | string;

  /** Value type */
  type: CellValueType;

  /** Formula (if applicable) */
  formula?: string;

  /** Origin node */
  node_id: NodeID;

  /** Current timestamp */
  timestamp: LamportTimestamp;
}

/**
 * Cell update result
 */
export interface CellUpdateResult {
  /** Success flag */
  success: boolean;

  /** Updated cell data */
  cell: SmartCRDTCell;

  /** Execution time (microseconds) */
  execution_time_us: number;

  /** Error message (if failed) */
  error?: string;
}

/**
 * Batch update request
 */
export interface BatchUpdateRequest {
  /** Sheet identifier */
  sheet_id: string;

  /** Batch identifier */
  batch_id: string;

  /** Cell updates */
  updates: CellUpdateRequest[];

  /** Execute on GPU? */
  use_gpu: boolean;
}

/**
 * Batch update result
 */
export interface BatchUpdateResult {
  /** Success flag */
  success: boolean;

  /** Batch identifier */
  batch_id: string;

  /** Updated cells */
  cells: SmartCRDTCell[];

  /** Total execution time (microseconds) */
  execution_time_us: number;

  /** Cells processed */
  cells_processed: number;

  /** Cells failed */
  cells_failed: number;

  /** Errors (if any) */
  errors: Array<{ cell_id: CellID; error: string }>;
}

/**
 * GPU statistics
 */
export interface GPUStats {
  /** GPU utilization (0-100) */
  utilization: number;

  /** Memory used (bytes) */
  memory_used: number;

  /** Memory total (bytes) */
  memory_total: number;

  /** Temperature (Celsius) */
  temperature: number;

  /** Power usage (Watts) */
  power_usage: number;

  /** Worker statistics */
  worker: WorkerStats;

  /** Warp metrics (per warp) */
  warps: WarpMetrics[];
}

/**
 * Conflict resolution request
 */
export interface ConflictResolutionRequest {
  /** Cell identifier */
  cell_id: CellID;

  /** Conflicting updates */
  updates: SmartCRDTCell[];

  /** Resolution strategy */
  strategy: 'last-write-wins' | 'first-write-wins' | 'merge';
}

/**
 * Resolved cell
 */
export interface ResolvedCell {
  /** Resolved cell data */
  cell: SmartCRDTCell;

  /** Resolution strategy used */
  strategy: string;

  /** Conflicts resolved */
  conflicts_resolved: number;

  /** Execution time (microseconds) */
  execution_time_us: number;
}

// ============================================================================
// CLIENT CONFIGURATION
// ============================================================================

/**
 * CudaClaw client configuration
 */
export interface CudaClawClientConfig {
  /** Server base URL */
  serverUrl: string;

  /** WebSocket URL */
  websocketUrl?: string;

  /** API key for authentication */
  apiKey?: string;

  /** Request timeout (milliseconds) */
  timeout?: number;

  /** Maximum retries */
  maxRetries?: number;

  /** Retry delay (milliseconds) */
  retryDelay?: number;

  /** Enable WebSocket connection */
  enableWebSocket?: boolean;

  /** Enable GPU acceleration */
  enableGPUAcceleration?: boolean;

  /** Enable SmartCRDT */
  enableSmartCRDT?: boolean;

  /** Maximum batch size */
  maxBatchSize?: number;

  /** Debug mode */
  debug?: boolean;
}

/**
 * Batch operation configuration
 */
export interface BatchConfig {
  /** Maximum batch size */
  max_size: number;

  /** Timeout (milliseconds) */
  timeout: number;

  /** Execute on GPU? */
  use_gpu: boolean;

  /** Parallel warps */
  parallel_warps: number;
}

// ============================================================================
// BATCH OPERATION TYPES
// ============================================================================

/**
 * Batch operation
 */
export interface BatchOperation {
  /** Batch identifier */
  batch_id: string;

  /** Sheet identifier */
  sheet_id: string;

  /** Cell updates */
  updates: Map<string, CellUpdateRequest>;

  /** Configuration */
  config: BatchConfig;

  /** Creation timestamp */
  created_at: number;

  /** Execution timestamp */
  executed_at?: number;

  /** Completion timestamp */
  completed_at?: number;

  /** Status */
  status: 'pending' | 'executing' | 'completed' | 'failed';
}

/**
 * Batch progress
 */
export interface BatchProgress {
  /** Batch identifier */
  batch_id: string;

  /** Total updates */
  total: number;

  /** Processed */
  processed: number;

  /** Failed */
  failed: number;

  /** Percentage complete */
  percent: number;

  /** Estimated time remaining (milliseconds) */
  eta_ms: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * CudaClaw error
 */
export class CudaClawError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'CudaClawError';
  }
}

/**
 * Connection error
 */
export class ConnectionError extends CudaClawError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONNECTION_ERROR', undefined, details);
    this.name = 'ConnectionError';
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends CudaClawError {
  constructor(message: string, details?: unknown) {
    super(message, 'TIMEOUT_ERROR', undefined, details);
    this.name = 'TimeoutError';
  }
}

/**
 * GPU error
 */
export class GPUError extends CudaClawError {
  constructor(message: string, details?: unknown) {
    super(message, 'GPU_ERROR', undefined, details);
    this.name = 'GPUError';
  }
}

/**
 * CRDT conflict error
 */
export class ConflictError extends CudaClawError {
  constructor(message: string, public conflicts: SmartCRDTCell[]) {
    super(message, 'CONFLICT_ERROR', undefined, conflicts);
    this.name = 'ConflictError';
  }
}

// ============================================================================
// EVENT TYPES
// ============================================================================

/**
 * Event types for CudaClaw client
 */
export type CudaClawEvent =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'cellUpdated'
  | 'batchCompleted'
  | 'batchProgress'
  | 'conflictDetected'
  | 'conflictResolved'
  | 'gpuStatsUpdate';

/**
 * Event handler
 */
export type EventHandler<T = unknown> = (data: T) => void;

/**
 * Cell updated event
 */
export interface CellUpdatedEvent {
  sheet_id: string;
  cell_id: CellID;
  cell: SmartCRDTCell;
  timestamp: number;
}

/**
 * Batch completed event
 */
export interface BatchCompletedEvent {
  batch_id: string;
  result: BatchUpdateResult;
  timestamp: number;
}

/**
 * Batch progress event
 */
export interface BatchProgressEvent {
  batch_id: string;
  progress: BatchProgress;
  timestamp: number;
}

/**
 * Conflict detected event
 */
export interface ConflictDetectedEvent {
  cell_id: CellID;
  conflicts: SmartCRDTCell[];
  timestamp: number;
}

/**
 * Conflict resolved event
 */
export interface ConflictResolvedEvent {
  cell_id: CellID;
  resolved: ResolvedCell;
  timestamp: number;
}

/**
 * GPU stats update event
 */
export interface GPUStatsUpdateEvent {
  stats: GPUStats;
  timestamp: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Deep partial type (recursive Partial)
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Promise result type
 */
export type PromiseResult<T> = Promise<[T, null] | [null, Error]>;

/**
 * Cell value type union
 */
export type CellValue = number | string | boolean | null;

/**
 * Formula result type
 */
export type FormulaResult = number | string | boolean | Error;
