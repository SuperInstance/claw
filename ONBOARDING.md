# Claw Onboarding Guide

Welcome to Claw! This guide will get you productive with the SuperInstance cellular agent engine.

## Prerequisites

- Rust stable 1.70+ installed: https://rustup.rs
- Git
- Basic familiarity with async Rust

Verify installation:
```bash
rustc --version
cargo --version
```

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/SuperInstance/claw.git
cd claw
```

### 2. Build
```bash
cargo build
```

### 3. Explore structure
```
src/
  lib.rs          # Public module exports
  core/
    agent.rs      # Claw trait and ClawInstance
    lifecycle.rs  # AgentState enum
schemas/
  claw-schema.json # JSON Schema for instances
```

### 4. Run existing code
No binary yet. Create a quick test file:
```bash
cat > test_claw.rs <<'EOF'
use claw::core::agent::{ClawInstance, Claw, EquipmentSlot};
use claw::core::lifecycle::AgentState;

#[tokio::main]
async fn main() {
    let mut claw = ClawInstance::new();
    println!("Initial state: {:?}", claw.state);
    claw.equip(vec![EquipmentSlot::Head, EquipmentSlot::Torso]).await;
    println!("After equip: {:?}", claw.state);
    claw.step().await.unwrap();
    println!("After step: {:?}", claw.state);
}
EOF
rustc test_claw.rs --extern claw=target/debug/libclaw.rlib -L target/debug/deps
```

Better: add an example crate later.

## Development Workflow

### Running tests
```bash
cargo test
```

### Linting and formatting
```bash
cargo fmt
cargo clippy -- -D warnings
```

### Adding a module
1. Create file under `src/`
2. Export in `src/lib.rs`
3. Add unit tests in `src/<module>_tests.rs` or `#[cfg(test)]`

## Code Style

- Use `async-trait` for async traits
- Derive `Serialize`/`Deserialize` for all public structs
- Keep `AgentState` transitions explicit and tested
- Prefer `Result<(), String>` for now; migrate to proper Error type later

## Understanding the Core

### Claw Trait
```rust
#[async_trait]
pub trait Claw {
    async fn equip(&mut self, slots: Vec<EquipmentSlot>);
    async fn unequip(&mut self, slot: EquipmentSlot);
    async fn step(&mut self) -> Result<(), String>;
}
```

### Lifecycle
Idle → Thinking → Acting → Idle
Error state propagates until reset.

### Schema
All instances should validate against `schemas/claw-schema.json`. The schema defines:
- `claw` object with id, type, state, equipment
- `equipment` slots: MEMORY, REASONING, CONSENSUS, SPREADSHEET, DISTILLATION, COORDINATION
- `bot`, `seed`, `social` extensions

## Contributing

1. Create a feature branch: `git checkout -b feat/equipment-mapping`
2. Make changes with tests
3. Update `CURRENT_STATE.md` if scope changes
4. Open PR against `master`
5. Ensure CI passes

## Useful Commands

```bash
git log --oneline --graph
cargo doc --open
cargo check
```

## Getting Help

- Read `CURRENT_STATE.md` for current implementation status
- Read `NEXT_PHASES.md` for roadmap
- Open an issue on GitHub for bugs or questions

## Next Steps for New Contributors

Pick a starter issue:
- Align `EquipmentSlot` enum with JSON schema
- Add serde structs for schema binding
- Write first example in `examples/`
- Add unit tests for `ClawInstance::step`

Happy building!
