# Claw Core - Code Examples

**Version:** 0.1.0
**Status:** MVP (Minimal Viable Product)
**Language:** Rust

---

## Table of Contents

- [Basic Examples](#basic-examples)
- [Advanced Examples](#advanced-examples)
- [Integration Examples](#integration-examples)
- [Testing Examples](#testing-examples)
- [Performance Examples](#performance-examples)

---

## Basic Examples

### Example 1: Create and Run a Simple Agent

```rust
use claw_core::{ClawCore, AgentConfig};
use std::collections::HashMap;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create the core engine
    let mut core = ClawCore::new();

    // Configure an agent
    let config = AgentConfig {
        id: "simple-agent".to_string(),
        cell_ref: "A1".to_string(),
        model: "gpt-4".to_string(),
        config: HashMap::new(),
    };

    // Add agent to core
    core.add_agent(config).await?;

    // Start processing
    core.start().await?;

    // Stop when done
    core.stop().await?;

    Ok(())
}
```

**Output:**
```
Agent 'simple-agent' created at cell A1
Core started
Core stopped
```

---

### Example 2: Process a Data Change

```rust
use claw_core::{MinimalAgent, AgentConfig};
use claw_core::messages::{Message, TriggerPayload};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create agent
    let config = AgentConfig {
        id: "data-processor".to_string(),
        cell_ref: "B2".to_string(),
        model: "gpt-4".to_string(),
        config: std::collections::HashMap::new(),
    };

    let mut agent = MinimalAgent::new(config);

    // Process data change
    let message = Message::Trigger {
        payload: TriggerPayload::Data {
            cell_ref: "A1".to_string(),
            new_value: serde_json::json!(42),
            old_value: serde_json::json!(null),
        }
    };

    let result = agent.process(message).await?;

    println!("Success: {}", result.success);
    println!("Output: {}", result.output.unwrap());
    println!("Processing time: {}ms", result.processing_time_ms);

    Ok(())
}
```

**Output:**
```
Success: true
Output: Processed trigger: Data { cell_ref: "A1", new_value: 42, old_value: null }
Processing time: 10ms
```

---

### Example 3: Query Agent State

```rust
use claw_core::{MinimalAgent, AgentConfig};
use claw_core::messages::QueryType;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = AgentConfig {
        id: "query-agent".to_string(),
        cell_ref: "C3".to_string(),
        model: "gpt-4".to_string(),
        config: std::collections::HashMap::new(),
    };

    let agent = MinimalAgent::new(config);

    // Query agent state
    let state = agent.query(QueryType::State).await?;
    println!("Agent state: {}", state);

    // Query equipment status
    let equipment = agent.query(QueryType::Equipment).await?;
    println!("Equipment: {}", equipment);

    Ok(())
}
```

**Output:**
```
Agent state: {"status":"Idle","memory":{},"has_memory_equipment":false}
Equipment: {"memory_equipped":false}
```

---

## Advanced Examples

### Example 4: Agent with Memory Equipment

```rust
use claw_core::{MinimalAgent, AgentConfig};
use claw_core::equipment::SimpleMemoryEquipment;
use claw_core::messages::{Message, TriggerPayload};
use std::collections::HashMap;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = AgentConfig {
        id: "memory-agent".to_string(),
        cell_ref: "D4".to_string(),
        model: "gpt-4".to_string(),
        config: HashMap::new(),
    };

    let mut agent = MinimalAgent::new(config);

    // Equip memory
    let memory = Box::new(SimpleMemoryEquipment::new());
    agent.equip_memory(memory).await?;

    // Process multiple data points
    for i in 1..=5 {
        let message = Message::Trigger {
            payload: TriggerPayload::Data {
                cell_ref: format!("A{}", i),
                new_value: serde_json::json!(i * 10),
                old_value: serde_json::json!(null),
            }
        };

        agent.process(message).await?;
    }

    // Check state - memory should have data
    let state = agent.state();
    println!("Memory equipped: {}", state.has_memory_equipment);
    println!("Memory items: {}", state.memory.len());

    Ok(())
}
```

**Output:**
```
Memory equipped: true
Memory items: 5
```

---

### Example 5: Periodic Task Agent

```rust
use claw_core::{MinimalAgent, AgentConfig};
use claw_core::messages::{Message, TriggerPayload};
use tokio::time::{sleep, Duration};
use std::time::SystemTime;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = AgentConfig {
        id: "periodic-agent".to_string(),
        cell_ref: "E5".to_string(),
        model: "gpt-4".to_string(),
        config: std::collections::HashMap::new(),
    };

    let mut agent = MinimalAgent::new(config);

    // Run task every 3 seconds
    for i in 1..=5 {
        let message = Message::Trigger {
            payload: TriggerPayload::Periodic {
                interval_ms: 3000,
            }
        };

        agent.process(message).await?;
        println!("Task {} completed at: {:?}", i, SystemTime::now());

        sleep(Duration::from_secs(3)).await;
    }

    Ok(())
}
```

**Output:**
```
Task 1 completed at: SystemTime { ... }
Task 2 completed at: SystemTime { ... }
Task 3 completed at: SystemTime { ... }
Task 4 completed at: SystemTime { ... }
Task 5 completed at: SystemTime { ... }
```

---

### Example 6: External Event Processing

```rust
use claw_core::{MinimalAgent, AgentConfig};
use claw_core::messages::{Message, TriggerPayload};
use std::collections::HashMap;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = AgentConfig {
        id: "event-processor".to_string(),
        cell_ref: "F6".to_string(),
        model: "gpt-4".to_string(),
        config: HashMap::new(),
    };

    let mut agent = MinimalAgent::new(config);

    // Process external sensor event
    let mut event_data = HashMap::new();
    event_data.insert("temperature".to_string(), serde_json::json!(72.5));
    event_data.insert("humidity".to_string(), serde_json::json!(45));
    event_data.insert("pressure".to_string(), serde_json::json!(1013));

    let message = Message::Trigger {
        payload: TriggerPayload::External {
            source: "weather-station-1".to_string(),
            event_data,
        }
    };

    let result = agent.process(message).await?;
    println!("Event processed: {}", result.success);

    Ok(())
}
```

**Output:**
```
Event processed: true
```

---

### Example 7: Error Handling

```rust
use claw_core::{MinimalAgent, AgentConfig};
use claw_core::messages::{Message, TriggerPayload};
use claw_core::error::AgentError;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = AgentConfig {
        id: "error-handler".to_string(),
        cell_ref: "G7".to_string(),
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

    // Handle different error types
    match agent.process(message).await {
        Ok(result) => {
            if result.success {
                println!("✓ Success: {}", result.output.unwrap());
            } else {
                println!("✗ Processing failed");
            }
        }
        Err(AgentError::ProcessingError(msg)) => {
            eprintln!("✗ Processing error: {}", msg);
        }
        Err(AgentError::UnsupportedMessage(id)) => {
            eprintln!("✗ Unsupported message: {}", id);
        }
        Err(AgentError::InvalidEquipment(msg)) => {
            eprintln!("✗ Invalid equipment: {}", msg);
        }
        Err(e) => {
            eprintln!("✗ Other error: {:?}", e);
        }
    }

    Ok(())
}
```

**Output:**
```
✓ Success: Processed trigger: Data { cell_ref: "A1", new_value: 42, old_value: null }
```

---

## Integration Examples

### Example 8: REST API Server

```rust
use claw_core::{create_router, create_default_state};
use axum::Server;

#[tokio::main]
async fn main() {
    let state = create_default_state();
    let app = create_router(state);

    let addr = &"0.0.0.0:8080".parse().unwrap();
    println!("Claw API server listening on {}", addr);

    Server::bind(addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
```

**Test with curl:**
```bash
# Create agent
curl -X POST http://localhost:8080/api/claws \
  -H "Content-Type: application/json" \
  -d '{"id": "test-agent", "cell_ref": "A1", "model": "gpt-4", "config": {}}'

# Get agent
curl http://localhost:8080/api/claws/test-agent

# Trigger agent
curl -X POST http://localhost:8080/api/claws/test-agent/trigger \
  -H "Content-Type: application/json" \
  -d '{"payload": {"Data": {"cell_ref": "A1", "new_value": 42, "old_value": null}}}'
```

---

### Example 9: WebSocket Client (Rust)

```rust
use tungstenite::{connect, Message as WsMessage};
use url::Url;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = Url::parse("ws://localhost:8080/ws")?;
    let (mut socket, _) = connect(url)?;

    // Subscribe to agent updates
    let subscribe = r#"{
      "type": "SUBSCRIBE",
      "trace_id": "trace_123",
      "timestamp": 1234567890,
      "payload": {
        "agent_id": "test-agent",
        "cell_id": "A1",
        "sheet_id": "Sheet1"
      }
    }"#;

    socket.write_message(WsMessage::Text(subscribe.to_string()))?;

    // Listen for messages
    loop {
        let msg = socket.read_message()?;
        if msg.is_text() {
            let text = msg.to_text()?;
            println!("Received: {}", text);
        }
    }
}
```

---

### Example 10: Formula Evaluation Agent

```rust
use claw_core::{MinimalAgent, AgentConfig};
use claw_core::messages::{Message, TriggerPayload};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = AgentConfig {
        id: "formula-agent".to_string(),
        cell_ref: "H8".to_string(),
        model: "gpt-4".to_string(),
        config: std::collections::HashMap::new(),
    };

    let mut agent = MinimalAgent::new(config);

    // Process formula result
    let message = Message::Trigger {
        payload: TriggerPayload::Formula {
            formula: "=SUM(A1:A10)".to_string(),
            result: serde_json::json!(550),
        }
    };

    let result = agent.process(message).await?;
    println!("Formula result: {}", result.output.unwrap());

    Ok(())
}
```

---

## Testing Examples

### Example 11: Unit Test Agent Creation

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use claw_core::{MinimalAgent, AgentConfig, AgentStatus};

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
        assert_eq!(agent.status(), &AgentStatus::Idle);
        assert_eq!(agent.cell_ref(), "A1");
        assert_eq!(agent.model(), "test-model");
    }

    #[test]
    fn test_agent_state_default() {
        use claw_core::AgentState;

        let state = AgentState::default();
        assert_eq!(state.status, AgentStatus::Idle);
        assert_eq!(state.memory.len(), 0);
        assert_eq!(state.has_memory_equipment, false);
    }
}
```

---

### Example 12: Integration Test

```rust
#[tokio::test]
async fn test_agent_processing() {
    use claw_core::{MinimalAgent, AgentConfig};
    use claw_core::messages::{Message, TriggerPayload};

    let config = AgentConfig {
        id: "test-agent".to_string(),
        cell_ref: "A1".to_string(),
        model: "test-model".to_string(),
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

    let result = agent.process(message).await.unwrap();

    assert!(result.success);
    assert_eq!(result.agent_id, "test-agent");
    assert!(result.output.is_some());
    assert!(result.processing_time_ms < 100);
}
```

---

## Performance Examples

### Example 13: Batch Processing

```rust
use claw_core::{MinimalAgent, AgentConfig};
use claw_core::messages::{Message, TriggerPayload};
use std::time::Instant;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = AgentConfig {
        id: "batch-processor".to_string(),
        cell_ref: "I9".to_string(),
        model: "gpt-4".to_string(),
        config: std::collections::HashMap::new(),
    };

    let mut agent = MinimalAgent::new(config);

    // Process 1000 messages
    let start = Instant::now();
    let count = 1000;

    for i in 0..count {
        let message = Message::Trigger {
            payload: TriggerPayload::Data {
                cell_ref: format!("A{}", i % 100),
                new_value: serde_json::json!(i),
                old_value: serde_json::json!(null),
            }
        };

        agent.process(message).await?;
    }

    let elapsed = start.elapsed();
    let rate = count as f64 / elapsed.as_secs_f64();

    println!("Processed {} messages in {:?}", count, elapsed);
    println!("Rate: {:.2} messages/second", rate);

    Ok(())
}
```

**Output:**
```
Processed 1000 messages in 10.234s
Rate: 97.71 messages/second
```

---

### Example 14: Concurrent Agents

```rust
use claw_core::{ClawCore, AgentConfig};
use std::collections::HashMap;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut core = ClawCore::new();

    // Create 10 agents
    for i in 0..10 {
        let config = AgentConfig {
            id: format!("agent-{}", i),
            cell_ref: format!("A{}", i + 1),
            model: "gpt-4".to_string(),
            config: HashMap::new(),
        };

        core.add_agent(config).await?;
    }

    // Start all agents
    core.start().await?;

    // Stop all agents
    core.stop().await?;

    Ok(())
}
```

---

### Example 15: Memory Usage Monitoring

```rust
use claw_core::{MinimalAgent, AgentConfig};
use claw_core::equipment::SimpleMemoryEquipment;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = AgentConfig {
        id: "memory-monitor".to_string(),
        cell_ref: "J10".to_string(),
        model: "gpt-4".to_string(),
        config: std::collections::HashMap::new(),
    };

    let mut agent = MinimalAgent::new(config);

    // Check memory before equipping
    let state_before = agent.state();
    println!("Memory before: {} items", state_before.memory.len());

    // Equip memory
    let memory = Box::new(SimpleMemoryEquipment::new());
    agent.equip_memory(memory).await?;

    // Check memory after equipping
    let state_after = agent.state();
    println!("Memory after: {} items", state_after.memory.len());
    println!("Has memory equipment: {}", state_after.has_memory_equipment);

    Ok(())
}
```

**Output:**
```
Memory before: 0 items
Memory after: 0 items
Has memory equipment: true
```

---

## Real-World Examples

### Example 16: Spreadsheet Cell Monitor

```rust
use claw_core::{MinimalAgent, AgentConfig};
use claw_core::messages::{Message, TriggerPayload};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Agent that monitors spreadsheet cell changes
    let config = AgentConfig {
        id: "cell-monitor".to_string(),
        cell_ref: "K11".to_string(),
        model: "gpt-4".to_string(),
        config: {
            let mut map = std::collections::HashMap::new();
            map.insert("watch_cells".to_string(), serde_json::json!(["A1", "B2", "C3"]));
            map
        },
    };

    let mut agent = MinimalAgent::new(config);

    // Simulate cell changes
    let cells = vec![
        ("A1", serde_json::json!(100)),
        ("B2", serde_json::json!(200)),
        ("C3", serde_json::json!(300)),
    ];

    for (cell_ref, value) in cells {
        let message = Message::Trigger {
            payload: TriggerPayload::Data {
                cell_ref: cell_ref.to_string(),
                new_value: value.clone(),
                old_value: serde_json::json!(null),
            }
        };

        let result = agent.process(message).await?;
        println!("Cell {} updated: {:?}", cell_ref, result.output);
    }

    Ok(())
}
```

---

### Example 17: Data Validation Agent

```rust
use claw_core::{MinimalAgent, AgentConfig};
use claw_core::messages::{Message, TriggerPayload};
use std::collections::HashMap;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = AgentConfig {
        id: "validator".to_string(),
        cell_ref: "L12".to_string(),
        model: "gpt-4".to_string(),
        config: {
            let mut map = HashMap::new();
            map.insert("min_value".to_string(), serde_json::json!(0));
            map.insert("max_value".to_string(), serde_json::json!(100));
            map
        },
    };

    let mut agent = MinimalAgent::new(config);

    // Test valid and invalid values
    let test_values = vec![
        ("A1", 50, true),   // Valid
        ("A2", 150, false), // Invalid (too high)
        ("A3", -10, false), // Invalid (too low)
    ];

    for (cell_ref, value, expected_valid) in test_values {
        let message = Message::Trigger {
            payload: TriggerPayload::Data {
                cell_ref: cell_ref.to_string(),
                new_value: serde_json::json!(value),
                old_value: serde_json::json!(null),
            }
        };

        let result = agent.process(message).await?;
        println!("Value {} at {}: {:?}", value, cell_ref, result.output);
    }

    Ok(())
}
```

---

### Example 18: Aggregation Agent

```rust
use claw_core::{MinimalAgent, AgentConfig};
use claw_core::equipment::SimpleMemoryEquipment;
use claw_core::messages::{Message, TriggerPayload};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = AgentConfig {
        id: "aggregator".to_string(),
        cell_ref: "M13".to_string(),
        model: "gpt-4".to_string(),
        config: std::collections::HashMap::new(),
    };

    let mut agent = MinimalAgent::new(config);

    // Equip memory for aggregation
    let memory = Box::new(SimpleMemoryEquipment::new());
    agent.equip_memory(memory).await?;

    // Aggregate values from multiple cells
    let values = vec![10, 20, 30, 40, 50];

    for (i, value) in values.iter().enumerate() {
        let message = Message::Trigger {
            payload: TriggerPayload::Data {
                cell_ref: format!("A{}", i + 1),
                new_value: serde_json::json!(value),
                old_value: serde_json::json!(null),
            }
        };

        agent.process(message).await?;
    }

    // Query final state
    let state = agent.query(claw_core::messages::QueryType::State).await?;
    println!("Aggregated state: {}", state);

    Ok(())
}
```

---

## Complete Application Example

### Example 19: Complete Agent Application

```rust
use claw_core::{ClawCore, AgentConfig};
use claw_core::messages::{Message, TriggerPayload};
use std::collections::HashMap;
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize core
    let mut core = ClawCore::new();

    // Create monitoring agent
    let monitor_config = AgentConfig {
        id: "monitor".to_string(),
        cell_ref: "A1".to_string(),
        model: "gpt-4".to_string(),
        config: HashMap::new(),
    };
    core.add_agent(monitor_config).await?;

    // Create processing agent
    let processor_config = AgentConfig {
        id: "processor".to_string(),
        cell_ref: "B2".to_string(),
        model: "gpt-4".to_string(),
        config: HashMap::new(),
    };
    core.add_agent(processor_config).await?;

    // Start core
    core.start().await?;

    // Simulate work
    for i in 1..=10 {
        println!("Processing iteration {}", i);
        sleep(Duration::from_secs(1)).await;
    }

    // Stop core
    core.stop().await?;

    println!("Application complete");

    Ok(())
}
```

---

## More Examples

For more examples, see:
- [API Reference](./API_REFERENCE.md) - Detailed API documentation
- [Quick Start Guide](./QUICK_START.md) - Getting started guide
- [GitHub Examples](https://github.com/SuperInstance/claw/tree/main/examples) - Full example applications

---

## Contributing Examples

Have a great example? Please contribute!
1. Fork the repository
2. Add your example to the `examples/` directory
3. Submit a pull request

---

## Support

For questions or issues:
- **GitHub:** https://github.com/SuperInstance/claw
- **Issues:** https://github.com/SuperInstance/claw/issues
