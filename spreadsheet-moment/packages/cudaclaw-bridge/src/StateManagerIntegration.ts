/**
 * StateManager Integration for CudaClaw
 *
 * Integrates CudaClaw GPU-accelerated SmartCRDT operations with
 * SpreadsheetMoment's StateManager for seamless agent state management.
 *
 * @packageDocumentation
 */

import CudaClawClient from './CudaClawClient';
import { SmartCRDTCellClass } from './SmartCRDTCell';
import { BatchUpdater } from './BatchUpdater';
import {
  SmartCRDTCell,
  CellID,
  NodeID,
  CellState,
  AgentCellState,
  IAgentCellData,
} from './types';

// ============================================================================
// STATE MANAGER INTEGRATION CONFIG
// ============================================================================

export interface StateManagerIntegrationConfig {
  /** CudaClaw client instance */
  cudaClawClient: CudaClawClient;

  /** Enable GPU acceleration for state updates */
  enableGPUAcceleration?: boolean;

  /** Enable SmartCRDT for conflict resolution */
  enableSmartCRDT?: boolean;

  /** Enable batch updates */
  enableBatchUpdates?: boolean;

  /** Batch size threshold */
  batchThreshold?: number;

  /** Default node ID for state updates */
  defaultNodeId?: NodeID;
}

// ============================================================================
// STATE MANAGER INTEGRATION CLASS
// ============================================================================

/**
 * StateManager Integration
 *
 * Bridges CudaClaw's SmartCRDT operations with SpreadsheetMoment's StateManager.
 * Provides GPU-accelerated state updates and automatic conflict resolution.
 */
export class StateManagerIntegration {
  private cudaClawClient: CudaClawClient;
  private batchUpdater: BatchUpdater;
  private config: Required<Omit<StateManagerIntegrationConfig, 'cudaClawClient'>>;
  private pendingUpdates: Map<string, SmartCRDTCellClass>;
  private currentBatchId: string | null = null;

  constructor(config: StateManagerIntegrationConfig) {
    this.cudaClawClient = config.cudaClawClient;
    this.config = {
      enableGPUAcceleration: config.enableGPUAcceleration ?? true,
      enableSmartCRDT: config.enableSmartCRDT ?? true,
      enableBatchUpdates: config.enableBatchUpdates ?? true,
      batchThreshold: config.batchThreshold ?? 10,
      defaultNodeId: config.defaultNodeId ?? 'spreadsheet_moment',
    };
    this.batchUpdater = new BatchUpdater(this.cudaClawClient);
    this.pendingUpdates = new Map();
  }

  // ========================================================================
  // STATE TRANSITION METHODS
  // ========================================================================

  /**
   * Transition agent cell state with GPU acceleration
   */
  async transitionAgentState(
    sheetId: string,
    cellId: CellID,
    fromState: AgentCellState,
    toState: AgentCellState,
    agentData: IAgentCellData
  ): Promise<IAgentCellData> {
    // Create SmartCRDT cell from agent data
    const crdtCell = this.createSmartCRDTFromAgentData(agentData, cellId);

    // Update state
    const updatedCell = this.updateCellState(crdtCell, toState);

    // Store pending update
    const cellKey = this.cellIdToString(cellId);
    this.pendingUpdates.set(cellKey, updatedCell);

    // Check if we should flush updates
    if (this.pendingUpdates.size >= this.config.batchThreshold) {
      await this.flushUpdates(sheetId);
    }

    // Return updated agent data
    return this.createAgentDataFromSmartCRDT(updatedCell, agentData);
  }

  /**
   * Batch update multiple agent states
   */
  async batchTransitionAgentStates(
    sheetId: string,
    transitions: Array<{
      cellId: CellID;
      fromState: AgentCellState;
      toState: AgentCellState;
      agentData: IAgentCellData;
    }>
  ): Promise<IAgentCellData[]> {
    const results: IAgentCellData[] = [];

    // Create or get batch
    if (!this.currentBatchId) {
      this.currentBatchId = this.batchUpdater.createBatch(sheetId);
    }

    // Process each transition
    for (const transition of transitions) {
      const crdtCell = this.createSmartCRDTFromAgentData(
        transition.agentData,
        transition.cellId
      );
      const updatedCell = this.updateCellState(crdtCell, transition.toState);

      // Add to batch
      this.batchUpdater.addUpdate(
        this.currentBatchId,
        transition.cellId,
        updatedCell.getValue(),
        {
          node_id: this.config.defaultNodeId,
          timestamp: updatedCell.getTimestamp(),
        }
      );

      results.push(
        this.createAgentDataFromSmartCRDT(updatedCell, transition.agentData)
      );
    }

    // Execute batch
    if (this.currentBatchId) {
      await this.batchUpdater.executeBatch(this.currentBatchId);
      this.currentBatchId = null;
    }

    return results;
  }

  // ========================================================================
  // CONFLICT RESOLUTION
  // ========================================================================

  /**
   * Resolve conflicts in agent cell state
   */
  async resolveAgentStateConflict(
    sheetId: string,
    cellId: CellID,
    conflictingStates: IAgentCellData[]
  ): Promise<IAgentCellData> {
    if (!this.config.enableSmartCRDT) {
      // Fallback to simple last-write-wins
      return conflictingStates[conflictingStates.length - 1];
    }

    // Convert to SmartCRDT cells
    const crdtCells = conflictingStates.map(data =>
      this.createSmartCRDTFromAgentData(data, cellId)
    );

    // Resolve conflict
    const resolved = SmartCRDTCellClass.resolveConflict(crdtCells);

    // Update cell on GPU
    if (this.config.enableGPUAcceleration) {
      await this.cudaClawClient.updateCell(
        sheetId,
        cellId,
        resolved.getValue(),
        {
          node_id: this.config.defaultNodeId,
          timestamp: resolved.getTimestamp(),
        }
      );
    }

    // Return as agent data
    return this.createAgentDataFromSmartCRDT(resolved, conflictingStates[0]);
  }

  // ========================================================================
  // STATE QUERY METHODS
  // ========================================================================

  /**
   * Get agent cell state from GPU
   */
  async getAgentState(
    sheetId: string,
    cellId: CellID
  ): Promise<SmartCRDTCell | null> {
    try {
      return await this.cudaClawClient.getCell(sheetId, cellId);
    } catch (error) {
      console.error('Error getting agent state:', error);
      return null;
    }
  }

  /**
   * Get multiple agent states in batch
   */
  async getAgentStatesBatch(
    sheetId: string,
    cellIds: CellID[]
  ): Promise<Map<string, SmartCRDTCell>> {
    const results = new Map<string, SmartCRDTCell>();

    for (const cellId of cellIds) {
      const cell = await this.getAgentState(sheetId, cellId);
      if (cell) {
        const key = this.cellIdToString(cellId);
        results.set(key, cell);
      }
    }

    return results;
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Flush pending updates to GPU
   */
  async flushUpdates(sheetId: string): Promise<void> {
    if (this.pendingUpdates.size === 0) {
      return;
    }

    // Create batch
    const batchId = this.batchUpdater.createBatch(sheetId);

    // Add all pending updates
    for (const [cellKey, cell] of this.pendingUpdates.entries()) {
      const cellId = this.stringToCellId(cellKey);
      this.batchUpdater.addUpdate(
        batchId,
        cellId,
        cell.getValue(),
        {
          node_id: this.config.defaultNodeId,
          timestamp: cell.getTimestamp(),
        }
      );
    }

    // Execute batch
    await this.batchUpdater.executeBatch(batchId);

    // Clear pending updates
    this.pendingUpdates.clear();
  }

  /**
   * Get integration statistics
   */
  getStats(): {
    pendingUpdates: number;
    batchStats: ReturnType<BatchUpdater['getStats']>;
    gpuEnabled: boolean;
    smartCRDTEnabled: boolean;
    batchUpdatesEnabled: boolean;
  } {
    return {
      pendingUpdates: this.pendingUpdates.size,
      batchStats: this.batchUpdater.getStats(),
      gpuEnabled: this.config.enableGPUAcceleration,
      smartCRDTEnabled: this.config.enableSmartCRDT,
      batchUpdatesEnabled: this.config.enableBatchUpdates,
    };
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  /**
   * Create SmartCRDT cell from agent data
   */
  private createSmartCRDTFromAgentData(
    agentData: IAgentCellData,
    cellId: CellID
  ): SmartCRDTCellClass {
    const value =
      typeof agentData.v === 'number'
        ? agentData.v
        : parseFloat(String(agentData.v ?? '0'));

    return SmartCRDTCellClass.create(value, this.config.defaultNodeId, {
      timestamp: agentData.updated_at || Date.now(),
      state: this.mapAgentStateToCellState(agentData.state),
      stringValue: typeof agentData.v === 'string' ? agentData.v : undefined,
      formula: agentData.f,
    });
  }

  /**
   * Create agent data from SmartCRDT cell
   */
  private createAgentDataFromSmartCRDT(
    crdtCell: SmartCRDTCellClass,
    originalAgentData: IAgentCellData
  ): IAgentCellData {
    return {
      ...originalAgentData,
      v: crdtCell.getValue(),
      f: crdtCell.getFormula(),
      state: this.mapCellStateToAgentState(crdtCell.getState()),
      updated_at: crdtCell.getTimestamp(),
    };
  }

  /**
   * Update cell state
   */
  private updateCellState(
    cell: SmartCRDTCellClass,
    newState: AgentCellState
  ): SmartCRDTCellClass {
    const cellState = this.mapAgentStateToCellState(newState);

    switch (cellState) {
      case CellState.ACTIVE:
        return cell.markActive();
      case CellState.DELETED:
        return cell.markDeleted();
      case CellState.LOCKED:
        return cell.markLocked();
      case CellState.CONFLICT:
        return cell.markConflict();
      default:
        return cell;
    }
  }

  /**
   * Map agent state to cell state
   */
  private mapAgentStateToCellState(agentState: AgentCellState): CellState {
    switch (agentState) {
      case 'DORMANT':
      case 'IDLE':
      case 'POSTED':
        return CellState.ACTIVE;
      case 'THINKING':
      case 'ACTING':
        return CellState.LOCKED;
      case 'NEEDS_REVIEW':
      case 'ERROR':
        return CellState.CONFLICT;
      case 'DELETED':
        return CellState.DELETED;
      default:
        return CellState.ACTIVE;
    }
  }

  /**
   * Map cell state to agent state
   */
  private mapCellStateToAgentState(cellState: CellState): AgentCellState {
    switch (cellState) {
      case CellState.ACTIVE:
        return 'POSTED';
      case CellState.DELETED:
        return 'DELETED';
      case CellState.CONFLICT:
        return 'NEEDS_REVIEW';
      case CellState.LOCKED:
        return 'THINKING';
      default:
        return 'POSTED';
    }
  }

  /**
   * Convert cell ID to string key
   */
  private cellIdToString(cellId: CellID): string {
    return `${cellId.row},${cellId.col}`;
  }

  /**
   * Convert string key to cell ID
   */
  private stringToCellId(key: string): CellID {
    const [row, col] = key.split(',').map(Number);
    return { row, col };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default StateManagerIntegration;
