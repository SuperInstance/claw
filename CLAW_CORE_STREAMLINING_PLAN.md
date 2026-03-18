# Claw-Core MVP Streamlining Plan

**Date:** 2026-03-18
**Objective:** Reduce claw from ~15,686 LOC to <5,000 LOC by removing non-essential features
**Target:** Create a working MVP with only essential cellular agent functionality

---

## Current State Analysis

### Current Code Statistics
- **Total LOC:** ~13,751 lines in `core/src/`
- **Module Breakdown:**
  - Agent: 437 lines
  - Core: ~800 lines (estimated)
  - Equipment: 2,500+ lines
  - Social: 3,500+ lines
  - WebSocket: 1,400+ lines
  - API: 2,800+ lines
  - Tests/Other: ~2,500 lines

### Complexities Identified
1. **6 Equipment Slots** - Keep only MEMORY (1 slot)
2. **Social Coordination** - Remove entirely (3,500+ lines)
3. **WebSocket Server** - Remove for MVP (1,400+ lines)
4. **Advanced API** - Simplify to CRUD only (reduce from 2,800 to ~800 lines)
5. **Learning Metrics** - Remove from agent state
6. **Equipment Subsystems** - Remove muscle memory, monitoring, lazy loading

---

## STREAMLINING PLAN

### 1. FILES TO KEEP (Essential Core)

#### Core Structure
```
core/src/
├── lib.rs              # Simplified exports
├── agent.rs            # Simplified agent (remove learning metrics)
├── core.rs             # Core event loop
├── error.rs            # Error types
├── messages.rs         # Message types (simplified)
└── equipment/
    ├── mod.rs          # Simplified to 1 slot (MEMORY only)
    └── memory.rs       # Simple memory implementation
```

#### Minimal API
```
core/src/
└── api/
    ├── mod.rs          # Simplified exports
    ├── handlers.rs     # CRUD endpoints only
    ├── models.rs       # Request/response models
    └── server.rs       # Axum server setup
```

#### Tests
```
core/tests/
├── agent_tests.rs      # Basic agent lifecycle tests
└── integration.rs      # Basic integration tests
```

---

### 2. FILES TO REMOVE (Non-Essential)

#### Social Module (3,500+ lines)
```
core/src/social/
├── mod.rs              # REMOVE
├── manager.rs          # REMOVE
├── consensus.rs        # REMOVE
├── message.rs          # REMOVE
├── patterns.rs         # REMOVE
├── relationships.rs    # REMOVE
├── routing.rs          # REMOVE
├── strategies.rs       # REMOVE
├── tests.rs            # REMOVE
└── benches.rs          # REMOVE
```

#### WebSocket Module (1,400+ lines)
```
core/src/ws/
├── mod.rs              # REMOVE
├── protocol.rs         # REMOVE
├── server.rs           # REMOVE
└── tests.rs            # REMOVE
```

#### Advanced Equipment (2,000+ lines)
```
core/src/equipment/
├── hierarchical_memory.rs  # REMOVE (use simple memory)
├── muscle_memory.rs        # REMOVE
├── loading.rs              # REMOVE
├── monitoring.rs           # REMOVE
├── slots.rs                # REMOVE
├── benches.rs              # REMOVE
└── tests.rs                # REMOVE
```

#### Advanced API Features (1,500+ lines)
```
core/src/api/
├── auth.rs              # REMOVE (use simple API key)
├── middleware.rs        # REMOVE (simplify)
├── social_handlers.rs   # REMOVE
└── webSocket.rs         # REMOVE
```

#### Other Files
```
core/src/
├── core_optimized.rs    # REMOVE (use core.rs only)
└── performance.rs       # REMOVE (not needed for MVP)

core/examples/
├── equipment_hot_swap.rs         # REMOVE
├── social_coordination.rs        # REMOVE
└── websocket_server.rs           # REMOVE
```

---

### 3. FILES TO SIMPLIFY

#### agent.rs (437 → ~250 lines)
**Remove:**
- `LearningMetrics` struct
- `SerializableInstant` (use SystemTime directly)
- Social relationship handling
- Complex trigger processing

**Keep:**
- Basic `Agent` trait
- `MinimalAgent` implementation
- `AgentConfig`, `AgentState`, `AgentStatus`
- Basic message processing

#### equipment/mod.rs (721 → ~150 lines)
**Remove:**
- 5 equipment slots (keep only MEMORY)
- `EquipmentManager` complexity
- Muscle memory system
- Cost/benefit analysis
- All sub-modules except simple memory

**Keep:**
- `EquipmentSlot` enum (only Memory variant)
- `Equipment` trait (simplified)
- `SimpleMemoryEquipment` implementation

#### api/handlers.rs (575 → ~200 lines)
**Remove:**
- WebSocket upgrade endpoint
- Social coordination endpoints
- Equipment hot-swap endpoints
- Complex query endpoints

**Keep:**
- `POST /agents` - Create agent
- `GET /agents/:id` - Get agent state
- `PUT /agents/:id` - Update agent
- `DELETE /agents/:id` - Delete agent
- `POST /agents/:id/triggers` - Add trigger

---

## SIMPLIFIED ARCHITECTURE

### Agent State (Before → After)

**Before:**
```rust
pub struct AgentState {
    pub status: AgentStatus,
    pub reasoning: Option<String>,
    pub learning_metrics: LearningMetrics,      // REMOVE
    pub equipment: Vec<EquipmentSlot>,           // Simplify to 1 slot
    pub memory: HashMap<String, serde_json::Value>,
}
```

**After:**
```rust
pub struct AgentState {
    pub status: AgentStatus,
    pub memory: HashMap<String, serde_json::Value>,
    pub has_memory_equipment: bool,              // Simple boolean
}
```

### Equipment System (Before → After)

**Before:**
```rust
pub enum EquipmentSlot {
    Memory,          // Keep
    Reasoning,       // Remove
    Consensus,       // Remove
    Spreadsheet,     // Remove
    Distillation,    // Remove
    Coordination,    // Remove
}
```

**After:**
```rust
pub enum EquipmentSlot {
    Memory,          // Only slot
}
```

### API Endpoints (Before → After)

**Before:**
- POST /agents
- GET /agents
- GET /agents/:id
- PUT /agents/:id
- DELETE /agents/:id
- POST /agents/:id/equip
- POST /agents/:id/unequip
- POST /agents/:id/slaves
- POST /agents/:id/co-workers
- GET /agents/:id/state
- WebSocket /ws

**After:**
- POST /agents
- GET /agents/:id
- PUT /agents/:id
- DELETE /agents/:id
- POST /agents/:id/triggers

---

## IMPLEMENTATION STEPS

### Phase 1: Prepare for Simplification
1. ✅ Analyze current structure
2. ✅ Create streamlining plan
3. ⏳ Backup current code to `claw-full-backup` branch

### Phase 2: Remove Non-Essential Modules
4. ⏳ Remove social module entirely
5. ⏳ Remove WebSocket module entirely
6. ⏳ Remove advanced equipment subsystems
7. ⏳ Remove advanced API features

### Phase 3: Simplify Core Components
8. ⏳ Simplify agent.rs (remove learning metrics)
9. ⏳ Simplify equipment to 1 slot
10. ⏳ Simplify API to CRUD only
11. ⏳ Update lib.rs exports

### Phase 4: Update Tests
12. ⏳ Remove social/WS tests
13. ⏳ Remove advanced equipment tests
14. ⏳ Keep only MVP tests
15. ⏳ Ensure all tests pass

### Phase 5: Documentation
16. ⏳ Update README.md for MVP
17. ⏳ Create API documentation (simple)
18. ⏳ Create MIGRATION.md for removed features
19. ⏳ Update examples

### Phase 6: Finalization
20. ⏳ Verify LOC <5,000
21. ⏳ Run all tests
22. ⏳ Create git commit
23. ⏳ Push to GitHub

---

## EXPECTED RESULTS

### Code Reduction
- **Before:** ~13,751 lines
- **After:** ~4,500 lines (67% reduction)
- **Target:** <5,000 lines ✅

### Module Reduction
- **Before:** 33 Rust files
- **After:** ~12 Rust files (64% reduction)

### Feature Reduction
- **Equipment Slots:** 6 → 1
- **API Endpoints:** 11 → 5
- **Dependencies:** Remove WebSocket, social, advanced equipment

---

## MIGRATION GUIDE (Extracted Features)

### Features Extracted to Future "claw-extensions":

1. **Social Coordination** → `claw-social` crate
2. **WebSocket Server** → `claw-ws` crate
3. **Advanced Equipment** → `claw-equipment` crate
4. **Learning System** → `claw-learning` crate
5. **Monitoring** → `claw-monitor` crate

These can be re-added as optional dependencies in Phase 4.

---

## SUCCESS CRITERIA

✅ LOC <5,000
✅ Only essential features (create, start, stop, delete agents)
✅ Basic trigger system (data triggers only)
✅ Single equipment slot (MEMORY)
✅ Simple API (5 endpoints)
✅ All tests passing
✅ Clean documentation
✅ Migration guide created

---

**Last Updated:** 2026-03-18
**Status:** Plan Complete - Ready for Implementation
