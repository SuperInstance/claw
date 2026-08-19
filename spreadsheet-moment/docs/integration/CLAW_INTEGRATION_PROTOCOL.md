# Spreadsheet-Moment ↔ Claw — Integration Protocol
**Status:** Phase 6 Complete — Integration Refinement  
**Target:** Cell-first agent invocation with nano-latency  
**Platform:** TypeScript/React + Rust (axum + tokio-tungstenite)

---

## The Contract

A **Cell** in spreadsheet-moment can contain a Claw. The Cell IS the Claw's environment. The Claw IS the Cell's brain.

```
┌──────────────────────────────────────────────────────────┐
│                     SPREADSHEET CELL (A1)                   │
│                                                              │
│  ┌─────────────┐    WebSocket/HTTP    ┌──────────────────┐  │
│  │  Cell UI    │◄────────────────────►│   Claw Instance   │  │
│  │  (React)    │   REST Poll: 100ms   │   (Rust Engine)   │  │
│  └─────────────┘                      └──────────────────┘  │
│        ▲                                        │           │
│        │  State: THINKING / IDLE / LEARNING     │           │
│        │  Visual: color-coded overlay           │           │
│        ▼                                        ▼           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Cell Value (formula)              │   │
│  │  =CLAW("sensor-monitor", temperature_seed,          │   │
│  │        equipment=[MEMORY, REASONING])               │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## Message Types

All messages use USCP (Universal Sensory/Command Packet) format.

### Cell → Claw (Trigger)

```json
{
  "header": {
    "version": "1.0",
    "timestamp": "2026-03-19T00:00:00Z",
    "source_id": "spreadsheet-moment",
    "destination_id": "hermes-cns",
    "trace_id": "uuid-v4",
    "intent": "SENSORY_DATA"
  },
  "body": {
    "cell_ref": "A1",
    "event": {
      "type": "cell_value_change",
      "old_value": 72.0,
      "new_value": 78.3,
      "sheet_id": "sensors",
      "row": 1,
      "col": 0
    },
    "spatial_context": {
      "position": { "x": 0, "y": 0, "z": 0, "theta": 0.0 },
      "viewport": { "row_range": [0, 50], "col_range": [0, 20] }
    }
  },
  "signature": {
    "auth": "jwt-token-here",
    "origin": "verified"
  }
}
```

### Claw → Cell (Reasoning Result)

```json
{
  "header": {
    "version": "1.0",
    "trace_id": "same-as-request",
    "source_id": "claw-engine",
    "destination_id": "spreadsheet-moment",
    "intent": "EXECUTE_PLAN"
  },
  "body": {
    "cell_ref": "A1",
    "state_transition": {
      "from": "THINKING",
      "to": "IDLE"
    },
    "reasoning": {
      "summary": "Temperature rising — alert threshold not yet reached",
      "confidence": 0.82,
      "action": "NO_OP",
      "cells_to_write": [
        { "ref": "B1", "value": "MONITORING", "formula": false }
      ]
    }
  },
  "signature": {
    "auth": "jwt-token-here",
    "origin": "verified"
  }
}
```

---

## WebSocket Connection Flow

### 1. Handshake

```
Client                        Server (claw-api)
  │                              │
  │─── GET /ws?token=<jwt> ───►  │
  │                              │── Validate JWT + rate limit
  │                              │
  │◄── ws_connected {claw_id} ──│
  │                              │
  │─── {"type":"subscribe",     │
  │      "cell_ref":"A1"} ───►  │
  │                              │
  │◄── {"type":"subscribed",    │
  │      "claw_id":"uuid"} ──►   │
```

### 2. Trigger Event

```
spreadsheet-moment              claw-engine
  │                              │
  │─── {"type":"trigger",        │
  │      "cell":"A1",            │
  │      "event":{...}} ───►     │
  │                              │── enqueue to Claw worker
  │                              │
  │◄── {"type":"state",          │
  │      "state":"THINKING"} ──►  │
  │                              │
  │         [Claw processes]
  │                              │
  │◄── {"type":"result",         │
  │      "action":"...",         │
  │      "cells":[...]} ────────────► writes to cell store
```

### 3. State Heartbeat (every 30s)

```json
{"type": "heartbeat", "claw_id": "uuid", "state": "IDLE", "load": 0.3}
```

If no heartbeat for 90s → mark Claw `STALE`, trigger re-instantiation.

---

## Cell Formula Syntax

### Minimal Form (No Equipment Override)

```
=CLAW("claw-name")
```

Uses default equipment: `[MEMORY, REASONING]`.

### Full Form

```
=CLAW(
  "temperature-monitor",
  seed="temp-seed-v2",
  equipment=[MEMORY, REASONING, REASONING],
  position={"x":0,"y":0,"z":0,"theta":0}
)
```

**Note:** `REASONING` can appear twice — it has sub-slots.

### Seed Reference Format

In the spreadsheet, seeds are stored in a hidden `_seeds` sheet:

| seed_id    | purpose                                       | trigger_type | learning_strategy |
|------------|-----------------------------------------------|--------------|-------------------|
| temp-seed-v2 | Monitor temperature, alert on >80°C          | value_change | reinforcement     |

The `=CLAW(...)` formula resolves `seed="temp-seed-v2"` to the full seed definition at instantiation.

---

## Visual Thinking UI — Status Mapping

| Claw State    | Cell Overlay Color | UI Badge | User Action Allowed              |
|---------------|--------------------|----------|----------------------------------|
| `IDLE`        | #4A90D9 (blue)     | ● Idle   | Edit seed, re-equip              |
| `THINKING`    | #F5A623 (amber)    | ◐ Think  | Read-only (Claw owns cell)       |
| `LEARNING`    | #7BED9F (green)    | ◆ Learn  | Training data management         |
| `STALE`       | #D0021B (red)      | ✕ Stale  | Reboot Claw, check seed          |
| `CONSENSUS`   | #9013FE (purple)   | ◈ Vote   | View participating Claws         |

---

## Implementation Status

### spreadsheet-moment/packages/agent-core/

| Module                    | Status       | Notes                            |
|---------------------------|--------------|----------------------------------|
| `agent-core/src/index.ts` | ✅ Complete   | Entry, exports                  |
| `agent-core/src/interfaces/` | ✅ Complete | IAgent, ITrigger, IState        |
| `agent-core/src/implementations/`| ✅ Done | Concrete agent types            |
| `agent-core/src/api/`     | ✅ Done      | REST client for claw-api        |
| `agent-core/src/plugins/` | ✅ Done      | Plugin system for equipment     |
| `agent-core/src/monitoring/` | 🔄 Active  | Metrics, health checks          |
| **Claw cell type**        | 📋 Next      | Add Claw alongside existing types |

### spreadsheet-moment/packages/cudaclaw-bridge/

| Module | Status | Notes |
|--------|--------|-------|
| `CudaclawBridge.ts` | ✅ Present | GPU acceleration bridge stub |
| Integration with claw-core | 📋 Next | Wire Claw struct → Cell store |

### spreadsheet-moment/packages/agent-ui/

| Component             | Status | Notes |
|------------------------|--------|-------|
| `AgentThinkingUI.tsx` | ✅ Present | Visual Thinking component |
| `ClawCellEditor.tsx`  | 📋 Next | Seed + equipment picker |

---

## Next Actions

1. **Add Claw as first-class cell type** in `agent-core/src/interfaces/`
   - Define `IClawCell` extending `IAgentCell`
   - Wire to `claw-api/src/rest.rs` endpoints
2. **Implement `ClawCellEditor`** in `agent-ui`
   - Seed picker dropdown
   - Equipment slot toggles
   - Position input (x, y, z, θ)
3. **Add USS trigger dispatch** in cell store
   - Cell value change → emit USCP packet to claw-engine
4. **Heartbeat monitor** in `agent-core/src/monitoring/`
   - 90s stale threshold
   - Auto-reboot消费者

---

*The Cell is the world. The Claw is the eye.*
