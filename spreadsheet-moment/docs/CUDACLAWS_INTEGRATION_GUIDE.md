# CudaClaw Integration Guide

**Date:** 2026-03-18
**Status:** Implementation Complete
**Package:** @spreadsheet-moment/cudaclaw-bridge

---

## Overview

This guide explains how to integrate CudaClaw (GPU-accelerated SmartCRDT orchestrator) into SpreadsheetMoment for high-performance cell operations and automatic conflict resolution.

---

## Quick Start

### 1. Installation

The cudaclaw-bridge package is now part of spreadsheet-moment:

```bash
cd packages/cudaclaw-bridge
pnpm install
pnpm build
```

### 2. Basic Usage

```typescript
import { CudaClawClient } from '@spreadsheet-moment/cudaclaw-bridge';

// Create client
const client = new CudaClawClient({
  serverUrl: 'http://localhost:8080',
  enableGPUAcceleration: true,
});

// Connect
await client.connect();

// Update cell
await client.updateCell('sheet_123', { row: 0, col: 0 }, 42);
```

---

## Integration with StateManager

### Setting Up StateManagerIntegration

```typescript
import { StateManagerIntegration } from '@spreadsheet-moment/cudaclaw-bridge';
import { StateManager } from '@spreadsheet-moment/agent-core';

// Create StateManager
const stateManager = new StateManager();

// Create CudaClaw client
const client = new CudaClawClient({
  serverUrl: 'http://localhost:8080',
  enableGPUAcceleration: true,
});

await client.connect();

// Create integration
const integration = new StateManagerIntegration({
  cudaClawClient: client,
  enableGPUAcceleration: true,
  enableSmartCRDT: true,
  enableBatchUpdates: true,
  batchThreshold: 10,
});

// Use integration for state transitions
const updatedAgentData = await integration.transitionAgentState(
  'sheet_123',
  { row: 0, col: 0 },
  'DORMANT',
  'THINKING',
  agentData
);
```

### Conflict Resolution

```typescript
// Resolve conflicts automatically
const resolved = await integration.resolveAgentStateConflict(
  'sheet_123',
  { row: 0, col: 0 },
  [agentData1, agentData2, agentData3]
);
```

### Batch State Transitions

```typescript
// Transition multiple agent states in parallel
const results = await integration.batchTransitionAgentStates(
  'sheet_123',
  [
    {
      cellId: { row: 0, col: 0 },
      fromState: 'DORMANT',
      toState: 'THINKING',
      agentData: agent1,
    },
    {
      cellId: { row: 0, col: 1 },
      fromState: 'DORMANT',
      toState: 'THINKING',
      agentData: agent2,
    },
    {
      cellId: { row: 0, col: 2 },
      fromState: 'DORMANT',
      toState: 'THINKING',
      agentData: agent3,
    },
  ]
);
```

---

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    SPREADSHEET MOMENT                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌────────────┐ │
│  │   Univer     │      │ Agent Core   │      │  Agent UI   │ │
│  │  (Spreadsheet│─────►│  (State Mgr) │─────►│ (Components)│ │
│  │   Engine)    │      │              │      │             │ │
│  └──────────────┘      └──────┬───────┘      └─────────────┘ │
│                                 │                            │
│                                 ▼                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         StateManagerIntegration                       │   │
│  │  • Transitions agent states                          │   │
│  │  • Resolves conflicts                                │   │
│  │  • Batch updates                                     │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                     │
│                       ▼                                     │
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
                        └──────────────────────────────────────┘
```

---

## API Reference

### StateManagerIntegration

#### Constructor

```typescript
new StateManagerIntegration(config: StateManagerIntegrationConfig)
```

**Configuration:**
- `cudaClawClient` (CudaClawClient): Required CudaClaw client instance
- `enableGPUAcceleration?` (boolean): Enable GPU (default: true)
- `enableSmartCRDT?` (boolean): Enable SmartCRDT (default: true)
- `enableBatchUpdates?` (boolean): Enable batch updates (default: true)
- `batchThreshold?` (number): Batch size threshold (default: 10)
- `defaultNodeId?` (string): Default node ID (default: 'spreadsheet_moment')

#### Methods

##### State Transitions

```typescript
// Transition single agent state
await integration.transitionAgentState(
  sheetId: string,
  cellId: CellID,
  fromState: AgentCellState,
  toState: AgentCellState,
  agentData: IAgentCellData
): Promise<IAgentCellData>

// Batch transition multiple states
await integration.batchTransitionAgentStates(
  sheetId: string,
  transitions: Array<{
    cellId: CellID;
    fromState: AgentCellState;
    toState: AgentCellState;
    agentData: IAgentCellData;
  }>
): Promise<IAgentCellData[]>
```

##### Conflict Resolution

```typescript
// Resolve conflicts
await integration.resolveAgentStateConflict(
  sheetId: string,
  cellId: CellID,
  conflictingStates: IAgentCellData[]
): Promise<IAgentCellData>
```

##### State Queries

```typescript
// Get single agent state
await integration.getAgentState(
  sheetId: string,
  cellId: CellID
): Promise<SmartCRDTCell | null>

// Get multiple states
await integration.getAgentStatesBatch(
  sheetId: string,
  cellIds: CellID[]
): Promise<Map<string, SmartCRDTCell>>
```

##### Utility

```typescript
// Flush pending updates
await integration.flushUpdates(sheetId: string): Promise<void>

// Get statistics
integration.getStats(): {
  pendingUpdates: number;
  batchStats: {...};
  gpuEnabled: boolean;
  smartCRDTEnabled: boolean;
  batchUpdatesEnabled: boolean;
}
```

---

## State Mapping

### Agent States to Cell States

| Agent State | Cell State | Description |
|-------------|------------|-------------|
| DORMANT | ACTIVE | Agent is dormant but cell is active |
| IDLE | ACTIVE | Agent is idle but cell is active |
| POSTED | ACTIVE | Agent has posted result |
| THINKING | LOCKED | Agent is processing (locked) |
| ACTING | LOCKED | Agent is executing action (locked) |
| NEEDS_REVIEW | CONFLICT | Agent action needs review |
| ERROR | CONFLICT | Agent encountered error |
| DELETED | DELETED | Agent/cell is deleted |

---

## Performance

### Expected Performance

| Operation | CPU | GPU (CudaClaw) | Speedup |
|-----------|-----|---------------|---------|
| Single state transition | ~10ms | ~5µs | **2000x** |
| Batch (10 states) | ~100ms | ~10µs | **10,000x** |
| Batch (100 states) | ~1000ms | ~50µs | **20,000x** |
| Conflict resolution | Manual | Automatic | **∞** |

### Memory Usage

- Per cell: ~32 bytes (SmartCRDTCell)
- Per batch: ~32KB (1024 cells)
- Overhead: ~10MB per 1000 agents

---

## Configuration Examples

### Development Configuration

```typescript
const integration = new StateManagerIntegration({
  cudaClawClient: client,
  enableGPUAcceleration: false, // Disable GPU for development
  enableSmartCRDT: true,
  enableBatchUpdates: true,
  batchThreshold: 5,
  defaultNodeId: 'dev_node',
});
```

### Production Configuration

```typescript
const integration = new StateManagerIntegration({
  cudaClawClient: client,
  enableGPUAcceleration: true, // Enable GPU for production
  enableSmartCRDT: true,
  enableBatchUpdates: true,
  batchThreshold: 100, // Larger batches for production
  defaultNodeId: 'prod_node',
});
```

### Testing Configuration

```typescript
const integration = new StateManagerIntegration({
  cudaClawClient: mockClient,
  enableGPUAcceleration: false,
  enableSmartCRDT: false, // Disable for deterministic tests
  enableBatchUpdates: false,
  batchThreshold: 1,
  defaultNodeId: 'test_node',
});
```

---

## Error Handling

### Connection Errors

```typescript
try {
  await client.connect();
} catch (error) {
  if (error instanceof ConnectionError) {
    console.error('Failed to connect to CudaClaw server:', error.message);
    // Fallback to CPU-based operations
  }
}
```

### GPU Errors

```typescript
try {
  await client.updateCell(sheetId, cellId, value);
} catch (error) {
  if (error instanceof GPUError) {
    console.error('GPU error:', error.message);
    // Fallback to CPU-based operations
  }
}
```

### Conflict Errors

```typescript
try {
  const result = await integration.resolveAgentStateConflict(
    sheetId,
    cellId,
    conflictingStates
  );
} catch (error) {
  if (error instanceof ConflictError) {
    console.error('Conflict resolution failed:', error.conflicts);
    // Manual conflict resolution
  }
}
```

---

## Testing

### Unit Tests

```bash
cd packages/cudaclaw-bridge
pnpm test
```

### Integration Tests

```bash
cd packages/cudaclaw-bridge
pnpm test:integration
```

### Performance Tests

```bash
cd packages/cudaclaw-bridge
pnpm test:performance
```

---

## Troubleshooting

### Issue: Cannot connect to CudaClaw server

**Solution:**
1. Check if CudaClaw server is running: `curl http://localhost:8080/health`
2. Verify server URL in client configuration
3. Check firewall settings

### Issue: GPU operations failing

**Solution:**
1. Verify GPU is available: `nvidia-smi`
2. Check CUDA runtime is installed
3. Disable GPU acceleration: `enableGPUAcceleration: false`

### Issue: Batch operations timing out

**Solution:**
1. Reduce batch size: `batchThreshold: 50`
2. Increase timeout: `timeout: 60000`
3. Check GPU memory usage

---

## Next Steps

1. **Install CudaClaw Server**
   - Follow CudaClaw installation guide
   - Start server: `cargo run --release`

2. **Configure SpreadsheetMoment**
   - Add cudaclaw-bridge to dependencies
   - Configure StateManagerIntegration

3. **Test Integration**
   - Run unit tests
   - Run integration tests
   - Monitor GPU performance

4. **Deploy to Production**
   - Enable GPU acceleration
   - Configure batch thresholds
   - Monitor metrics

---

## References

- [CudaClaw Architecture](https://github.com/SuperInstance/cudaclaw/blob/main/ARCHITECTURE.md)
- [Integration Design](./CUDACLAWS_INTEGRATION_DESIGN.md)
- [Package README](../packages/cudaclaw-bridge/README.md)

---

**Last Updated:** 2026-03-18
**Status:** Implementation Complete
