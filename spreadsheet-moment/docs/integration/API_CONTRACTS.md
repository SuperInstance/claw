# API Contracts: Claw <-> Spreadsheet-Moment

## 📡 WebSocket Protocol (Real-time)

### Client -> Engine (Command)
**Event:** `ENGINE_COMMAND`
**Payload Schema:**
```json
{
  "command": "EXECUTE_TRIGGER" | "EQUIP" | "UNEQUIP" | "REBOOT",
  "cell_id": "string",
  "params": { "type": "object" }
}
```

### Engine -> Client (Notification/Update)
**Event:** `AGENT_STATE_UPDATE`
**Payload Schema:**
```json
{
  "cell_id": "string",
  "state": "THINKING" | "IDLE" | "ERROR" | "LEARNING",
  "output": { "value": "any", "metadata": "object" },
  "equipment": ["string"]
}
```

## 🌐 REST API (Lifecycle & Management)

### `POST /v1/claw/instance`
**Purpose:** Manually instantiate a specific claw configuration.
**Body:** `ClawConfiguration` (per `claw-schema.json`)

### `GET /v1/claw/swarm/status`
**Purpose:** Monitor the health and load of all active cellular agents.
**Returns:** `SwarmStatusReport`
