# 🦀 Claw Engine: Rust Port Blueprint

## Project Structure
A Cargo workspace to modularize the engine.

```
claw-engine/
├── Cargo.toml
├── crates/
│   ├── claw-core/         # Core data structures, state machine (Rust Port of Schema)
│   ├── claw-runtime/      # Tokio async runtime, event loop, triggers
│   ├── claw-equipment/    # Module system (Memory, Reasoning, etc.)
│   └── claw-bindings/     # (Optional) FFI / Wasm bindings for spreadsheet-moment
└── src/
    └── main.rs            # CLI entry point
```

## 1. Core Data Structures (`claw-core`)
Direct mapping of `schemas_gold_standard/claw_agent.json`.

### Claw Agent (The Entity)
```rust
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClawAgent {
    pub id: Uuid,
    pub version: String, // SemVer
    pub name: String,
    
    // Intelligence Source
    pub model: ModelConfiguration,
    
    // Thermodynamic State (Gamma, Eta, Delta)
    pub state: ClawState,
    
    // Current Operating Values
    pub temperature: f64,
    pub semantic_distance: f64,
    
    // Lifecycle
    pub last_validation: chrono::DateTime<chrono::Utc>,
    pub molt_count: u8, // Max 5
    pub capability: Option<f64>,
    
    // Extensions
    pub equipment: Vec<EquipmentSlot>,
    pub seed: Seed,
    pub shell: Shell,
    
    // Execution
    pub execution_context: Option<ExecutionContext>,
    pub origin: Option<Origin>,
}
```

### State Machine (The Lifecycle)
```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ClawPhase {
    Dormant,
    Thinking,  // Waiting for LLM inference
    Processing,// Executing tools/actions
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClawState {
    // P56 Thermodynamic Variables
    pub gamma: f64, // Crystallized
    pub eta: f64,   // Liquid
    pub delta: f64, // Conservation deviation
    
    // Mode
    pub mode: OperationMode,
    pub crystallization_rate: Option<f64>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum OperationMode {
    OnePhase,
    TwoPhase,
    Hybrid,
}
```

### Seed & Equipment (The DNA & Tools)
```rust
// Seed: Machine-learnable behavior definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Seed {
    pub id: Option<Uuid>,
    pub purpose: String, // Natural language description
    pub trigger: Trigger,
    pub learning_strategy: LearningStrategy,
    pub default_equipment: Vec<String>, // Vec of equipment type names
}

// Trigger: What wakes the Claw?
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Trigger {
    #[serde(rename = "periodic")]
    Periodic { interval: u64 }, // ms
    
    #[serde(rename = "event")]
    Event { event: String }, // CNS Event Name
    
    #[serde(rename = "cron")]
    Cron { cron: String },
}

// Equipment Slot: Dynamic "Muscles"
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EquipmentSlot {
    pub r#type: EquipmentType,
    pub active: bool,
    pub module: Option<ModuleInstance>,
    
    // Muscle Memory: When to re-equip automatically
    pub activation_condition: Option<serde_json::Value>,
    
    // Cost of running this module
    pub cost: Option<CostMetrics>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EquipmentType {
    Sensor,
    Memory,
    Reasoning,
    Communication,
    Coordination,
    Verification,
    Creative,
    Distillation,
    // Maritime Specifics (My Specialties)
    Sonar,
    Vision,
    Audio,
}
```

## 2. Runtime Architecture (`claw-runtime`)
The engine loop. We will use `tokio` for async, `tracing` for observability.

### The Loop
```rust
// Pseudocode for the main execution loop in Tokio

pub async fn run_claw(mut agent: ClawAgent) -> Result<ClawAgent, Box<dyn std::error::Error>> {
    // 1. Wait for Trigger (Interval, Event, or Cron)
    let trigger_fired = agent.seed.trigger.wait().await;
    
    // 2. Transition to THINKING
    agent.state.mode = OperationMode::TwoPhase; // Example transition logic
    
    // 3. Load Equipment (if not active)
    // The "Muscle Memory" checks activation_condition
    for slot in &mut agent.equipment {
        if !slot.active && should_activate(&slot.activation_condition, &trigger_fired) {
            slot.active = true;
            // Spawn module future...
        }
    }

    // 4. Inference (Call LLM Provider)
    // This is where `pi-embedded-runner/run/` logic goes in Rust
    let llm_response = call_provider(&agent.model, &agent.state).await?;

    // 5. Transition to PROCESSING
    // Execute Tool Calls or Actions
    if let Some(tools) = llm_response.tool_calls {
        for tool in tools {
            // Dispatch to equipment modules
            execute_tool(tool, &mut agent).await?;
        }
    }

    // 6. Update State (Gamma, Eta, Delta)
    update_thermodynamics(&mut agent, &llm_response);

    // 7. Check for Molt (If Capability drops or Gamma peaks)
    if agent.capability < 0.1 || agent.state.gamma > 0.9 {
        molt(&mut agent).await;
        agent.molt_count += 1;
    }

    // 8. Return to DORMANT
    Ok(agent)
}
```

## 3. Migration Strategy

**Phase 1: Type Parity**
- [ ] Implement `claw-core` with `serde` matching `claw_agent.json` 100%.
- [ ] Write unit tests for serialization round-trips.

**Phase 2: The Loop**
- [ ] Implement `Trigger` future in Tokio.
- [ ] Implement a dummy LLM provider (return static text).
- [ ] Verify the state machine transitions (Dormant -> Thinking -> Processing -> Dormant).

**Phase 3: Equipment**
- [ ] Define `Equipment` trait.
- [ ] Implement `MemoryEquipment` (basic key-value).
- [ ] Implement `ReasoningEquipment` (LLM wrapper).

## 4. Key Differences from TypeScript

| TypeScript | Rust |
| :--- | :--- |
| Dynamic `any` types | Strict `serde_json::Value` or Enums |
| EventEmitter | `tokio::sync::broadcast` |
| Async/Await (Node) | Async/Await (Tokio Runtime) |
| No manual memory management | `Arc<Mutex<ClawAgent>>` for shared state |
| Subagent Registry | `DashMap<Uuid, ClawAgent>` (Concurrent HashMap) |

## Next Action
Create `C:/Users/casey/claw/claw-engine/` directory and initialize the Cargo workspace.
