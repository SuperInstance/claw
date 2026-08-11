/**
 * Database Mock
 */

import { jest } from '@jest/globals';

export class MockDatabase {
  private data: Map<string, any> = new Map();
  private tables: Map<string, Map<string, any>> = new Map();

  constructor() {
    // Initialize common tables
    this.tables.set('users', new Map());
    this.tables.set('sessions', new Map());
    this.tables.set('posts', new Map());
    this.tables.set('comments', new Map());
    this.tables.set('analytics', new Map());
  }

  connect = jest.fn().mockResolvedValue(this);

  disconnect = jest.fn().mockResolvedValue(undefined);

  query = jest.fn((sql: string, params: any[] = []) => {
    return Promise.resolve([]);
  });

  select = jest.fn((table: string, where: Record<string, any> = {}) => {
    const tableData = this.tables.get(table) || new Map();
    const results = Array.from(tableData.values()).filter((row) => {
      return Object.entries(where).every(([key, value]) => row[key] === value);
    });
    return Promise.resolve(results);
  });

  insert = jest.fn((table: string, data: any) => {
    const tableData = this.tables.get(table) || new Map();
    const id = data.id || `id-${Date.now()}-${Math.random()}`;
    const row = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
    tableData.set(id, row);
    this.tables.set(table, tableData);
    return Promise.resolve(row);
  });

  update = jest.fn((table: string, id: string, data: any) => {
    const tableData = this.tables.get(table) || new Map();
    const existing = tableData.get(id);
    if (existing) {
      const updated = { ...existing, ...data, updatedAt: new Date() };
      tableData.set(id, updated);
      return Promise.resolve(updated);
    }
    return Promise.resolve(null);
  });

  delete = jest.fn((table: string, id: string) => {
    const tableData = this.tables.get(table) || new Map();
    const deleted = tableData.get(id);
    tableData.delete(id);
    return Promise.resolve(deleted);
  });

  transaction = jest.fn(async (callback: any) => {
    try {
      await callback(this);
      return { committed: true };
    } catch (error) {
      return { committed: false, error };
    }
  });

  // Helper methods for testing
  clear = jest.fn(() => {
    this.tables.forEach((table) => table.clear());
  });

  getTable = jest.fn((table: string) => {
    return this.tables.get(table);
  });

  reset = jest.fn(() => {
    this.tables.clear();
    this.tables.set('users', new Map());
    this.tables.set('sessions', new Map());
    this.tables.set('posts', new Map());
    this.tables.set('comments', new Map());
    this.tables.set('analytics', new Map());
  });
}

export const createMockDatabase = () => new MockDatabase();
