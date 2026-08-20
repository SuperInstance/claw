# Claw - Next Phases

**Last updated:** 2026-08-20

## Phase 1: Align Core Model with Schema

### 1.1 Equipment Slot Alignment
- [ ] Map Rust `EquipmentSlot` to schema slots: MEMORY, REASONING, CONSENSUS, SPREADSHEET, DISTILLATION, COORDINATION
- [ ] Create `Equipment` struct with id, version, slot, capabilities, metadata
- [ ] Implement serialization/deserialization to/from JSON Schema

### 1.2 State Alignment
- [ ] Sync `AgentState` variants with schema state enum: IDLE, THINKING, ACTIVE, RECOVERING, STALLED, OFFLINE
- [ ] Add state transition guards and error handling
- [ ] Implement state persistence

### 1.3 Schema Binding
- [ ] Add `serde` structs for `Claw`, `Bot`, `Seed`, `Equipment`, `Social`, `Protocol`
- [ ] Validate instances against `schemas/claw-schema.json`
- [ ] Add `jsonschema` crate integration for runtime validation

## Phase 2: Implement Missing Domain Objects

### 2.1 Bot Module
- [ ] Implement deterministic automation loop
- [ ] `loop_id`, `frequency_hz`, `steps` with `action` and `condition`
- [ ] Executor for step conditions

### 2.2 Seed Module
- [ ] Machine-learnable behavior definition
- [ ] Support learning strategies: REINFORCEMENT, SUPERVISED, UNSUPERVISED, EVOLUTIONARY
- [ ] Trigger system with event_type and threshold

### 2.3 Social Module
- [ ] Connections: slaves and co_workers
- [ ] Protocol implementations: RAFT, PAXOS, GOSSIP, BYZANTINE_FAULT_TOLERANT
- [ ] Quorum size configuration

## Phase 3: Developer Experience

### 3.1 Examples & Tests
- [ ] `examples/basic_claw.rs` - create instance, equip, step
- [ ] `examples/from_schema.rs` - load JSON and instantiate
- [ ] Unit tests for lifecycle transitions
- [ ] Integration tests for serialization roundtrip

### 3.2 CLI & Tooling
- [ ] Binary crate `claw-cli` for validate, init, run
- [ ] `claw validate schema.json` command
- [ ] `claw new` project scaffolding

### 3.3 Documentation
- [ ] README.md with quickstart
- [ ] API docs via `cargo doc`
- [ ] Architecture decision records in `docs/adr/`

## Phase 4: Quality & Release

### 4.1 CI/CD
- [ ] GitHub Actions: cargo fmt, clippy, test on Linux/macOS/Windows
- [ ] Add .gitignore for target/, Cargo.lock policy
- [ ] Release automation with crates.io publishing

### 4.2 Observability
- [ ] Logging via tracing
- [ ] Metrics for step latency and state changes
- [ ] Error types with thiserror

### 4.3 Performance
- [ ] Benchmark step loop
- [ ] Optimize HashSet usage for equipment
- [ ] Async concurrency model for multi-claw

## Near-Term Milestones

1. **Week 1:** Align enums with schema, add serde structs, basic validation
2. **Week 2:** Implement Bot and Seed structs, add examples
3. **Week 3:** Add tests + CI, publish 0.2.0

## Open Questions

- Should `ClawInstance` be generic over equipment types?
- How to handle versioning of schema vs code?
- Persistence layer: file, SQLite, or external store?
- Do we need a registry for equipment plugins?
