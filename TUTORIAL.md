# Claw Tutorial - Getting Started

**A beginner-friendly guide to creating your first cellular agent**

**Version:** 0.1.0
**Prerequisites:** Basic Rust knowledge, understanding of async/await
**Time:** 30-45 minutes

---

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Your First Agent](#your-first-agent)
5. [Understanding Agents](#understanding-agents)
6. [Adding Equipment](#adding-equipment)
7. [Social Coordination](#social-coordination)
8. [Next Steps](#next-steps)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

### What You'll Build

In this tutorial, you'll build a simple temperature monitoring agent that:
- Monitors a temperature value
- Triggers when temperature exceeds a threshold
- Logs a warning message
- Coordinates with other agents

### What You'll Learn

- How to create a Claw agent
- How to configure triggers
- How to add equipment
- How to coordinate multiple agents
- Best practices for agent design

---

## Prerequisites

### Required Knowledge

- **Basic Rust**: Ownership, borrowing, basic syntax
- **Async/Await**: Understanding of `async fn`, `.await`
- **Terminal**: Basic command line skills

### Required Software

```bash
# Check Rust version (1.85+)
rustc --version

# Check Cargo
cargo --version

# Check Git
git --version
```

**If missing:**
- Install Rust: https://rustup.rs/
- Install Git: https://git-scm.com/

---

## Installation

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/SuperInstance/claw.git
cd claw
```

### Step 2: Build Core

```bash
# Navigate to core
cd core

# Build in release mode
cargo build --release

# Run tests to verify
cargo test --release
```

**Expected Output:**
```
running 117 tests
test agent::tests::test_agent_creation ... ok
test agent::tests::test_agent_processing ... ok
...
test result: ok. 117 passed; 0 failed; 0 ignored
```

### Step 3: Verify Installation

```bash
# Run example
cargo run --example basic_usage
```

**Expected Output:**
```
ClawCore starting
Agent created: my-agent
Core loop started
Agent processing: test-payload
Core loop stopped
```

---

## Your First Agent

### Step 1: Create Project

```bash
# Create new binary project
cargo new my_first_agent
cd my_first_agent

# Add claw-core dependency
cargo add claw-core --path ../claw/core
```

### Step 2: Write Basic Agent

Create `src/main.rs`:

```rust
use claw_core::{ClawCore, AgentConfig, EquipmentSlot};
use std::collections::HashMap;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create the core engine
    let mut core = ClawCore::new();

    // Configure agent
    let config = AgentConfig {
        id: "temp-monitor".to_string(),
        cell_ref: "A1".to_string(),
        model: "mock-model".to_string(),
        equipment: vec![],
        config: HashMap::new(),
    };

    // Add agent to core
    core.add_agent(config).await?;

    println!("Agent created successfully!");

    // Start the core engine
    core.start().await?;

    println!("Core engine started");

    // Keep running for demonstration
    tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;

    // Stop the engine
    core.stop().await?;

    println!("Core engine stopped");

    Ok(())
}
```

### Step 3: Run Your Agent

```bash
cargo run --release
```

**Expected Output:**
```
Agent created successfully!
Core engine started
[Agent logs here...]
Core engine stopped
```

---

## Understanding Agents

### Agent Types

**1. Claw Agent (ML-based)**
```rust
use claw_core::ClawAgent;

let claw = ClawAgent::new(
    "anomaly-detector",
    "deepseek-chat"
);
```

**2. Bot Agent (Deterministic)**
```rust
use claw_core::BotAgent;

let bot = BotAgent::new("poller", move || {
    // Deterministic logic here
    println!("Polling data...");
});
```

**3. Seed (Trainable)**
```rust
use claw_core::ClawSeed;

let seed = ClawSeed {
    purpose: "Monitor temperature".to_string(),
    trigger: TriggerType::Periodic(Duration::from_secs(5)),
    learning_strategy: LearningStrategy::Reinforcement,
};
```

### Agent Lifecycle

```
CREATED → IDLE → PROCESSING → IDLE → STOPPED
                ↓
              ERROR (if processing fails)
```

**Example:**
```rust
// Agent starts in CREATED state
let agent = core.create_agent(config).await?;
// State: IDLE

// Process a trigger
agent.process(trigger_payload).await?;
// State: PROCESSING

// Processing complete
// State: IDLE

// Stop agent
agent.stop().await?;
// State: STOPPED
```

---

## Adding Equipment

### What is Equipment?

Equipment provides modular capabilities to agents:
- **MEMORY**: Store and recall information
- **REASONING**: Make intelligent decisions
- **CONSENSUS**: Coordinate with other agents
- **SPREADSHEET**: Access spreadsheet cells
- **DISTILLATION**: Compress models
- **COORDINATION**: Orchestrate multiple agents

### Step 1: Add Memory Equipment

```rust
use claw_core::{ClawCore, AgentConfig, EquipmentSlot};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut core = ClawCore::new();

    let config = AgentConfig {
        id: "temp-monitor".to_string(),
        cell_ref: "A1".to_string(),
        model: "mock-model".to_string(),
        equipment: vec![
            EquipmentSlot::Memory,  // Add memory!
        ],
        config: HashMap::new(),
    };

    core.add_agent(config).await?;
    core.start().await?;

    // Agent now has memory capabilities
    Ok(())
}
```

### Step 2: Use Memory Equipment

```rust
// Store data in memory
agent.memory_set("last_temp", 25.7).await?;

// Recall data from memory
let last_temp: f32 = agent.memory_get("last_temp").await?;

println!("Last temperature: {}", last_temp);
```

### Step 3: Add Reasoning Equipment

```rust
let config = AgentConfig {
    id: "temp-monitor".to_string(),
    cell_ref: "A1".to_string(),
    model: "mock-model".to_string(),
    equipment: vec![
        EquipmentSlot::Memory,
        EquipmentSlot::Reasoning,  // Add reasoning!
    ],
    config: HashMap::new(),
};
```

**Now agent can:**
- Make decisions based on data
- Evaluate conditions
- Choose actions intelligently

---

## Social Coordination

### What is Social Coordination?

Agents can work together using patterns:
- **Master-Slave**: One agent coordinates workers
- **Co-Worker**: Peers collaborate
- **Peer**: Equal coordination
- **Observer**: One agent watches another

### Step 1: Create Multiple Agents

```rust
let mut core = ClawCore::new();

// Create master agent
let master_config = AgentConfig {
    id: "master".to_string(),
    cell_ref: "A1".to_string(),
    model: "mock-model".to_string(),
    equipment: vec![EquipmentSlot::Coordination],
    config: HashMap::new(),
};

core.add_agent(master_config).await?;

// Create worker agents
for i in 1..=3 {
    let worker_config = AgentConfig {
        id: format!("worker-{}", i),
        cell_ref: format!("A{}", i + 1),
        model: "mock-model".to_string(),
        equipment: vec![],
        config: HashMap::new(),
    };

    core.add_agent(worker_config).await?;
}
```

### Step 2: Establish Relationships

```rust
// Get master agent
let master = core.get_agent("master").await?;

// Add slaves
master.add_slave("worker-1").await?;
master.add_slave("worker-2").await?;
master.add_slave("worker-3").await?;
```

### Step 3: Coordinate Work

```rust
// Master delegates work to slaves
let task = Task {
    name: "process-data".to_string(),
    data: vec![1, 2, 3, 4, 5],
};

// Execute in parallel with aggregation
let results = master.execute_parallel(task).await?;

println!("Results: {:?}", results);
```

**Coordination Strategies:**
- **Parallel**: All workers execute simultaneously
- **Sequential**: Workers execute in order
- **Consensus**: All workers must agree
- **Majority Vote**: Majority decision wins
- **Weighted**: Weight by confidence

---

## Complete Example

### Temperature Monitoring System

Here's a complete example that puts it all together:

```rust
use claw_core::{ClawCore, AgentConfig, EquipmentSlot, TriggerType};
use std::collections::HashMap;
use std::time::Duration;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create core engine
    let mut core = ClawCore::new();

    // Create temperature monitor agent
    let monitor_config = AgentConfig {
        id: "temp-monitor".to_string(),
        cell_ref: "A1".to_string(),
        model: "mock-model".to_string(),
        equipment: vec![
            EquipmentSlot::Memory,
            EquipmentSlot::Reasoning,
        ],
        config: {
            let mut map = HashMap::new();
            map.insert("threshold".to_string(), serde_json::json!(30.0));
            map
        },
    };

    core.add_agent(monitor_config).await?;

    // Create alert agent
    let alert_config = AgentConfig {
        id: "alert-agent".to_string(),
        cell_ref: "A2".to_string(),
        model: "mock-model".to_string(),
        equipment: vec![],
        config: HashMap::new(),
    };

    core.add_agent(alert_config).await?;

    // Start monitoring
    core.start().await?;

    // Simulate temperature changes
    let temps = vec![25.0, 27.0, 31.0, 29.0, 33.0];

    for temp in temps {
        println!("Temperature: {}°C", temp);

        if temp > 30.0 {
            println!("⚠️  Temperature exceeds threshold!");
            // Trigger alert agent
            // core.trigger("alert-agent", alert_payload).await?;
        }

        tokio::time::sleep(Duration::from_secs(1)).await;
    }

    // Stop monitoring
    core.stop().await?;

    Ok(())
}
```

---

## Next Steps

### Learn More

1. **[Architecture Guide](docs/CELL_FIRST_DESIGN.md)** - Deep dive into Actor Model
2. **[API Reference](docs/api/)** - Complete API documentation
3. **[Equipment Guide](docs/EQUIPMENT_GUIDE.md)** - All equipment slots
4. **[Social Patterns](docs/SOCIAL_COORDINATION_GUIDE.md)** - Coordination patterns

### Practice Projects

**Beginner:**
- [ ] Create a simple polling bot
- [ ] Build a data aggregation agent
- [ ] Implement a notification system

**Intermediate:**
- [ ] Build a master-slave processing system
- [ ] Create a learning agent with seeds
- [ ] Implement a consensus-based decision system

**Advanced:**
- [ ] Build a real-time monitoring dashboard
- [ ] Create a distributed processing system
- [ ] Implement a self-optimizing agent swarm

### Contribute

- Report bugs: [GitHub Issues](https://github.com/SuperInstance/claw/issues)
- Suggest features: [GitHub Discussions](https://github.com/SuperInstance/claw/discussions)
- Submit PRs: [GitHub Pull Requests](https://github.com/SuperInstance/claw/pulls)

---

## Troubleshooting

### Common Issues

**1. Build Errors**
```
error: linker `link.exe` not found
```
**Solution:** Install C++ build tools
- Windows: Visual Studio Build Tools
- Linux: `sudo apt install build-essential`
- macOS: Xcode Command Line Tools

**2. Runtime Errors**
```
Error: AgentNotFound
```
**Solution:** Ensure agent is created before use
```rust
core.add_agent(config).await?;  // Create first
let agent = core.get_agent("id").await?;  // Then get
```

**3. Async Errors**
```
error: future cannot be sent between threads safely
```
**Solution:** Use `tokio::sync::RwLock` for shared state
```rust
use tokio::sync::RwLock;
let data = Arc::new(RwLock::new(MyData::new()));
```

**4. Performance Issues**
- Agent too slow? → Use Bot instead of Claw
- High memory? → Unequip unused equipment
- Trigger delays? → Check trigger configuration

### Getting Help

**Resources:**
- [Documentation](docs/)
- [Examples](core/examples/)
- [GitHub Issues](https://github.com/SuperInstance/claw/issues)
- [GitHub Discussions](https://github.com/SuperInstance/claw/discussions)

**Before Asking:**
1. Check documentation
2. Search existing issues
3. Create minimal reproducible example
4. Include error messages and system info

---

## Best Practices

### Do's

✅ **DO** start with simple agents
✅ **DO** use Bot agents when possible (faster, simpler)
✅ **DO** add equipment only when needed
✅ **DO** test with small agent counts first
✅ **DO** monitor memory usage
✅ **DO** handle errors gracefully
✅ **DO** use proper async/await patterns

### Don'ts

❌ **DON'T** create thousands of agents without testing
❌ **DON'T** equip all equipment slots unnecessarily
❌ **DON'T** use Claw agents when Bot will suffice
❌ **DON'T** ignore error messages
❌ **DON'T** block async operations
❌ **DON'T** forget to stop agents when done
❌ **DON'T** expect ML to work without configuration

---

## Summary

Congratulations! You've learned:
- ✅ How to create and run Claw agents
- ✅ How to configure agent behavior
- ✅ How to add equipment for capabilities
- ✅ How to coordinate multiple agents
- ✅ Best practices for agent design

**You're now ready to:**
- Build your own agent systems
- Explore advanced features
- Contribute to the project
- Integrate with spreadsheet platforms

**Happy agent building! 🚀**

---

**Last Updated:** 2026-03-17
**Version:** 0.1.0
**Feedback:** [Open an issue](https://github.com/SuperInstance/claw/issues)
