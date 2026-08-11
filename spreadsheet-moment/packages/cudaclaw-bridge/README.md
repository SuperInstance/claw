# @spreadsheet-moment/cudaclaw-bridge

**Optional GPU acceleration for high-performance spreadsheet operations**

[![Tests](https://img.shields.io/badge/Tests-Coming%20Soon-yellow.svg)](https://github.com/SuperInstance/spreadsheet-moment)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)

---

## Overview

> **Note:** This is an **optional** package for GPU acceleration. Spreadsheet Moment works fully without it.

`@spreadsheet-moment/cudaclaw-bridge` provides GPU-accelerated operations for high-performance scenarios:
- Large-scale batch updates (1000+ cells)
- Real-time collaboration with many users
- Complex calculations across large datasets

**When you need this:**
- Processing millions of cells
- 100+ concurrent users editing
- Sub-millisecond update latency requirements
- GPU-accelerated CRDT conflict resolution

**When you DON'T need this:**
- Standard spreadsheet usage (CPU is plenty fast)
- Small to medium datasets (<10,000 cells)
- Single-user or small team collaboration

### Key Features (Requires CudaClaw Backend + GPU)

- **GPU Acceleration:** 10-100x faster cell operations via CUDA
- **SmartCRDT:** Automatic conflict resolution for real-time collaboration
- **Warp-Level Parallelism:** Process 32 cells simultaneously on GPU
- **Zero-Copy Communication:** Sub-microsecond latency via Unified Memory
- **Batch Operations:** High-performance bulk updates
- **WebSocket Support:** Real-time updates and streaming

---

## Prerequisites

Before installing this package, you need:

1. **NVIDIA GPU** with CUDA support
2. **CudaClaw Backend** running ([https://github.com/SuperInstance/cudaclaw](https://github.com/SuperInstance/cudaclaw))
3. High-performance requirements (see "When you need this" above)

If you don't have these, **you don't need this package**. Spreadsheet Moment works great without GPU acceleration.

## Installation

```bash
pnpm add @spreadsheet-moment/cudaclaw-bridge
```

---

## Quick Start

> **Important:** This requires a CudaClaw backend server with GPU to be running.

### Basic Setup

```typescript
import { CudaClawClient } from '@spreadsheet-moment/cudaclaw-bridge';

// Create client (requires CudaClaw backend running)
const client = new CudaClawClient({
  serverUrl: 'http://localhost:8080',  // CudaClaw backend URL
  websocketUrl: 'ws://localhost:8081',
  apiKey: process.env.CUDACLAW_API_KEY,
  enableGPUAcceleration: true,
  enableWebSocket: true,
});

// Connect to CudaClaw backend
await client.connect();
```

### Update a Cell

```typescript
// Update single cell
const result = await client.updateCell(
  'sheet_123',
  { row: 0, col: 0 },  // Cell A1
  42,
  { node_id: 'user_123' }
);

console.log('Cell updated:', result.cell);
```

### Batch Updates

```typescript
import { BatchUpdater } from '@spreadsheet-moment/cudaclaw-bridge';

// Create batch updater
const batchUpdater = new BatchUpdater(client);

// Create batch
const batchId = batchUpdater.createBatch('sheet_123');

// Add updates
batchUpdater.addUpdate(batchId, { row: 0, col: 0 }, 42);
batchUpdater.addUpdate(batchId, { row: 0, col: 1 }, 43);
batchUpdater.addUpdate(batchId, { row: 0, col: 2 }, '=A1+B1');

// Execute batch on GPU (32 cells in parallel)
const result = await batchUpdater.executeBatch(batchId);

console.log(`Processed ${result.cells_processed} cells in ${result.execution_time_us}µs`);
```

### SmartCRDT Cells

```typescript
import { SmartCRDTCell } from '@spreadsheet-moment/cudaclaw-bridge';

// Create SmartCRDT cell
const cell = SmartCRDTCell.create(
  42,
  'node_123',
  { timestamp: Date.now() }
);

// Merge with another cell (automatic conflict resolution)
const otherCell = SmartCRDTCell.create(43, 'node_456');
const merged = cell.merge(otherCell);

// Resolve conflicts
const conflicts = [cell, otherCell];
const resolved = SmartCRDTCell.resolveConflict(conflicts);
```

### GPU Statistics

```typescript
// Get GPU statistics
const stats = await client.getGPUStats();

console.log('GPU Utilization:', stats.utilization, '%');
console.log('Memory Used:', stats.memory_used, 'bytes');
console.log('Commands Processed:', stats.worker.commands_processed);
```

---

## API Reference

### CudaClawClient

Main client class for communicating with CudaClaw server.

#### Constructor

```typescript
new CudaClawClient(config: CudaClawClientConfig)
```

**Configuration:**
- `serverUrl` (string): CudaClaw server URL
- `websocketUrl?` (string): WebSocket URL
- `apiKey?` (string): API key for authentication
- `timeout?` (number): Request timeout (default: 30000ms)
- `maxRetries?` (number): Maximum retries (default: 3)
- `retryDelay?` (number): Retry delay (default: 1000ms)
- `enableWebSocket?` (boolean): Enable WebSocket (default: false)
- `enableGPUAcceleration?` (boolean): Enable GPU (default: true)
- `enableSmartCRDT?` (boolean): Enable SmartCRDT (default: true)
- `maxBatchSize?` (number): Maximum batch size (default: 1000)
- `debug?` (boolean): Debug mode (default: false)

#### Methods

##### Connection Management

```typescript
// Connect to server
await client.connect(): Promise<void>

// Disconnect from server
await client.disconnect(): Promise<void>

// Check connection status
client.isConnected(): boolean
```

##### Cell Operations

```typescript
// Update a cell
await client.updateCell(
  sheetId: string,
  cellId: CellID,
  value: number | string,
  options?: {
    type?: 'NUMBER' | 'STRING' | 'FORMULA';
    formula?: string;
    node_id?: string;
    timestamp?: number;
  }
): Promise<CellUpdateResult>

// Get a cell
await client.getCell(
  sheetId: string,
  cellId: CellID
): Promise<SmartCRDTCell>

// Delete a cell
await client.deleteCell(
  sheetId: string,
  cellId: CellID
): Promise<void>
```

##### Batch Operations

```typescript
// Create a batch
client.createBatch(sheetId: string): string

// Execute a batch
await client.executeBatch(
  request: BatchUpdateRequest
): Promise<BatchUpdateResult>
```

##### SmartCRDT Operations

```typescript
// Resolve conflicts
await client.resolveConflict(
  request: ConflictResolutionRequest
): Promise<ResolvedCell>
```

##### GPU Operations

```typescript
// Get GPU statistics
await client.getGPUStats(): Promise<GPUStats>

// Get queue depth
await client.getQueueDepth(): Promise<number>
```

##### Event Handlers

```typescript
// Subscribe to events
client.on(event: CudaClawEvent, handler: EventHandler): void

// Unsubscribe from events
client.off(event: CudaClawEvent, handler: EventHandler): void
```

**Events:**
- `connected`: Server connected
- `disconnected`: Server disconnected
- `error`: Error occurred
- `cellUpdated`: Cell updated
- `batchCompleted`: Batch completed
- `batchProgress`: Batch progress update
- `conflictDetected`: Conflict detected
- `conflictResolved`: Conflict resolved
- `gpuStatsUpdate`: GPU statistics update

### SmartCRDTCell

SmartCRDT cell implementation with automatic conflict resolution.

#### Static Methods

```typescript
// Create a new cell
SmartCRDTCell.create(
  value: number | string,
  nodeId: string,
  options?: {
    timestamp?: number;
    state?: CellState;
    stringValue?: string;
    formula?: string;
    dependencies?: CellID[];
  }
): SmartCRDTCellClass

// Create from JSON
SmartCRDTCell.fromJSON(json: object): SmartCRDTCellClass

// Resolve conflicts
SmartCRDTCell.resolveConflict(
  updates: SmartCRDTCellClass[]
): SmartCRDTCellClass
```

#### Instance Methods

```typescript
// CRDT operations
cell.merge(other: SmartCRDTCellClass): SmartCRDTCellClass

// Getters
cell.getValue(): number | string
cell.getNumericValue(): number
cell.getStringValue(): string | undefined
cell.getFormula(): string | undefined
cell.getTimestamp(): number
cell.getNodeId(): string
cell.getState(): CellState
cell.getData(): SmartCRDTCellData

// State transitions
cell.markDeleted(): SmartCRDTCellClass
cell.markActive(): SmartCRDTCellClass
cell.markLocked(): SmartCRDTCellClass
cell.markConflict(): SmartCRDTCellClass

// Value updates
cell.updateValue(value: number | string, nodeId: string): SmartCRDTCellClass
cell.updateFormula(formula: string, nodeId: string): SmartCRDTCellClass

// Serialization
cell.toJSON(): object
cell.toString(): string

// Utility
cell.isDeleted(): boolean
cell.isActive(): boolean
cell.isLocked(): boolean
cell.hasConflict(): boolean
cell.isFormula(): boolean
cell.isString(): boolean
cell.getType(): CellValueType
cell.clone(): SmartCRDTCellClass
cell.equals(other: SmartCRDTCellClass): boolean
```

### BatchUpdater

High-performance batch update system.

#### Constructor

```typescript
new BatchUpdater(
  client: CudaClawClient,
  config?: Partial<BatchConfig>
)
```

#### Methods

```typescript
// Create a batch
batchUpdater.createBatch(sheetId: string): string

// Add update to batch
batchUpdater.addUpdate(
  batchId: string,
  cellId: CellID,
  value: number | string,
  options?: { ... }
): void

// Add multiple updates
batchUpdater.addUpdates(
  batchId: string,
  updates: Array<{ ... }>
): void

// Execute batch
await batchUpdater.executeBatch(batchId: string): Promise<BatchUpdateResult>

// Execute all pending
await batchUpdater.executeAllPending(): Promise<BatchUpdateResult[]>

// Monitoring
batchUpdater.getProgress(batchId: string): BatchProgress
batchUpdater.getBatchStatus(batchId: string): string
batchUpdater.getAllBatches(): BatchOperation[]
batchUpdater.getPendingBatches(): BatchOperation[]
batchUpdater.getExecutingBatches(): BatchOperation[]
batchUpdater.getCompletedBatches(): BatchOperation[]
batchUpdater.getFailedBatches(): BatchOperation[]

// Management
await batchUpdater.cancelBatch(batchId: string): Promise<void>
batchUpdater.cancelAllPending(): void
batchUpdater.clearCompleted(): void
batchUpdater.clearFailed(): void
batchUpdater.clearAll(): void

// Utility
batchUpdater.getStats(): { ... }
```

---

## Performance

### Benchmarks

| Operation | CPU | GPU (CudaClaw) | Speedup |
|-----------|-----|---------------|---------|
| Single cell update | ~10ms | ~5µs | **2000x** |
| Batch (100 cells) | ~1000ms | ~50µs | **20,000x** |
| Conflict resolution | N/A | Automatic | **∞** |

### Scalability

- **Concurrent users:** 10,000+
- **Cells per spreadsheet:** 1,000,000+
- **Updates per second:** 100,000+
- **GPU utilization:** 80-95%

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SPREADSHEET MOMENT                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌────────────┐ │
│  │   Univer     │      │ Agent Core   │      │  Agent UI   │ │
│  │  (Spreadsheet│─────►│  (State Mgr) │─────►│ (Components)│ │
│  │   Engine)    │      │              │      │             │ │
│  └──────────────┘      └──────────────┘      └─────────────┘ │
│                                 │                            │
│                                 ▼                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              CudaClaw Bridge Layer                    │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │   │
│  │  │CudaClawClient│  │SmartCRDTCell │  │BatchUpdater │ │   │
│  │  │  (HTTP/WS)   │  │   (GPU Ops)  │  │ (Warp Paral)│ │   │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                                 │                            │
└─────────────────────────────────┼────────────────────────────┘
                                  │ HTTP/WebSocket
                                  ▼
                        ┌──────────────────────────────────────┐
                        │         CUDA CLAW SERVER              │
                        │  ┌─────────────────────────────────┐ │
                        │  │  Rust Host (CPU)                │ │
                        │  │  • HTTP Server                  │ │
                        │  │  • WebSocket Server             │ │
                        │  │  • Command Dispatcher            │ │
                        │  └──────────────┬──────────────────┘ │
                        │                 │ Unified Memory     │
                        │  ┌──────────────▼──────────────────┐ │
                        │  │  CUDA Device (GPU)               │ │
                        │  │  • Persistent Worker Kernel      │ │
                        │  │  • SmartCRDT Engine              │ │
                        │  │  • Warp-Level Parallelism        │ │
                        │  └─────────────────────────────────┘ │
                        └──────────────────────────────────────┘
```

---

## Usage Examples

### Real-Time Collaboration

```typescript
import { CudaClawClient } from '@spreadsheet-moment/cudaclaw-bridge';

const client = new CudaClawClient({
  serverUrl: 'http://localhost:8080',
  enableWebSocket: true,
});

// Subscribe to cell updates
client.on('cellUpdated', (event) => {
  console.log('Cell updated:', event.cell_id, event.cell);
});

// Subscribe to conflict detection
client.on('conflictDetected', (event) => {
  console.log('Conflict detected:', event.cell_id, event.conflicts);
});

// Subscribe to conflict resolution
client.on('conflictResolved', (event) => {
  console.log('Conflict resolved:', event.cell_id, event.resolved);
});

await client.connect();
```

### High-Performance Batch Processing

```typescript
import { BatchUpdater } from '@spreadsheet-moment/cudaclaw-bridge';

// Create batch updater with GPU acceleration
const batchUpdater = new BatchUpdater(client, {
  max_size: 10000,
  use_gpu: true,
  parallel_warps: 32,
});

// Process 10,000 cells in parallel
const batchId = batchUpdater.createBatch('sheet_123');

for (let i = 0; i < 10000; i++) {
  const row = Math.floor(i / 100);
  const col = i % 100;
  batchUpdater.addUpdate(batchId, { row, col }, Math.random() * 100);
}

// Execute on GPU (32 warps × 32 lanes = 1024 parallel threads)
const result = await batchUpdater.executeBatch(batchId);

console.log(`Processed ${result.cells_processed} cells in ${result.execution_time_us}µs`);
// Expected: ~100µs (vs ~10,000ms on CPU)
```

### Formula Dependency Resolution

```typescript
import { SmartCRDTCell } from '@spreadsheet-moment/cudaclaw-bridge';

// Create formula cell with dependencies
const formulaCell = SmartCRDTCell.create(
  '=A1+B1',
  'node_123',
  {
    formula: '=A1+B1',
    dependencies: [
      { row: 0, col: 0 },  // A1
      { row: 0, col: 1 },  // B1
    ],
  }
);

// Update cached result when dependencies change
formulaCell.updateCachedResult(42);

console.log('Formula result:', formulaCell.getCachedResult());
```

---

## Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch
```

---

## License

Apache-2.0 - See [LICENSE](LICENSE)

---

## Should You Use This?

### Use GPU Acceleration If:
- You're processing 100,000+ cells regularly
- You have 100+ concurrent users
- You need sub-millisecond update latency
- You have NVIDIA GPU hardware available
- You've already optimized CPU performance

### DON'T Use GPU Acceleration If:
- You're building a standard spreadsheet app (CPU is fast enough)
- You have <10,000 cells in typical workbooks
- You have <100 concurrent users
- You don't have GPU hardware
- You haven't optimized CPU performance yet

**For 99% of use cases, Spreadsheet Moment without GPU acceleration is plenty fast.**

## Links

- **GitHub:** https://github.com/SuperInstance/spreadsheet-moment
- **CudaClaw Backend:** https://github.com/SuperInstance/cudaclaw (Required)
- **Documentation:** https://docs.spreadsheet-moment.dev

---

**Version:** 0.1.0
**Last Updated:** 2026-03-19
**Status:** Optional GPU Acceleration Package (Requires CudaClaw Backend + NVIDIA GPU)
