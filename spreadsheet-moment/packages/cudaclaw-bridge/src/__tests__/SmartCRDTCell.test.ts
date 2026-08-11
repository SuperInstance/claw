/**
 * SmartCRDTCell Tests
 */

import { SmartCRDTCell, CellState } from '../index';

describe('SmartCRDTCell', () => {
  describe('Creation', () => {
    it('should create a numeric cell', () => {
      const cell = SmartCRDTCell.create(42, 'node_123');
      expect(cell.getNumericValue()).toBe(42);
      expect(cell.getNodeId()).toBe('node_123');
      expect(cell.getState()).toBe(CellState.ACTIVE);
    });

    it('should create a string cell', () => {
      const cell = SmartCRDTCell.create('hello', 'node_123');
      expect(cell.getStringValue()).toBe('hello');
      expect(cell.isString()).toBe(true);
    });

    it('should create a formula cell', () => {
      const cell = SmartCRDTCell.create('=A1+B1', 'node_123', {
        formula: '=A1+B1',
      });
      expect(cell.getFormula()).toBe('=A1+B1');
      expect(cell.isFormula()).toBe(true);
    });
  });

  describe('CRDT Operations', () => {
    it('should merge cells with last-write-wins', () => {
      const cell1 = SmartCRDTCell.create(42, 'node_123', { timestamp: 1000 });
      const cell2 = SmartCRDTCell.create(43, 'node_456', { timestamp: 2000 });

      const merged = cell1.merge(cell2);
      expect(merged.getNumericValue()).toBe(43); // cell2 wins (newer timestamp)
    });

    it('should use node ID as tiebreaker', () => {
      const cell1 = SmartCRDTCell.create(42, 'node_123', { timestamp: 1000 });
      const cell2 = SmartCRDTCell.create(43, 'node_456', { timestamp: 1000 });

      const merged = cell1.merge(cell2);
      expect(merged.getNumericValue()).toBe(43); // cell2 wins (higher node ID)
    });

    it('should resolve conflicts from multiple updates', () => {
      const updates = [
        SmartCRDTCell.create(42, 'node_123', { timestamp: 1000 }),
        SmartCRDTCell.create(43, 'node_456', { timestamp: 2000 }),
        SmartCRDTCell.create(44, 'node_789', { timestamp: 1500 }),
      ];

      const resolved = SmartCRDTCell.resolveConflict(updates);
      expect(resolved.getNumericValue()).toBe(43); // node_456 wins (newest timestamp)
    });
  });

  describe('State Transitions', () => {
    it('should mark cell as deleted', () => {
      const cell = SmartCRDTCell.create(42, 'node_123');
      const deleted = cell.markDeleted();
      expect(deleted.isDeleted()).toBe(true);
    });

    it('should mark cell as locked', () => {
      const cell = SmartCRDTCell.create(42, 'node_123');
      const locked = cell.markLocked();
      expect(locked.isLocked()).toBe(true);
    });

    it('should mark cell as conflict', () => {
      const cell = SmartCRDTCell.create(42, 'node_123');
      const conflict = cell.markConflict();
      expect(conflict.hasConflict()).toBe(true);
    });
  });

  describe('Value Updates', () => {
    it('should update value', () => {
      const cell = SmartCRDTCell.create(42, 'node_123');
      const updated = cell.updateValue(43, 'node_456');
      expect(updated.getNumericValue()).toBe(43);
      expect(updated.getNodeId()).toBe('node_456');
    });

    it('should update formula', () => {
      const cell = SmartCRDTCell.create(42, 'node_123');
      const updated = cell.updateFormula('=A1+B1', 'node_456');
      expect(updated.getFormula()).toBe('=A1+B1');
    });

    it('should update cached result', () => {
      const cell = SmartCRDTCell.create('=A1+B1', 'node_123', {
        formula: '=A1+B1',
      });
      const updated = cell.updateCachedResult(42);
      expect(updated.getCachedResult()).toBe(42);
    });
  });

  describe('Serialization', () => {
    it('should convert to JSON', () => {
      const cell = SmartCRDTCell.create(42, 'node_123');
      const json = cell.toJSON();
      expect(json).toHaveProperty('value', 42);
      expect(json).toHaveProperty('node_id', 'node_123');
    });

    it('should create from JSON', () => {
      const data = {
        value: 42,
        timestamp: 1000,
        node_id: 'node_123',
        state: CellState.ACTIVE,
      };
      const cell = SmartCRDTCell.fromJSON(data);
      expect(cell.getNumericValue()).toBe(42);
    });
  });

  describe('Utility Methods', () => {
    it('should clone cell', () => {
      const cell = SmartCRDTCell.create(42, 'node_123');
      const cloned = cell.clone();
      expect(cloned.equals(cell)).toBe(true);
    });

    it('should compare cells', () => {
      const cell1 = SmartCRDTCell.create(42, 'node_123', { timestamp: 1000 });
      const cell2 = SmartCRDTCell.create(42, 'node_123', { timestamp: 1000 });
      expect(cell1.equals(cell2)).toBe(true);
    });
  });
});
