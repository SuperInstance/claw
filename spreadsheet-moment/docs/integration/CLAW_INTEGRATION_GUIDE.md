# Claw & Spreadsheet-Moment Integration Guide

## 🚀 Overview
This document defines how the **Claw Engine (Rust)** integrates with the **Spreadsheet-Moment (TypeScript/Univer)** platform to enable cellular agent intelligence.

## 🧬 Cellular Integration Pattern
Each Claw agent is bound to a single spreadsheet cell. The integration follows a **Reactive Observer Pattern**:
1. **Trigger:** A change in cell value, a timer, or an external sensor event.
2. **Execution:** The Spreadsheet-Moment platform sends a message via WebSocket to the Claw engine.
3. **Processing:** The Claw instance executes its reasoning loop based on its assigned `seed`.
4. **Update:** Claw returns a state update or new cell value, which is reflected in the UI.

## 🔌 Connection Lifecycle
### Initialization
- Spreadsheet loads a cell with type `CLAW`.
- Platform requests Claw instance instantiation with `id: cell_id` and `seed_id`.
- Claw engine confirms readiness via WebSocket handshake.

### Active Loop
- **Input Event:** `{{EVENT_TYPE}}` (e.g., `CELL_CHANGE`, `PERIODIC_TICK`)
- **Payload:** `{{DATA_PAYLOAD}}` (e.g., current cell contents, timestamp)
- **Output:** `{{CELL_UPDATE_PAYLOAD}}` (e.g., new cell value, augmented metadata)

## 📡 WebSocket Event Specification

The integration relies on a bi-directional WebSocket stream between the `spreadsheet-moment` backend and the `claw` engine.

### 1. Client to Engine (Command Stream)

| Event Type | Payload | Description |
| :--- | :--- | :--- |
| `CLAW_INSTANTIATE` | `{ "cell_id": "A1", "seed_id": "seed-...", "config": {...} }` | Spawns a new Claw instance for a specific cell. |
| `CLAW_TRIGGER` | `{ "cell_id": "A1", "trigger_type": "CELL_CHANGE", "data": {...} }` | Forces a Claw to run due to a change or timer. |
| `CLAW_EQUIP` | `{ "cell_id": "A1", "module": { "slot": "MEMORY", "type": "..." } }` | Dynamically attaches a module to the agent. |
| `CLAW_TERMINATE` | `{ "cell_id": "A1" }` | Gracefully shuts down the agent. |

### 2. Engine to Client (State & Result Stream)

| Event Type | Payload | Description |
| :--- | :--- | :--- |
| `CLAW_STATE_CHANGE` | `{ "cell_id": "A1", "state": "THINKING" }` | Notify UI to show "thinking" animation/status. |
| `CLAW_TRACE` | `{ "cell_id": "A1", "thought": "...", "reasoning": "..." }` | (Optional) Stream of internal reasoning for visual debugging. |
| `CLAW_RESULT` | `{ "cell_id": "A1", "value": "NEW_VALUE", "metadata": {...} }` | The final output of the agent's execution cycle. |
| `CLAW_ERROR` | `{ "cell_id": "A1", "error_code": "...", "message": "..." }` | Error notification for UI error handling. |

## 🔄 The Execution Trace (Example)

**Scenario:** User changes cell `B2` value from `10` to `20`.

1. **Spreadsheet (Frontend):** Detects change in `B2`.
2. **Spreadsheet (Backend):** identifies cell `B2` contains a `CLAW` type.
3. **Spreadsheet (Backend) ➔ Engine:** Sends `CLAW_TRIGGER` (`trigger_type: "CELL_CHANGE"`, `data: { old: 10, new: 20 }`).
4. **Engine ➔ Spreadsheet:** Sends `CLAW_STATE_CHANGE` (`state: "THINKING"`).
5. **Spreadsheet (UI):** Displays a subtle "processing" pulse on cell `B2`.
6. **Engine:** Runs inference based on the `seed`.
7. **Engine ➔ Spreadsheet:** Sends `CLAW_RESULT` (`value: "Calculated result..."`).
8. **Spreadsheet (UI):** Updates `B2` with the new value and resolves the animation.

## 🛠️ Data Formats
- **Communication:** JSON over WebSockets.
- **Schema Strictness:** All payloads must pass validation against the `claw-schema.json` and `bot-schema.json` definitions.

## ⚠️ Error Handling & Resilience

| Error Condition | Engine Action | Spreadsheet Reaction |
| :--- | :--- | :--- |
| **Inference Timeout** | Transition to `ERROR` state; emit `CLAW_ERROR`. | Display error icon in cell; log to `TraceProtocol`. |
| **Module Load Failure** | Log error; maintain current `equipment` set. | Log error to console; notify user via toast. |
| **WebSocket Disconnect** | Enter `DORMANT` (retry connection). | Flag agent as `OFFLINE` in the Manager UI. |
