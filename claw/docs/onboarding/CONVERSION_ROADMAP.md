# Claw Engine — Conversion Roadmap
**Status:** Phase 6 Multi-Round Complete → Onward  
**Target:** Minimal Rust Cellular Agent Engine  
**Branch:** `phase-3-simplification`  
**Workspace:** `claw-core / claw-api / claw-schema`

---

## The Mission

Stripping OpenCLAW legacy out of `claw/` and leaving only the **Cellular Engine**:
- One Claw instance per spreadsheet cell
- Equipment modular architecture (6 slots)
- Seed-learnable behaviors
- FPS-oriented spatial filtering (no god's eye view)

`claw/` is **not** a general-purpose chatbot framework. It is a **cell inhabitant**.

---

## Current File Map (What Exists Now)

```
claw/
├── Cargo.toml              ← Workspace lock (READ ONLY — pinned)
├── claw-core/src/          ← ENGINE IMPLEMENTATION
│   ├── lib.rs              ← Entry point, re-exports
│   ├── claw.rs             ← Core Claw struct + lifecycle
│   ├── common.rs           ← Shared types (Trigger, State, Event)
│   ├── consensus.rs        ← TripartiteConsensus equipment module
│   ├── equipment.rs        ← EquipmentSlot enum + trait definitions
│   └── seed.rs             ← Seed definition + training interface
├── claw-api/src/           ← SURFACE LAYER (REST + WebSocket)
│   ├── lib.rs
│   ├── rest.rs             ← Axum REST endpoints
│   ├── ws.rs               ← WebSocket handler (tokio-tungstenite)
│   └── traits.rs           ← Public API trait definitions
├── claw-schema/src/        ← SCHEMA OF RECORD
│   ├── lib.rs
│   └── validator.rs        ← JSON Schema validation (jsonschema crate)
└── .archive/historical-docs/  ← OPENCLAW LEGACY (DO NOT TOUCH)
    ├── acpx/
    ├── anthropic/
    ├── bluebubbles/
    └── ... (15+ plugin dirs)
```

---

## Conversion Phases

### Phase 1: Verify the Core (Current State Audit)
**Owner:** Rust Engineer  
**Acceptance Criteria:**
- [ ] `cargo check --workspace` passes with zero warnings
- [ ] `cargo test --workspace` passes (163+ tests)
- [ ] No OpenCLAW imports in `claw-core/src/*.rs`
- [ ] All 6 equipment slots implemented: MEMORY, REASONING, CONSENSUS, SPREADSHEET, DISTILLATION, COORDINATION
- [ ] `claw.rs` module count ≤ 500 LOC
- [ ] Agent creation benchmark < 10ms
- [ ] Trigger latency benchmark < 100ms
- [ ] Memory footprint < 10MB per agent

### Phase 2: Extract the Archive (Never Touch Again)
**Action:** Move `.archive/historical-docs/` permanently out of active build path.
- [ ] Confirm `.archive/` is `.gitignore`d
- [ ] Document what was extracted (link to SuperInstance-papers if relevant)
- [ ] Strip any lingering legacy imports from `claw-core/src/common.rs`

> **Rule:** If it came from OpenCLAW and isn't in the schema, it's dead code.

### Phase 3: Schema-First Implementation Guard
Every new feature must:
1. Be defined in `claw-schema/src/lib.rs` **first**
2. Have a validator test in `claw-schema/src/validator.rs`
3. Have an integration test in the consuming module

```
Schema → Validator → Implementation → Test
```

**No skipping ahead.** Schema is the constitution.

### Phase 4: Equipment System Hardening
Current status: slots defined, traits exist.  
Target: dynamic equip/unequip at runtime with muscle-memory extraction.

- [ ] `EquipmentSlot` trait: `equip()` / `unequip()` / `muscle_memory()`
- [ ] `unequip()` returns `TriggerPattern` — the "muscle memory"
- [ ] Claw canauto-reequip when trigger pattern re-encounters
- [ ] Benchmark: equip/unequip cycle < 1ms

### Phase 5: Seed Learning Interface
Target: natural language → optimized behavior

- [ ] `ClawSeed` struct: purpose, trigger, learningStrategy, defaultEquipment
- [ ] `train_seed()` async method on `ClawSystem`
- [ ] Learned claw spawns with optimized weights
- [ ] Integration test: seed → train → spawn → run → validate

### Phase 6: FPS Spatial Filtering
Each Claw has `(x, y, z, θ)` in geometric space. Trigger relevance is computed geometrically.

- [ ] `SpatialIndex` trait implemented in `claw-core/src/common.rs`
- [ ] KD-tree or constrainttheory-backed index
- [ ] Trigger broadcast only reaches Claws whose receptive field intersects event
- [ ] Benchmark: O(log n) spatial query verified at 10,000 agents

### Phase 7: Social Architecture
Master/Slave + Co-worker patterns.

- [ ] `SlaveClaw` struct: inherits parent's spatial position + equipment subset
- [ ] `CoWorkerClaw` struct: shares workspace, independent position
- [ ] Consensus protocol: `TripartiteConsensus` calls `agree(decision)` across 3+ claws
- [ ] No shared mutable state — all communication via typed events

---

## Team Handoff Protocols

When delegating work to a Rust Engineer subagent, the task packet **must** include:

```markdown
## Task Packet
**Module:** claw-core / claw-api / claw-schema  
**Phase:** [1-7]  
**Function to implement:** `[exact fn signature]`  
**Schema rule:** `[reference to claw-schema/src/lib.rs line]`  
**Test gate:** `cargo test --workspace` must pass  
**Benchmark gate:** [specific benchmark name] must meet [threshold]
```

## Non-Negotiables

1. **Rust 2021 edition** — no 2018 compat hacks
2. **No async in constructors** — Claw::new() is sync; lifecycle is async
3. **Origin tracking** — every event carries `source_agent_id: Uuid`
4. **No god objects** — Claw struct < 400 LOC, each module < 500 LOC
5. **Tests first** — write the test, then the implementation
6. **Schema is law** — if it's not in the schema, it doesn't exist

---

*Ship it. The water's waiting.*
