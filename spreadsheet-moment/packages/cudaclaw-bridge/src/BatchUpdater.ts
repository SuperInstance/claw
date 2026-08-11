/**
 * Batch Updater
 *
 * High-performance batch update system leveraging CudaClaw's GPU acceleration.
 * Processes multiple cell updates in parallel using warp-level parallelism.
 *
 * @packageDocumentation
 */

import { v4 as uuidv4 } from 'uuid';
import CudaClawClient from './CudaClawClient';
import {
  BatchOperation,
  BatchConfig,
  BatchProgress,
  BatchUpdateRequest,
  BatchUpdateResult,
  CellUpdateRequest,
  CellID,
} from './types';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_BATCH_CONFIG: BatchConfig = {
  max_size: 1000,
  timeout: 30000,
  use_gpu: true,
  parallel_warps: 32,
};

// ============================================================================
// BATCH UPDATER CLASS
// ============================================================================

/**
 * Batch Updater
 *
 * Manages batch operations for GPU-accelerated cell updates.
 * Aggregates multiple updates and executes them in parallel on GPU.
 */
export class BatchUpdater {
  private client: CudaClawClient;
  private batches: Map<string, BatchOperation>;
  private config: BatchConfig;

  constructor(client: CudaClawClient, config?: Partial<BatchConfig>) {
    this.client = client;
    this.batches = new Map();
    this.config = { ...DEFAULT_BATCH_CONFIG, ...config };

    // Subscribe to batch progress events
    this.client.on('batchProgress', this.handleBatchProgress.bind(this));
  }

  // ========================================================================
  // BATCH CREATION
  // ========================================================================

  /**
   * Create a new batch operation
   */
  createBatch(sheetId: string, options?: Partial<BatchConfig>): string {
    const batchId = uuidv4();
    const batch: BatchOperation = {
      batch_id: batchId,
      sheet_id: sheetId,
      updates: new Map(),
      config: { ...this.config, ...options },
      created_at: Date.now(),
      status: 'pending',
    };

    this.batches.set(batchId, batch);
    return batchId;
  }

  /**
   * Add an update to a batch
   */
  addUpdate(
    batchId: string,
    cellId: CellID,
    value: number | string,
    options?: {
      type?: 'NUMBER' | 'STRING' | 'FORMULA';
      formula?: string;
      node_id?: string;
      timestamp?: number;
    }
  ): void {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new Error(`Batch not found: ${batchId}`);
    }

    if (batch.status !== 'pending') {
      throw new Error(`Batch ${batchId} is not in pending state`);
    }

    const cellKey = this.cellIdToString(cellId);
    const update: CellUpdateRequest = {
      sheet_id: batch.sheet_id,
      cell_id: cellId,
      value: value,
      type: options?.type === 'NUMBER' ? 1 : options?.type === 'STRING' ? 2 : 3,
      formula: options?.formula,
      node_id: options?.node_id || this.generateNodeId(),
      timestamp: options?.timestamp || this.generateTimestamp(),
    };

    batch.updates.set(cellKey, update);

    // Check if batch is full
    if (batch.updates.size >= batch.config.max_size) {
      this.executeBatch(batchId);
    }
  }

  /**
   * Add multiple updates to a batch
   */
  addUpdates(
    batchId: string,
    updates: Array<{
      cellId: CellID;
      value: number | string;
      options?: {
        type?: 'NUMBER' | 'STRING' | 'FORMULA';
        formula?: string;
        node_id?: string;
        timestamp?: number;
      };
    }>
  ): void {
    updates.forEach(({ cellId, value, options }) => {
      this.addUpdate(batchId, cellId, value, options);
    });
  }

  // ========================================================================
  // BATCH EXECUTION
  // ========================================================================

  /**
   * Execute a batch operation
   */
  async executeBatch(batchId: string): Promise<BatchUpdateResult> {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new Error(`Batch not found: ${batchId}`);
    }

    if (batch.status !== 'pending') {
      throw new Error(`Batch ${batchId} is not in pending state`);
    }

    // Update batch status
    batch.status = 'executing';
    batch.executed_at = Date.now();

    // Prepare batch request
    const request: BatchUpdateRequest = {
      sheet_id: batch.sheet_id,
      batch_id: batchId,
      updates: Array.from(batch.updates.values()),
      use_gpu: batch.config.use_gpu,
    };

    try {
      // Execute batch
      const result = await this.client.executeBatch(request);

      // Update batch status
      batch.status = 'completed';
      batch.completed_at = Date.now();

      // Clean up after a delay
      setTimeout(() => {
        this.batches.delete(batchId);
      }, 60000); // Keep for 1 minute for debugging

      return result;
    } catch (error) {
      // Update batch status
      batch.status = 'failed';
      batch.completed_at = Date.now();

      throw error;
    }
  }

  /**
   * Execute all pending batches
   */
  async executeAllPending(): Promise<BatchUpdateResult[]> {
    const pendingBatches = Array.from(this.batches.entries())
      .filter(([_, batch]) => batch.status === 'pending')
      .map(([batchId, _]) => batchId);

    const results = await Promise.all(
      pendingBatches.map(batchId => this.executeBatch(batchId))
    );

    return results;
  }

  // ========================================================================
  // BATCH MONITORING
  // ========================================================================

  /**
   * Get batch progress
   */
  getProgress(batchId: string): BatchProgress {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new Error(`Batch not found: ${batchId}`);
    }

    const total = batch.updates.size;
    let processed = 0;
    let failed = 0;

    if (batch.status === 'completed') {
      processed = total;
    } else if (batch.status === 'failed') {
      failed = total;
    }

    const percent = total > 0 ? (processed / total) * 100 : 0;
    const etaMs = this.calculateETA(batch);

    return {
      batch_id: batchId,
      total,
      processed,
      failed,
      percent,
      eta_ms: etaMs,
    };
  }

  /**
   * Get batch status
   */
  getBatchStatus(batchId: string): string {
    const batch = this.batches.get(batchId);
    return batch?.status || 'not_found';
  }

  /**
   * Get all batches
   */
  getAllBatches(): BatchOperation[] {
    return Array.from(this.batches.values());
  }

  /**
   * Get pending batches
   */
  getPendingBatches(): BatchOperation[] {
    return Array.from(this.batches.values()).filter(batch => batch.status === 'pending');
  }

  /**
   * Get executing batches
   */
  getExecutingBatches(): BatchOperation[] {
    return Array.from(this.batches.values()).filter(batch => batch.status === 'executing');
  }

  /**
   * Get completed batches
   */
  getCompletedBatches(): BatchOperation[] {
    return Array.from(this.batches.values()).filter(batch => batch.status === 'completed');
  }

  /**
   * Get failed batches
   */
  getFailedBatches(): BatchOperation[] {
    return Array.from(this.batches.values()).filter(batch => batch.status === 'failed');
  }

  // ========================================================================
  // BATCH MANAGEMENT
  // ========================================================================

  /**
   * Cancel a batch
   */
  async cancelBatch(batchId: string): Promise<void> {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new Error(`Batch not found: ${batchId}`);
    }

    if (batch.status === 'executing') {
      throw new Error(`Cannot cancel executing batch: ${batchId}`);
    }

    this.batches.delete(batchId);
  }

  /**
   * Cancel all pending batches
   */
  cancelAllPending(): void {
    const pendingBatches = this.getPendingBatches();
    pendingBatches.forEach(batch => {
      this.batches.delete(batch.batch_id);
    });
  }

  /**
   * Clear completed batches
   */
  clearCompleted(): void {
    const completedBatches = this.getCompletedBatches();
    completedBatches.forEach(batch => {
      this.batches.delete(batch.batch_id);
    });
  }

  /**
   * Clear failed batches
   */
  clearFailed(): void {
    const failedBatches = this.getFailedBatches();
    failedBatches.forEach(batch => {
      this.batches.delete(batch.batch_id);
    });
  }

  /**
   * Clear all batches
   */
  clearAll(): void {
    this.batches.clear();
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Get batch size
   */
  getBatchSize(batchId: string): number {
    const batch = this.batches.get(batchId);
    return batch?.updates.size || 0;
  }

  /**
   * Check if batch is full
   */
  isBatchFull(batchId: string): boolean {
    const batch = this.batches.get(batchId);
    if (!batch) {
      return false;
    }

    return batch.updates.size >= batch.config.max_size;
  }

  /**
   * Get total pending updates
   */
  getTotalPendingUpdates(): number {
    return this.getPendingBatches().reduce(
      (sum, batch) => sum + batch.updates.size,
      0
    );
  }

  /**
   * Handle batch progress event
   */
  private handleBatchProgress(event: any): void {
    const progress = event as BatchProgress;
    // Update batch progress if needed
    // This is a placeholder for future progress tracking
  }

  /**
   * Calculate ETA for batch completion
   */
  private calculateETA(batch: BatchOperation): number {
    if (batch.status === 'completed') {
      return 0;
    }

    if (batch.status === 'pending' || !batch.executed_at) {
      return -1; // Unknown
    }

    const elapsed = Date.now() - batch.executed_at;
    const total = batch.updates.size;

    // Rough estimate based on elapsed time
    // This is a simplified calculation
    return elapsed; // Placeholder
  }

  /**
   * Convert cell ID to string key
   */
  private cellIdToString(cellId: CellID): string {
    return `${cellId.row},${cellId.col}`;
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
   * Get statistics
   */
  getStats(): {
    total_batches: number;
    pending_batches: number;
    executing_batches: number;
    completed_batches: number;
    failed_batches: number;
    total_pending_updates: number;
  } {
    return {
      total_batches: this.batches.size,
      pending_batches: this.getPendingBatches().length,
      executing_batches: this.getExecutingBatches().length,
      completed_batches: this.getCompletedBatches().length,
      failed_batches: this.getFailedBatches().length,
      total_pending_updates: this.getTotalPendingUpdates(),
    };
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create a batch updater with default configuration
 */
export function createBatchUpdater(
  client: CudaClawClient,
  config?: Partial<BatchConfig>
): BatchUpdater {
  return new BatchUpdater(client, config);
}

/**
 * Execute a one-time batch operation
 */
export async function executeOneTimeBatch(
  client: CudaClawClient,
  sheetId: string,
  updates: Array<{
    cellId: CellID;
    value: number | string;
    options?: {
      type?: 'NUMBER' | 'STRING' | 'FORMULA';
      formula?: string;
      node_id?: string;
      timestamp?: number;
    };
  }>,
  config?: Partial<BatchConfig>
): Promise<BatchUpdateResult> {
  const batchUpdater = new BatchUpdater(client, config);
  const batchId = batchUpdater.createBatch(sheetId, config);

  updates.forEach(({ cellId, value, options }) => {
    batchUpdater.addUpdate(batchId, cellId, value, options);
  });

  return await batchUpdater.executeBatch(batchId);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default BatchUpdater;
