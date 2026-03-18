# Claw Core - Minimal Cellular Agent Engine

A minimal, performant cellular agent engine for spreadsheet integration, built on the Cell-First Actor Model pattern.

## Overview

Claw Core is the **minimal MVP** (<5,000 LOC) cellular agent engine that provides essential agent functionality. For advanced features like social coordination, seed learning, WebSocket communication, and GPU acceleration, see [claw-extensions](https://github.com/SuperInstance/claw-extensions).

## Architecture

The engine is built on the **Cell-First Actor Model** pattern:
- **Each spreadsheet cell = one actor (agent)**
- **Message-driven communication**
- **Isolated execution with no shared state**
- **Dynamic equipment system for modular capabilities**

## Core Components

### 1. Core Loop (`ClawCore`)
The heart of the system - a minimal event loop that:
- Checks for triggers
- Routes messages to agents
- Manages agent lifecycle
- Coordinates social interactions

### 2. Agents (`Agent`)
Cellular agents with:
- State management
- Learning metrics
- Equipment slots
- Reasoning capabilities

### 3. Equipment System
**MVP: Single Memory slot only**

Claw Core provides a simplified equipment system with **one slot** (Memory) for basic state persistence.

**For advanced equipment (6 slots with hot-swapping, muscle memory, cost/benefit analysis), use [claw-extensions](https://github.com/SuperInstance/claw-extensions):**
- MEMORY - Hierarchical memory with L0/L1/L2 caching
- REASONING - Escalation engine for complex decisions
- CONSENSUS - Tripartite consensus for multi-agent agreement
- SPREADSHEET - Tile interface for spreadsheet integration
- DISTILLATION - Model compression and optimization
- COORDINATION - Swarm coordination for parallel processing

### 4. Trigger System
Cell-based activation:
- Data triggers (cell changes)
- Periodic triggers (timers)
- Formula triggers (formula results)
- External triggers (external events)

### 5. REST API
**MVP: 5 endpoints only**

Claw Core provides a simple REST API for basic agent management:
- `POST /api/v1/agents` - Create agent
- `GET /api/v1/agents/:id` - Get agent state
- `PUT /api/v1/agents/:id` - Update agent
- `DELETE /api/v1/agents/:id` - Delete agent
- `POST /api/v1/agents/:id/triggers` - Add trigger

**For advanced features (WebSocket, social coordination endpoints, equipment hot-swap), use [claw-extensions](https://github.com/SuperInstance/claw-extensions).**

## Quick Start

### Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
claw-core = "0.1.0"
tokio = { version = "1.35", features = ["full"] }
tracing-subscriber = "0.3"
```

### Basic Usage

```rust
use claw_core::{AgentConfig, ClawCore, Message, SocialRelation};
use std::collections::HashMap;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 1. Create the core engine
    let mut core = ClawCore::new();

    // 2. Add an agent
    let config = AgentConfig {
        id: "my-agent".to_string(),
        cell_ref: "A1".to_string(),
        model: "gpt-4".to_string(),
        equipment: vec![],
        config: HashMap::new(),
    };

    core.add_agent(config).await?;

    // 3. Start the core engine
    core.start().await?;

    // 4. Send a message
    let msg = Message::Trigger {
        id: "msg-1".to_string(),
        agent_id: "my-agent".to_string(),
        payload: claw_core::TriggerPayload::Data {
            cell_ref: "A1".to_string(),
            old_value: serde_json::json!(null),
            new_value: serde_json::json!(42),
        },
    };

    core.send_message(msg).await?;

    // 5. Stop the engine
    core.stop().await?;

    Ok(())
}
```

## Message Types

### Trigger Message
Activates an agent with a payload:

```rust
Message::Trigger {
    id: "msg-1".to_string(),
    agent_id: "agent-A1".to_string(),
    payload: TriggerPayload::Data { /* ... */ },
}
```

### Cancel Message
Stops agent processing:

```rust
Message::Cancel {
    id: "msg-2".to_string(),
    agent_id: "agent-A1".to_string(),
    reason: "User requested".to_string(),
}
```

### Query Message
Requests agent state:

```rust
Message::Query {
    id: "msg-3".to_string(),
    agent_id: "agent-A1".to_string(),
    query_type: QueryType::State,
}
```

## Agent Lifecycle

```
┌─────────┐    add_agent()    ┌─────────┐
│ None    │ ────────────────> │  Idle   │
└─────────┘                   └─────────┘
                                     │
                              Trigger message
                                     ▼
                              ┌─────────┐
                              │Processing│
                              └─────────┘
                                     │
                              Processing complete
                                     ▼
                              ┌─────────┐
                              │  Idle   │
└─────────┘                   └─────────┘
         │
   Cancel message
         ▼
  ┌─────────┐
  │ Stopped │
  └─────────┘
```

## Equipment System

### Equipping Equipment

```rust
// The equipment manager handles dynamic equip/unequip
let equipment = Box::new(SimpleMemoryEquipment::new());
core.equipment_manager.equip(equipment).await?;
```

### Cost/Benefit Analysis

The equipment manager performs automatic cost/benefit analysis:

- **Memory cost**: Maximum 10MB per equipment
- **CPU cost**: Maximum 50% per equipment
- **Load time**: Maximum 50ms per equipment

### Muscle Memory

When equipment is unequipped, "muscle memory" triggers are extracted:
- Pattern-based triggers
- Performance-based triggers
- Complexity-based triggers
- Custom triggers

## Social Patterns

### Master-Slave
Parallel processing coordination:

```rust
core.add_relationship(
    "master-agent".to_string(),
    "slave-agent".to_string(),
    SocialRelation::MasterSlave,
).await?;
```

### Co-Worker
Peer collaboration:

```rust
core.add_relationship(
    "agent-A".to_string(),
    "agent-B".to_string(),
    SocialRelation::CoWorker,
).await?;
```

## Performance Targets

- **Trigger Latency**: <100ms
- **Event Processing**: <50ms
- **State Update**: <10ms
- **Memory Per Agent**: <10MB
- **Core Loop Size**: ~500 lines

## Testing

Run tests:

```bash
cargo test
```

Run with output:

```bash
cargo test -- --nocapture
```

Run specific test:

```bash
cargo test test_agent_creation
```

## Code Quality

Check with clippy:

```bash
cargo clippy -- -D warnings
```

Format code:

```bash
cargo fmt
```

## Examples

- **Basic Usage**: `examples/basic_usage.rs` - Complete example of creating agents and sending messages

Run examples:

```bash
cargo run --example basic_usage
```

## API Reference

See [docs.rs](https://docs.rs/claw-core) for full API documentation.

## Project Status

**Current Version**: 0.1.0
**Status**: Active Development
**Next Milestone**: Integration with spreadsheet-moment

## Contributing

This project is part of the SuperInstance ecosystem. See the main repository for contribution guidelines.

## License

MIT

## Advanced Features

Need more than the MVP? Check out **[claw-extensions](https://github.com/SuperInstance/claw-extensions)** for:

- **Advanced Equipment** - 6 slots with hot-swapping
- **Social Coordination** - Master-slave, co-worker patterns
- **Seed Learning** - ML behavior optimization
- **Bot Automation** - Simple loops without ML
- **WebSocket Server** - Real-time communication
- **GPU Acceleration** - CUDA/WGPU support
- **Advanced Monitoring** - Metrics and telemetry

### Quick Extension Example

```toml
# Add to Cargo.toml
claw-extensions = { version = "0.1", features = ["equipment", "social"] }
```

```rust
use claw_core::{Agent, MinimalAgent, AgentConfig};
use claw_extensions::equipment::EquipmentManager;

// Create core agent
let config = AgentConfig {
    id: "my-agent".to_string(),
    cell_ref: "A1".to_string(),
    model: "deepseek-chat".to_string(),
    equipment: vec![],
    config: Default::default(),
};

let mut agent = MinimalAgent::new(config);

// Add extensions
let mut equipment_mgr = EquipmentManager::new();
equipment_mgr.equip(Box::new(HierarchicalMemory::new())).await?;
```

See [claw-extensions Integration Guide](https://github.com/SuperInstance/claw-extensions/blob/main/INTEGRATION_GUIDE.md) for details.

## Links

- **Main Repository**: https://github.com/SuperInstance/claw
- **Extensions**: https://github.com/SuperInstance/claw-extensions
- **Documentation**: https://docs.rs/claw-core
- **Examples**: https://github.com/SuperInstance/claw/tree/main/core/examples

---

**Built with ❤️ by the SuperInstance team**
