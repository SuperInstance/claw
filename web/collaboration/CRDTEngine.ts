/**
 * Spreadsheet Moment - CRDT Engine
 * Round 9: Web-Based Collaborative Editing
 *
 * Implements Conflict-Free Replicated Data Types for collaboration:
 * - LWW-Register (Last-Writer-Wins)
 * - G-Counter (Grow-only Counter)
 * - PN-Counter (Positive-Negative Counter)
 * - OR-Set (Observed-Remove Set)
 * - RGA (Replicated Growable Array)
 * - Text editing with CRDTs
 */

interface CRDTNode {
  id: string;
  timestamp: number;
  clientId: string;
  value: any;
  removed: boolean;
}

interface CRDTClock {
  clientId: string;
  counter: number;
}

/**
 * Hybrid Logical Clock
 */
class HLClock {
  private clientId: string;
  private counter: number = 0;
  private wallTime: number = Date.now();

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  tick(): CRDTClock {
    const now = Date.now();

    if (now > this.wallTime) {
      this.wallTime = now;
      this.counter = 0;
    } else {
      this.counter++;
    }

    return {
      clientId: this.clientId,
      counter: this.counter
    };
  }

  compare(other: CRDTClock): number {
    if (this.wallTime !== other.clientId ? 0 : Date.parse(other.clientId)) {
      return this.wallTime - Date.now();
    }

    if (this.counter !== (other as any).counter) {
      return this.counter - (other as any).counter;
    }

    return this.clientId.localeCompare(other.clientId);
  }

  toString(): string {
    return `${this.clientId}-${this.wallTime}-${this.counter}`;
  }

  fromString(str: string): CRDTClock {
    const parts = str.split('-');
    return {
      clientId: parts[0],
      counter: parseInt(parts[2])
    };
  }
}

/**
 * Last-Writer-Wins Register
 */
export class LWWRegister<T> {
  private value: T;
  private timestamp: CRDTClock;
  private clock: HLClock;

  constructor(initialValue: T, clientId: string) {
    this.value = initialValue;
    this.clock = new HLClock(clientId);
    this.timestamp = this.clock.tick();
  }

  set(value: T): void {
    this.value = value;
    this.timestamp = this.clock.tick();
  }

  get(): T {
    return this.value;
  }

  merge(other: LWWRegister<T>): void {
    const comparison = this.clock.compare(other.timestamp);
    if (comparison < 0) {
      this.value = other.value;
      this.timestamp = other.timestamp;
    }
  }
}

/**
 * Grow-only Counter
 */
export class GCounter {
  private counts: Map<string, number> = new Map();
  private clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
    this.counts.set(clientId, 0);
  }

  increment(amount: number = 1): void {
    const current = this.counts.get(this.clientId) || 0;
    this.counts.set(this.clientId, current + amount);
  }

  get(): number {
    let total = 0;
    for (const count of this.counts.values()) {
      total += count;
    }
    return total;
  }

  merge(other: GCounter): void {
    for (const [clientId, count] of other.counts) {
      const current = this.counts.get(clientId) || 0;
      this.counts.set(clientId, Math.max(current, count));
    }
  }
}

/**
 * Positive-Negative Counter
 */
export class PNCounter {
  private increments: GCounter;
  private decrements: GCounter;

  constructor(clientId: string) {
    this.increments = new GCounter(`${clientId}-inc`);
    this.decrements = new GCounter(`${clientId}-dec`);
  }

  increment(amount: number = 1): void {
    this.increments.increment(amount);
  }

  decrement(amount: number = 1): void {
    this.decrements.increment(amount);
  }

  get(): number {
    return this.increments.get() - this.decrements.get();
  }

  merge(other: PNCounter): void {
    this.increments.merge(other.increments);
    this.decrements.merge(other.decrements);
  }
}

/**
 * Observed-Remove Set
 */
export class ORSet<T> {
  private elements: Map<string, Set<string>> = new Map();
  private tombstones: Set<string> = new Set();
  private clientId: string;
  private clock: HLClock;

  constructor(clientId: string) {
    this.clientId = clientId;
    this.clock = new HLClock(clientId);
  }

  add(value: T): void {
    const valueStr = JSON.stringify(value);
    const uniqueId = this.clock.tick().toString();

    if (!this.elements.has(valueStr)) {
      this.elements.set(valueStr, new Set());
    }

    this.elements.get(valueStr)!.add(uniqueId);
    this.tombstones.delete(valueStr);
  }

  remove(value: T): void {
    const valueStr = JSON.stringify(value);

    if (this.elements.has(valueStr)) {
      this.tombstones.add(valueStr);
      this.elements.delete(valueStr);
    }
  }

  has(value: T): boolean {
    const valueStr = JSON.stringify(value);
    return this.elements.has(valueStr) && !this.tombstones.has(valueStr);
  }

  values(): T[] {
    const result: T[] = [];

    for (const valueStr of this.elements.keys()) {
      if (!this.tombstones.has(valueStr)) {
        result.push(JSON.parse(valueStr));
      }
    }

    return result;
  }

  merge(other: ORSet<T>): void {
    // Merge elements
    for (const [valueStr, ids] of other.elements) {
      if (!this.elements.has(valueStr)) {
        this.elements.set(valueStr, new Set());
      }

      for (const id of ids) {
        if (!other.tombstones.has(valueStr)) {
          this.elements.get(valueStr)!.add(id);
        }
      }
    }

    // Merge tombstones
    for (const tombstone of other.tombstones) {
      if (other.tombstones.has(tombstone)) {
        this.tombstones.add(tombstone);
        this.elements.delete(tombstone);
      }
    }
  }
}

/**
 * Replicated Growable Array (for text editing)
 */
export class RGA {
  private nodes: Map<string, CRDTNode> = new Map();
  private headId: string | null = null;
  private tailId: string | null = null;
  private clientId: string;
  private clock: HLClock;

  constructor(clientId: string) {
    this.clientId = clientId;
    this.clock = new HLClock(clientId);
  }

  insert(value: string, afterId: string | null = null): string {
    const nodeId = this.clock.tick().toString();

    const node: CRDTNode = {
      id: nodeId,
      timestamp: Date.now(),
      clientId: this.clientId,
      value,
      removed: false
    };

    this.nodes.set(nodeId, node);

    if (afterId === null) {
      // Insert at head
      if (this.headId) {
        // Update existing head's next pointer (would need next/prev in real impl)
      }
      this.headId = nodeId;
    } else {
      // Insert after specified node
      // In real implementation, would traverse and insert
    }

    if (!this.tailId) {
      this.tailId = nodeId;
    }

    return nodeId;
  }

  delete(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.removed = true;
    }
  }

  getValues(): string[] {
    const values: string[] = [];

    // Traverse from head
    let currentId = this.headId;
    while (currentId) {
      const node = this.nodes.get(currentId);
      if (node && !node.removed) {
        values.push(node.value);
      }
      // Move to next node (would need next pointer in real impl)
      currentId = null;  // Simplified
    }

    return values;
  }

  merge(other: RGA): void {
    // Merge nodes
    for (const [nodeId, node] of other.nodes) {
      const existing = this.nodes.get(nodeId);

      if (!existing) {
        this.nodes.set(nodeId, { ...node });
      } else if (node.timestamp > existing.timestamp) {
        existing.value = node.value;
        existing.removed = node.removed;
      }
    }

    // Update head/tail if needed
    if (!this.headId && other.headId) {
      this.headId = other.headId;
    }
    if (!this.tailId && other.tailId) {
      this.tailId = other.tailId;
    }
  }
}

/**
 * CRDT Text Document (using RGA)
 */
export class CRDTTextDocument {
  private rga: RGA;
  private clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
    this.rga = new RGA(clientId);
  }

  insert(position: number, text: string): void {
    // Insert text at position
    // In real implementation, would traverse to find correct position
    this.rga.insert(text, null);
  }

  delete(position: number, length: number): void {
    // Delete text at position
    // In real implementation, would traverse and mark nodes as removed
  }

  getText(): string {
    return this.rga.getValues().join('');
  }

  merge(other: CRDTTextDocument): void {
    this.rga.merge(other.rga);
  }

  getOperations(): any[] {
    // Return operations for transmission
    return [];
  }

  applyOperations(operations: any[]): void {
    // Apply remote operations
  }
}

/**
 * CRDT Spreadsheet Cell
 */
export class CRDTCell {
  private value: LWWRegister<string>;
  private formula: LWWRegister<string | null>;
  private dataType: LWWRegister<string>;
  private style: LWWRegister<any>;

  constructor(clientId: string) {
    this.value = new LWWRegister('', clientId);
    this.formula = new LWWRegister(null, clientId);
    this.dataType = new LWWRegister('text', clientId);
    this.style = new LWWRegister({}, clientId);
  }

  setValue(value: string): void {
    this.value.set(value);
  }

  getValue(): string {
    return this.value.get();
  }

  setFormula(formula: string | null): void {
    this.formula.set(formula);
  }

  getFormula(): string | null {
    return this.formula.get();
  }

  setDataType(dataType: string): void {
    this.dataType.set(dataType);
  }

  getDataType(): string {
    return this.dataType.get();
  }

  setStyle(style: any): void {
    this.style.set(style);
  }

  getStyle(): any {
    return this.style.get();
  }

  merge(other: CRDTCell): void {
    this.value.merge(other.value);
    this.formula.merge(other.formula);
    this.dataType.merge(other.dataType);
    this.style.merge(other.style);
  }

  toJSON(): any {
    return {
      value: this.getValue(),
      formula: this.getFormula(),
      dataType: this.getDataType(),
      style: this.getStyle()
    };
  }
}

/**
 * CRDT Spreadsheet
 */
export class CRDTSpreadsheet {
  private cells: Map<string, CRDTCell> = new Map();
  private rowCounter: PNCounter;
  private columnCounter: PNCounter;
  private clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
    this.rowCounter = new PNCounter(clientId);
    this.columnCounter = new PNCounter(clientId);
  }

  getCell(row: number, column: number): CRDTCell {
    const key = `${row},${column}`;

    if (!this.cells.has(key)) {
      this.cells.set(key, new CRDTCell(this.clientId));
    }

    return this.cells.get(key)!;
  }

  setCellValue(row: number, column: number, value: string): void {
    const cell = this.getCell(row, column);
    cell.setValue(value);
  }

  getCellValue(row: number, column: number): string {
    const cell = this.getCell(row, column);
    return cell.getValue();
  }

  setCellFormula(row: number, column: number, formula: string): void {
    const cell = this.getCell(row, column);
    cell.setFormula(formula);
  }

  getCellFormula(row: number, column: number): string | null {
    const cell = this.getCell(row, column);
    return cell.getFormula();
  }

  addRow(): number {
    this.rowCounter.increment();
    return this.rowCounter.get();
  }

  addColumn(): number {
    this.columnCounter.increment();
    return this.columnCounter.get();
  }

  getRowCount(): number {
    return this.rowCounter.get();
  }

  getColumnCount(): number {
    return this.columnCounter.get();
  }

  merge(other: CRDTSpreadsheet): void {
    // Merge cells
    for (const [key, cell] of other.cells) {
      if (this.cells.has(key)) {
        this.cells.get(key)!.merge(cell);
      } else {
        this.cells.set(key, cell);
      }
    }

    // Merge counters
    this.rowCounter.merge(other.rowCounter);
    this.columnCounter.merge(other.columnCounter);
  }

  toJSON(): any {
    const data: any = {};

    for (const [key, cell] of this.cells) {
      data[key] = cell.toJSON();
    }

    return {
      cells: data,
      rowCount: this.getRowCount(),
      columnCount: this.getColumnCount()
    };
  }

  fromJSON(json: any): void {
    this.cells.clear();

    for (const [key, value] of Object.entries(json.cells)) {
      const cell = new CRDTCell(this.clientId);
      cell.setValue(value.value);
      cell.setFormula(value.formula);
      cell.setDataType(value.dataType);
      cell.setStyle(value.style);
      this.cells.set(key, cell);
    }
  }

  getDelta(): any {
    // Return incremental changes for efficient sync
    return {
      type: 'delta',
      changes: []
    };
  }

  applyDelta(delta: any): void {
    // Apply incremental changes from remote
  }
}
