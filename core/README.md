# Claw Core - Minimal Cellular Agent Engine

A minimal, performant cellular agent engine for spreadsheet integration, built on the Cell-First Actor Model pattern.

## Overview

Claw Core is the foundational engine for intelligent cellular agents in spreadsheets. It implements a minimal ~500-line core event loop that handles agent lifecycle, message processing, equipment management, and social coordination.

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

### 3. Equipment System (`EquipmentManager`)
Dynamic modular capabilities:
- **MEMORY** - State persistence
- **REASONING** - Decision making
- **CONSENSUS** - Multi-agent agreement
- **SPREADSHEET** - Cell integration
- **DISTILLATION** - Model compression
- **COORDINATION** - Multi-agent orchestration

### 4. Trigger System (`TriggerSystem`)
Cell-based activation:
- Data triggers (cell changes)
- Periodic triggers (timers)
- Formula triggers (formula results)
- External triggers (external events)

### 5. Social Coordinator (`SocialCoordinator`)
Multi-agent patterns:
- Master-Slave
- Co-Worker
- Peer
- Delegate
- Observer

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

## Links

- **Main Repository**: https://github.com/SuperInstance/claw
- **Documentation**: https://docs.rs/claw-core
- **Examples**: https://github.com/SuperInstance/claw/tree/main/core/examples

---

**Built with ❤️ by the SuperInstance team**
