# Claw - Current State

**Last updated:** 2026-08-20
**Repo:** https://github.com/SuperInstance/claw.git
**Branch:** master

## Overview

Claw is the cellular agent engine for the SuperInstance platform. It provides a Rust core for defining, equipping, and stepping autonomous agent instances with modular equipment slots and a lifecycle state machine.

## Tech Stack

- **Language:** Rust 2021 edition
- **Async runtime:** tokio 1.x with full features
- **Traits:** async-trait 0.1
- **Serialization:** serde 1.0 + serde_json 1.0
- **Schema:** JSON Schema Draft-07 at `schemas/claw-schema.json`

## Repository Structure

```
claw/
├─ Cargo.toml
├─ Cargo.lock
├─ src/
│  ├─ lib.rs
│  └─ core/
│     ├─ agent.rs
│     └─ lifecycle.rs
└─ schemas/
   └─ claw-schema.json
```

## Implemented Components

### src/core/lifecycle.rs
- `AgentState` enum with variants: `Idle`, `Thinking`, `Acting`, `Error(String)`
- Serializable via serde

### src/core/agent.rs
- `EquipmentSlot` enum: Head, Torso, Arms, Legs, Special
- `Claw` async trait with `equip`, `unequip`, `step`
- `ClawInstance` struct with `state: AgentState` and `equipment: HashSet<EquipmentSlot>`
- `ClawInstance::new()` initializes state to `Idle`
- Implementation of `Claw`:
  - `equip` inserts slots and resets state to Idle
  - `unequip` removes slot and resets state to Idle
  - `step` cycles Idle -> Thinking -> Acting -> Idle, propagates `Error`

### schemas/claw-schema.json
Definitive schema for SuperInstance engine:
- Root `claw` object with id, type, model_type, state, equipment
- `state` enum: IDLE, THINKING, ACTIVE, RECOVERING, STALLED, OFFLINE
- `equipment` objects with slot enum: MEMORY, REASONING, CONSENSUS, SPREADSHEET, DISTILLATION, COORDINATION
- `bot` definition for deterministic automation loops
- `seed` definition for machine-learnable behaviors with learning_strategy enum
- `social` definition for connections and consensus protocols RAFT/PAXOS/GOSSIP/BYZANTINE_FAULT_TOLERANT

## Git History

- `88079617d 2026-08-07` Implement core Claw trait and Agent lifecycle
- Branch: master is up to date with origin/master
- Remotes: origin/main, origin/claw-core-mvp, origin/clean-publish

## Known Gaps

- No public examples or binary entrypoint
- Rust code EquipmentSlot values do not match JSON schema slot names
- Schema defines bot/seed/social objects with no Rust implementations
- No tests, CI, or documentation beyond schema
- `target/` build artifacts were previously tracked and now deleted locally

## Dependencies

From Cargo.toml:
- tokio = { version = "1", features = ["full"] }
- async-trait = "0.1"
- serde = { version = "1.0", features = ["derive"] }
- serde_json = "1.0"
