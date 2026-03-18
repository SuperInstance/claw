# Claw Core - Quick Start Guide

**Version:** 0.1.0
**Status:** MVP (Minimal Viable Product)
**Language:** Rust

---

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Creating Agents](#creating-agents)
- [Processing Messages](#processing-messages)
- [Using Equipment](#using-equipment)
- [REST API](#rest-api)
- [WebSocket API](#websocket-api)
- [Examples](#examples)

---

## Installation

### Add to Cargo.toml

```toml
[dependencies]
claw-core = "0.1.0"
tokio = { version = "1.42", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

### Requirements

- Rust 1.70 or later
- Tokio async runtime

---

## Basic Usage

### Minimal Example

```rust
use claw_core::{ClawCore, AgentConfig};
use std::collections::HashMap;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create the core engine
    let mut core = ClawCore::new();

    // Create an agent configuration
    let config = AgentConfig {
        id: "my-agent".to_string(),
        cell_ref: "A1".to_string(),
        model: "gpt-4".to_string(),
        config: HashMap::new(),
    };

    // Add the agent
    core.add_agent(config).await?;

    // Start the core loop
    core.start().await?;

    // Stop when done
    core.stop().await?;

    Ok(())
}
```

---

## Creating Agents

### Agent Configuration

```rust
use claw_core::AgentConfig;
use std::collections::HashMap;

let config = AgentConfig {
    id: "temperature-monitor".to_string(),
    cell_ref: "B2".to_string(),
    model: "gpt-4".to_string(),
    config: {
        let mut map = HashMap::new();
        map.insert("temperature".to_string(), serde_json::json!(0.7));
        map.insert("max_tokens".to_string(), serde_json::json!(1000));
        map
    },
};
```

### Adding to Core

```rust
use claw_core::ClawCore;

let mut core = ClawCore::new();
core.add_agent(config).await?;
```

---

## Processing Messages

### Trigger Messages

```rust
use claw_core::messages::{Message, TriggerPayload};

// Data change trigger
let message = Message::Trigger {
    payload: TriggerPayload::Data {
        cell_ref: "A1".to_string(),
        new_value: serde_json::json!(42),
        old_value: serde_json::json!(null),
    }
};

// Process the message
let result = agent.process(message).await?;
println!("Result: {:?}", result);
```

### Periodic Triggers

```rust
// Time-based trigger
let message = Message::Trigger {
    payload: TriggerPayload::Periodic {
        interval_ms: 5000, // Every 5 seconds
    }
};

agent.process(message).await?;
```

### Formula Triggers

```rust
// Formula evaluation trigger
let message = Message::Trigger {
    payload: TriggerPayload::Formula {
        formula: "=SUM(A1:A10)".to_string(),
        result: serde_json::json!(550),
    }
};

agent.process(message).await?;
```

### External Events

```rust
use std::collections::HashMap;

// External event trigger
let mut event_data = HashMap::new();
event_data.insert("temperature".to_string(), serde_json::json!(72.5));
event_data.insert("humidity".to_string(), serde_json::json!(45));

let message = Message::Trigger {
    payload: TriggerPayload::External {
        source: "sensor-1".to_string(),
        event_data,
    }
};

agent.process(message).await?;
```

---

## Using Equipment

### Equipping Memory

```rust
use claw_core::equipment::SimpleMemoryEquipment;

// Create memory equipment
let memory = Box::new(SimpleMemoryEquipment::new());

// Equip on agent
agent.equip_memory(memory).await?;

// Agent now has memory for state persistence
```

### Memory Benefits

With memory equipped, agents can:
- Persist state between operations
- Remember previous values
- Build context over time
- Make better decisions

---

## REST API

### Starting the Server

```rust
use claw_core::{create_router, create_default_state};
use axum::Server;

#[tokio::main]
async fn main() {
    let state = create_default_state();
    let app = create_router(state);

    Server::bind(&"0.0.0.0:8080".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
```

### Creating an Agent via REST

```bash
curl -X POST http://localhost:8080/api/claws \
  -H "Content-Type: application/json" \
  -d '{
    "id": "my-agent",
    "cell_ref": "A1",
    "model": "gpt-4",
    "config": {
      "temperature": 0.7
    }
  }'
```

### Querying an Agent

```bash
curl http://localhost:8080/api/claws/my-agent
```

### Triggering an Agent

```bash
curl -X POST http://localhost:8080/api/claws/my-agent/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "Data": {
        "cell_ref": "A1",
        "new_value": 42,
        "old_value": null
      }
    }
  }'
```

---

## WebSocket API

### Connecting

```javascript
const ws = new WebSocket('ws://localhost:8080/ws');

ws.onopen = () => {
  console.log('Connected to Claw WebSocket');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);

  switch (message.type) {
    case 'STATE_CHANGE':
      console.log('Agent state changed:', message.payload);
      break;
    case 'ERROR':
      console.error('Agent error:', message.payload);
      break;
    case 'CELL_UPDATE':
      console.log('Cell updated:', message.payload);
      break;
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket connection closed');
};
```

### Subscribing to Updates

```javascript
// Subscribe to agent updates
const subscribeMessage = {
  type: 'SUBSCRIBE',
  trace_id: `trace_${Date.now()}_sub`,
  timestamp: Date.now(),
  payload: {
    agent_id: 'my-agent',
    cell_id: 'A1',
    sheet_id: 'Sheet1'
  }
};

ws.send(JSON.stringify(subscribeMessage));
```

### Unsubscribing

```javascript
// Unsubscribe from agent updates
const unsubscribeMessage = {
  type: 'UNSUBSCRIBE',
  trace_id: `trace_${Date.now()}_unsub`,
  timestamp: Date.now(),
  payload: {
    agent_id: 'my-agent',
    cell_id: 'A1',
    sheet_id: 'Sheet1'
  }
};

ws.send(JSON.stringify(unsubscribeMessage));
```

---

## Examples

### Example 1: Temperature Monitor

```rust
use claw_core::{ClawCore, AgentConfig};
use claw_core::messages::{Message, TriggerPayload};
use std::collections::HashMap;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create core
    let mut core = ClawCore::new();

    // Create temperature monitor agent
    let config = AgentConfig {
        id: "temp-monitor".to_string(),
        cell_ref: "B2".to_string(),
        model: "gpt-4".to_string(),
        config: {
            let mut map = HashMap::new();
            map.insert("threshold".to_string(), serde_json::json!(75));
            map
        },
    };

    core.add_agent(config).await?;

    // Simulate temperature reading
    let trigger = Message::Trigger {
        payload: TriggerPayload::External {
            source: "temperature-sensor".to_string(),
            event_data: {
                let mut data = HashMap::new();
                data.insert("temperature".to_string(), serde_json::json!(78));
                data.insert("unit".to_string(), serde_json::json!("F"));
                data
            },
        }
    };

    core.start().await?;

    Ok(())
}
```

---

### Example 2: Data Aggregator

```rust
use claw_core::{MinimalAgent, AgentConfig};
use claw_core::equipment::SimpleMemoryEquipment;
use claw_core::messages::{Message, TriggerPayload};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create aggregator agent
    let config = AgentConfig {
        id: "data-aggregator".to_string(),
        cell_ref: "C1".to_string(),
        model: "gpt-4".to_string(),
        config: std::collections::HashMap::new(),
    };

    let mut agent = MinimalAgent::new(config);

    // Equip with memory for aggregation
    let memory = Box::new(SimpleMemoryEquipment::new());
    agent.equip_memory(memory).await?;

    // Process multiple data points
    for i in 1..=10 {
        let message = Message::Trigger {
            payload: TriggerPayload::Data {
                cell_ref: format!("A{}", i),
                new_value: serde_json::json!(i * 10),
                old_value: serde_json::json!(null),
            }
        };

        agent.process(message).await?;
    }

    // Query aggregated state
    let state = agent.query(claw_core::messages::QueryType::State).await?;
    println!("Aggregated state: {}", state);

    Ok(())
}
```

---

### Example 3: Periodic Task

```rust
use claw_core::{MinimalAgent, AgentConfig};
use claw_core::messages::{Message, TriggerPayload};
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = AgentConfig {
        id: "periodic-task".to_string(),
        cell_ref: "D1".to_string(),
        model: "gpt-4".to_string(),
        config: std::collections::HashMap::new(),
    };

    let mut agent = MinimalAgent::new(config);

    // Run periodic task every 5 seconds
    loop {
        let message = Message::Trigger {
            payload: TriggerPayload::Periodic {
                interval_ms: 5000,
            }
        };

        agent.process(message).await?;
        println!("Task executed at: {:?}", std::time::SystemTime::now());

        sleep(Duration::from_secs(5)).await;
    }
}
```

---

### Example 4: Error Handling

```rust
use claw_core::{MinimalAgent, AgentConfig};
use claw_core::messages::{Message, TriggerPayload};
use claw_core::error::AgentError;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = AgentConfig {
        id: "error-handler".to_string(),
        cell_ref: "E1".to_string(),
        model: "gpt-4".to_string(),
        config: std::collections::HashMap::new(),
    };

    let mut agent = MinimalAgent::new(config);

    let message = Message::Trigger {
        payload: TriggerPayload::Data {
            cell_ref: "A1".to_string(),
            new_value: serde_json::json!(42),
            old_value: serde_json::json!(null),
        }
    };

    match agent.process(message).await {
        Ok(result) => {
            if result.success {
                println!("Success: {}", result.output.unwrap());
            } else {
                println!("Processing failed");
            }
        }
        Err(AgentError::ProcessingError(msg)) => {
            eprintln!("Processing error: {}", msg);
        }
        Err(AgentError::UnsupportedMessage(msg_id)) => {
            eprintln!("Unsupported message: {}", msg_id);
        }
        Err(e) => {
            eprintln!("Other error: {:?}", e);
        }
    }

    Ok(())
}
```

---

### Example 5: REST API Client

```bash
#!/bin/bash

# Base URL
BASE_URL="http://localhost:8080/api"

# Create agent
echo "Creating agent..."
curl -X POST $BASE_URL/claws \
  -H "Content-Type: application/json" \
  -d '{
    "id": "rest-agent",
    "cell_ref": "F1",
    "model": "gpt-4",
    "config": {}
  }'

echo -e "\n"

# Get agent info
echo "Getting agent info..."
curl $BASE_URL/claws/rest-agent

echo -e "\n"

# Trigger agent
echo "Triggering agent..."
curl -X POST $BASE_URL/claws/rest-agent/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "Data": {
        "cell_ref": "F1",
        "new_value": 100,
        "old_value": null
      }
    }
  }'

echo -e "\n"

# Delete agent
echo "Deleting agent..."
curl -X DELETE $BASE_URL/claws/rest-agent

echo -e "\nDone!"
```

---

### Example 6: WebSocket Client (Node.js)

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080/ws');

ws.on('open', () => {
  console.log('Connected');

  // Subscribe to agent updates
  ws.send(JSON.stringify({
    type: 'SUBSCRIBE',
    trace_id: `trace_${Date.now()}_sub`,
    timestamp: Date.now(),
    payload: {
      agent_id: 'ws-agent',
      cell_id: 'G1',
      sheet_id: 'Sheet1'
    }
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Received:', message.type, message.payload);
});

ws.on('error', (error) => {
  console.error('Error:', error);
});

ws.on('close', () => {
  console.log('Disconnected');
});

// Keep connection alive
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.ping();
  }
}, 30000);
```

---

## Testing

### Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use claw_core::{MinimalAgent, AgentConfig};

    #[test]
    fn test_agent_creation() {
        let config = AgentConfig {
            id: "test-agent".to_string(),
            cell_ref: "A1".to_string(),
            model: "test-model".to_string(),
            config: std::collections::HashMap::new(),
        };

        let agent = MinimalAgent::new(config);
        assert_eq!(agent.id(), "test-agent");
        assert_eq!(agent.status(), &claw_core::AgentStatus::Idle);
    }

    #[tokio::test]
    async fn test_agent_stop() {
        let config = AgentConfig {
            id: "test-agent".to_string(),
            cell_ref: "A1".to_string(),
            model: "test-model".to_string(),
            config: std::collections::HashMap::new(),
        };

        let mut agent = MinimalAgent::new(config);
        agent.stop().await.unwrap();
        assert_eq!(agent.status(), &claw_core::AgentStatus::Stopped);
    }
}
```

---

## Troubleshooting

### Issue: Agent not processing messages

**Solution:** Check agent status
```rust
println!("Agent status: {:?}", agent.status());
```

### Issue: Memory not persisting

**Solution:** Ensure memory equipment is equipped
```rust
println!("Has memory equipment: {}", agent.state().has_memory_equipment);
```

### Issue: WebSocket connection drops

**Solution:** Implement reconnection logic
```javascript
ws.onclose = () => {
  setTimeout(() => {
    ws = new WebSocket('ws://localhost:8080/ws');
  }, 5000);
};
```

---

## Next Steps

- Read the [API Reference](./API_REFERENCE.md) for detailed API documentation
- Check out [Examples](./EXAMPLES.md) for more code examples
- Review the [Architecture Guide](./ARCHITECTURE.md) for system design

---

## Support

For issues, questions, or contributions:
- **GitHub:** https://github.com/SuperInstance/claw
- **Documentation:** https://github.com/SuperInstance/claw/tree/main/docs
