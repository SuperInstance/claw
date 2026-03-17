# WebSocket Server Quick Start Guide

## Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
claw-core = { path = "./core" }
tokio = { version = "1.35", features = ["full"] }
```

## Basic Usage

### 1. Start the Server

```rust
use claw_core::{ClawCore, WsServer, WsServerConfig, AgentConfig, EquipmentSlot};
use std::sync::Arc;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create and start the core
    let core = Arc::new(ClawCore::new());
    core.start().await?;

    // Create WebSocket server
    let config = WsServerConfig::default(); // Binds to 127.0.0.1:8080
    let server = WsServer::new(config, core);

    // Start server in background
    tokio::spawn(async move {
        if let Err(e) = server.run().await {
            eprintln!("Server error: {}", e);
        }
    });

    println!("WebSocket server running on ws://127.0.0.1:8080");

    // Keep running
    tokio::signal::ctrl_c().await?;
    Ok(())
}
```

### 2. Connect with WebSocket Client

**JavaScript (Browser):**
```javascript
const ws = new WebSocket('ws://127.0.0.1:8080');

ws.onopen = () => {
    console.log('Connected to Claw WebSocket server');

    // Create an agent
    ws.send(JSON.stringify({
        type: 'CreateAgent',
        data: {
            id: 'msg-1',
            config: {
                cell_ref: 'A1',
                model: 'gpt-4',
                equipment: ['MEMORY', 'REASONING'],
                config: {}
            }
        }
    }));
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('Received:', message);

    // Handle different message types
    switch (message.type) {
        case 'AgentCreated':
            console.log('Agent created:', message.data.agent_id);
            break;
        case 'AgentStateChanged':
            console.log('Agent state changed:', message.data);
            break;
        case 'Error':
            console.error('Error:', message.data.error);
            break;
    }
};
```

**Python:**
```python
import asyncio
import websockets
import json

async def connect_to_claw():
    uri = "ws://127.0.0.1:8080"
    async with websockets.connect(uri) as websocket:
        # Create an agent
        message = {
            "type": "CreateAgent",
            "data": {
                "id": "msg-1",
                "config": {
                    "cell_ref": "A1",
                    "model": "gpt-4",
                    "equipment": ["MEMORY", "REASONING"],
                    "config": {}
                }
            }
        }

        await websocket.send(json.dumps(message))

        # Receive response
        response = await websocket.recv()
        data = json.loads(response)
        print(f"Received: {data}")

asyncio.run(connect_to_claw())
```

## Message Reference

### Create Agent
```json
{
  "type": "CreateAgent",
  "data": {
    "id": "unique-message-id",
    "config": {
      "cell_ref": "A1",
      "model": "gpt-4",
      "equipment": ["MEMORY", "REASONING"],
      "config": {}
    }
  }
}
```

### Trigger Agent
```json
{
  "type": "TriggerAgent",
  "data": {
    "id": "unique-message-id",
    "agent_id": "agent-A1",
    "payload": {
      "trigger_type": "data",
      "data": {
        "cell_ref": "A1",
        "old_value": 1,
        "new_value": 2
      }
    }
  }
}
```

### Query Agent
```json
{
  "type": "QueryAgent",
  "data": {
    "id": "unique-message-id",
    "agent_id": "agent-A1",
    "query_type": "state"
  }
}
```

### Cancel Agent
```json
{
  "type": "CancelAgent",
  "data": {
    "id": "unique-message-id",
    "agent_id": "agent-A1",
    "reason": "User cancelled"
  }
}
```

## Equipment Slots

Available equipment slots:
- `MEMORY` - State persistence
- `REASONING` - Decision making
- `CONSENSUS` - Multi-agent agreement
- `SPREADSHEET` - Cell integration
- `DISTILLATION` - Model compression
- `COORDINATION` - Multi-agent orchestration

## Configuration Options

```rust
let config = WsServerConfig {
    addr: "127.0.0.1:8080".to_string(),        // Bind address
    max_connections: 100,                       // Max concurrent clients
    client_buffer_size: 1000,                   // Messages per client
    connection_timeout_secs: 30,                // Timeout in seconds
    heartbeat_interval_secs: 10,                // Heartbeat frequency
    max_message_size: 10 * 1024 * 1024,         // 10MB max message
};
```

## Common Operations

### Broadcast to All Clients
```rust
server.broadcast(WsMessage::AgentStateChanged {
    agent_id: "agent-A1".to_string(),
    old_status: "idle".to_string(),
    new_status: "active".to_string(),
    timestamp: 1234567890,
}).await;
```

### Send to Specific Client
```rust
server.send_to_client(client_id, message).await?;
```

### Get Connected Client Count
```rust
let count = server.client_count().await;
println!("Connected clients: {}", count);
```

## Running the Example

```bash
# Navigate to core directory
cd core

# Run the example server
cargo run --example websocket_server

# In another terminal, connect with a WebSocket client
# or use the browser console JavaScript example above
```

## Testing

```bash
# Run all WebSocket tests
cargo test --lib ws

# Run specific test
cargo test test_message_serialization

# Run with output
cargo test --lib ws -- --nocapture
```

## Troubleshooting

### Cannot Connect
- Check firewall settings
- Verify server is running
- Confirm correct address/port

### Connection Drops
- Check heartbeat interval
- Verify timeout settings
- Check network stability

### Slow Messages
- Check network latency
- Verify buffer sizes
- Monitor server load

## Next Steps

1. **Read full documentation**: `docs/WEBSOCKET.md`
2. **Explore examples**: `examples/websocket_server.rs`
3. **Run tests**: `cargo test --lib ws`
4. **Build your client**: Use the examples above

## Support

- Documentation: `core/docs/WEBSOCKET.md`
- Examples: `core/examples/`
- Tests: `core/src/ws/tests.rs`

---

**Last Updated**: 2026-03-16
**Version**: 0.1.0
