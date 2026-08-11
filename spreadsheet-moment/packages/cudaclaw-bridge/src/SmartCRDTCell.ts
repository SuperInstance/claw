/**
 * SmartCRDT Cell
 *
 * Implementation of SmartCRDT (Conflict-free Replicated Data Type) for spreadsheet cells.
 * Provides automatic conflict resolution, origin tracking, and GPU acceleration support.
 *
 * @packageDocumentation
 */

import {
  SmartCRDTCell as SmartCRDTCellData,
  CellState,
  CellID,
  NodeID,
  LamportTimestamp,
  CellValueType,
} from './types';

// ============================================================================
// SMART CRDT CELL CLASS
// ============================================================================

/**
 * SmartCRDT Cell
 *
 * Implements a CRDT cell with automatic conflict resolution.
 * Uses last-write-wins semantics with Lamport timestamps.
 */
export class SmartCRDTCellClass {
  private data: SmartCRDTCellData;

  constructor(data: SmartCRDTCellData) {
    this.data = { ...data };
  }

  // ========================================================================
  // FACTORY METHODS
  // ========================================================================

  /**
   * Create a new SmartCRDT cell
   */
  static create(
    value: number | string,
    nodeId: NodeID,
    options?: {
      timestamp?: LamportTimestamp;
      state?: CellState;
      stringValue?: string;
      formula?: string;
      dependencies?: CellID[];
    }
  ): SmartCRDTCellClass {
    const numericValue = typeof value === 'number' ? value : 0;

    return new SmartCRDTCellClass({
      value: numericValue,
      timestamp: options?.timestamp || SmartCRDTCellClass.generateTimestamp(),
      node_id: nodeId,
      state: options?.state || CellState.ACTIVE,
      string_value: options?.stringValue || (typeof value === 'string' ? value : undefined),
      formula: options?.formula,
      cached_result: options?.formula ? numericValue : undefined,
      dependencies: options?.dependencies,
    });
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: object): SmartCRDTCellClass {
    return new SmartCRDTCellClass(json as SmartCRDTCellData);
  }

  // ========================================================================
  // CRDT OPERATIONS
  // ========================================================================

  /**
   * Merge with another SmartCRDT cell
   * Uses last-write-wins semantics based on Lamport timestamps
   */
  merge(other: SmartCRDTCellClass): SmartCRDTCellClass {
    const otherData = other.getData();

    // Compare timestamps
    if (otherData.timestamp > this.data.timestamp) {
      // Other is newer
      return new SmartCRDTCellClass({ ...otherData });
    } else if (otherData.timestamp < this.data.timestamp) {
      // This is newer
      return new SmartCRDTCellClass({ ...this.data });
    } else {
      // Timestamps are equal, use node ID as tiebreaker
      if (otherData.node_id > this.data.node_id) {
        return new SmartCRDTCellClass({ ...otherData });
      } else {
        return new SmartCRDTCellClass({ ...this.data });
      }
    }
  }

  /**
   * Resolve conflict with multiple updates
   * Returns the cell with the highest timestamp (or node ID as tiebreaker)
   */
  static resolveConflict(updates: SmartCRDTCellClass[]): SmartCRDTCellClass {
    if (updates.length === 0) {
      throw new Error('Cannot resolve conflict: no updates provided');
    }

    if (updates.length === 1) {
      return updates[0];
    }

    // Find the update with the highest timestamp
    let winner = updates[0];
    for (let i = 1; i < updates.length; i++) {
      const current = updates[i];
      const winnerData = winner.getData();
      const currentData = current.getData();

      if (currentData.timestamp > winnerData.timestamp) {
        winner = current;
      } else if (currentData.timestamp === winnerData.timestamp) {
        // Timestamps are equal, use node ID as tiebreaker
        if (currentData.node_id > winnerData.node_id) {
          winner = current;
        }
      }
    }

    return winner;
  }

  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  /**
   * Get cell value
   */
  getValue(): number | string {
    return this.data.string_value || this.data.value;
  }

  /**
   * Get numeric value
   */
  getNumericValue(): number {
    return this.data.value;
  }

  /**
   * Get string value
   */
  getStringValue(): string | undefined {
    return this.data.string_value;
  }

  /**
   * Get formula
   */
  getFormula(): string | undefined {
    return this.data.formula;
  }

  /**
   * Get cached result
   */
  getCachedResult(): number | undefined {
    return this.data.cached_result;
  }

  /**
   * Get timestamp
   */
  getTimestamp(): LamportTimestamp {
    return this.data.timestamp;
  }

  /**
   * Get node ID
   */
  getNodeId(): NodeID {
    return this.data.node_id;
  }

  /**
   * Get state
   */
  getState(): CellState {
    return this.data.state;
  }

  /**
   * Get dependencies
   */
  getDependencies(): CellID[] | undefined {
    return this.data.dependencies;
  }

  /**
   * Get full data
   */
  getData(): SmartCRDTCellData {
    return { ...this.data };
  }

  // ========================================================================
  // STATE TRANSITIONS
  // ========================================================================

  /**
   * Mark as deleted
   */
  markDeleted(): SmartCRDTCellClass {
    return new SmartCRDTCellClass({
      ...this.data,
      state: CellState.DELETED,
      timestamp: SmartCRDTCellClass.generateTimestamp(),
    });
  }

  /**
   * Mark as active
   */
  markActive(): SmartCRDTCellClass {
    return new SmartCRDTCellClass({
      ...this.data,
      state: CellState.ACTIVE,
      timestamp: SmartCRDTCellClass.generateTimestamp(),
    });
  }

  /**
   * Mark as locked
   */
  markLocked(): SmartCRDTCellClass {
    return new SmartCRDTCellClass({
      ...this.data,
      state: CellState.LOCKED,
      timestamp: SmartCRDTCellClass.generateTimestamp(),
    });
  }

  /**
   * Mark as conflict
   */
  markConflict(): SmartCRDTCellClass {
    return new SmartCRDTCellClass({
      ...this.data,
      state: CellState.CONFLICT,
      timestamp: SmartCRDTCellClass.generateTimestamp(),
    });
  }

  // ========================================================================
  // VALUE UPDATES
  // ========================================================================

  /**
   * Update value
   */
  updateValue(value: number | string, nodeId: NodeID): SmartCRDTCellClass {
    const numericValue = typeof value === 'number' ? value : this.data.value;

    return new SmartCRDTCellClass({
      ...this.data,
      value: numericValue,
      string_value: typeof value === 'string' ? value : this.data.string_value,
      timestamp: SmartCRDTCellClass.generateTimestamp(),
      node_id: nodeId,
      state: CellState.ACTIVE,
    });
  }

  /**
   * Update formula
   */
  updateFormula(formula: string, nodeId: NodeID): SmartCRDTCellClass {
    return new SmartCRDTCellClass({
      ...this.data,
      formula,
      timestamp: SmartCRDTCellClass.generateTimestamp(),
      node_id: nodeId,
      state: CellState.ACTIVE,
    });
  }

  /**
   * Update cached result
   */
  updateCachedResult(result: number): SmartCRDTCellClass {
    return new SmartCRDTCellClass({
      ...this.data,
      cached_result: result,
    });
  }

  // ========================================================================
  // SERIALIZATION
  // ========================================================================

  /**
   * Convert to JSON
   */
  toJSON(): object {
    return {
      ...this.data,
      _type: 'SmartCRDTCell',
    };
  }

  /**
   * Convert to string
   */
  toString(): string {
    return JSON.stringify(this.toJSON());
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Check if cell is deleted
   */
  isDeleted(): boolean {
    return this.data.state === CellState.DELETED;
  }

  /**
   * Check if cell is active
   */
  isActive(): boolean {
    return this.data.state === CellState.ACTIVE;
  }

  /**
   * Check if cell is locked
   */
  isLocked(): boolean {
    return this.data.state === CellState.LOCKED;
  }

  /**
   * Check if cell has conflict
   */
  hasConflict(): boolean {
    return this.data.state === CellState.CONFLICT;
  }

  /**
   * Check if cell is a formula
   */
  isFormula(): boolean {
    return this.data.formula !== undefined;
  }

  /**
   * Check if cell is a string
   */
  isString(): boolean {
    return this.data.string_value !== undefined;
  }

  /**
   * Get cell type
   */
  getType(): CellValueType {
    if (this.data.formula) {
      return CellValueType.FORMULA;
    } else if (this.data.string_value) {
      return CellValueType.STRING;
    } else {
      return CellValueType.NUMBER;
    }
  }

  /**
   * Clone cell
   */
  clone(): SmartCRDTCellClass {
    return new SmartCRDTCellClass({ ...this.data });
  }

  /**
   * Generate Lamport timestamp
   */
  private static generateTimestamp(): LamportTimestamp {
    return Date.now();
  }

  /**
   * Compare two cells
   */
  compare(other: SmartCRDTCellClass): number {
    const thisData = this.getData();
    const otherData = other.getData();

    if (thisData.timestamp < otherData.timestamp) {
      return -1;
    } else if (thisData.timestamp > otherData.timestamp) {
      return 1;
    } else {
      // Timestamps are equal, compare node IDs
      if (thisData.node_id < otherData.node_id) {
        return -1;
      } else if (thisData.node_id > otherData.node_id) {
        return 1;
      } else {
        return 0;
      }
    }
  }

  /**
   * Check if two cells are equal
   */
  equals(other: SmartCRDTCellClass): boolean {
    return this.compare(other) === 0;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a new SmartCRDT cell (convenience function)
 */
export function createSmartCRDTCell(
  value: number | string,
  nodeId: string,
  options?: {
    timestamp?: number;
    state?: CellState;
    stringValue?: string;
    formula?: string;
    dependencies?: CellID[];
  }
): SmartCRDTCellClass {
  return SmartCRDTCellClass.create(value, nodeId, options);
}

/**
 * Resolve conflicts in an array of SmartCRDT cells
 */
export function resolveSmartCRDTConflicts(updates: SmartCRDTCellClass[]): SmartCRDTCellClass {
  return SmartCRDTCellClass.resolveConflict(updates);
}

/**
 * Merge multiple SmartCRDT cells
 */
export function mergeSmartCRDTCells(cells: SmartCRDTCellClass[]): SmartCRDTCellClass {
  if (cells.length === 0) {
    throw new Error('Cannot merge: no cells provided');
  }

  if (cells.length === 1) {
    return cells[0];
  }

  // Start with the first cell
  let merged = cells[0];

  // Merge with each subsequent cell
  for (let i = 1; i < cells.length; i++) {
    merged = merged.merge(cells[i]);
  }

  return merged;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default SmartCRDTCellClass;
