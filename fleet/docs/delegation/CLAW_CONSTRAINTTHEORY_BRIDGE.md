# Claw ↔ ConstraintTheory Bridge — Integration Notes
**Bridges:** `claw/` ↔ `constrainttheory/`  
**Now live constrainttheory:** production at constraint-theory.superinstance.ai

---

## The Link

The ConstraintTheory substrate is the **geometry** the Claw inhabits. Without it, Claws are blind agents acting in featureless void. With it, every trigger, every position, every spatial query is geometrically grounded.

```
ConstraintTheory (Geometric Engine)
  │
  │  provides: DodecetDecoder, KDTreeIndex, SpatialQuery
  │
  ▼
Claw Engine (Agent Runtime)
  │
  │  uses: position (x,y,z,θ), spatial_index, origin tracking
  │
  ▼
Claw Instance
  │
  │  sees: only events within its receptive field
  │
  ▼
Trigger fires ←→ spatial filter passes ←→ agent acts
```

---

## constrainttheory/ What's There Now

- **68+ tests** — all passing
- **Dodecet encoder** — 12-bit geometric encoding
- **KD-tree spatial index** — O(log n) queries
- **FPS paradigm** — agent-centric view (no god's eye)
- **Production deployment:** https://constraint-theory.superinstance.ai

### Key Files to Reference

```
constrainttheory/
├── src/
│   ├── dodecet/           ← 12-bit encoding
│   ├── spatial/           ← KD-tree index, spatial queries
│   └── manifold/          ← Geometric operations
├── tests/                 ← 68+ integration tests
└── docs/
    └── CELLULAR_AGENT_INFRASTRUCTURE_VISION.md  ← FPS paradigm
```

---

## Claw Integration Points

### 1. Spatial Index on Every Claw

```rust
// In claw-core/src/claw.rs
pub struct Claw {
    id: Uuid,
    position: DodecetPosition,  // ← from constrainttheory
    spatial_index: KDTreeHandle, // ← from constrainttheory::spatial
    state: ClawState,
    equipment: HashMap<EquipmentSlot, Box<dyn EquipmentModule>>,
    // ...
}
```

**Requirement:** Claw construction must register with a shared spatial index.

### 2. Trigger Filtering (FPS Gate)

```rust
// In claw-core/src/common.rs — how triggers reach a Claw
impl TriggerRouter {
    pub async fn route(&self, event: &SensoryEvent) -> Vec<ClawId> {
        let relevant = self.spatial_index.query(event.position, event.radius);
        // Only Claws whose receptive field intersects the event receive it
        relevant
    }
}
```

This is the **FPS gate** — asymmetric, O(log n), no coordinator required.

### 3. Origin Tracking

Every event carries its `source_agent_id`. The constrainttheory `DodecetPosition` encodes the originating agent's spatial signature. This enables:
- Provenance chains in multi-agent work
- Consensus geometry (TripartiteConsensus uses spatial voting)
- Audit trails

---

## Spreadsheet-Moment Integration at This Layer

The cell position `(row, col)` in the spreadsheet maps to `(x, y, z, θ)` in geometric space:

```
Cell (row=5, col=3)  →  Claw.position = DodecetPosition {
  x: encode_row(5),
  y: encode_col(3),
  z: 0,
  theta: 0.0
}
```

Implementation lives in: `spreadsheet-moment/packages/cudaclaw-bridge/`

Decode function needed:
```
decode_cell_to_position(row, col, sheet_id) → DodecetPosition
```

---

## Testing the Bridge

### Integration Test Checklist

- [ ] Claw instantiated at cell A1 → spatial index entry created
- [ ] Event fired at cell A2 → Claw at A1 receives it (within radius)
- [ ] Event fired at cell Z99 → Claw at A1 does NOT receive it
- [ ] 10 Claws across sheet → O(log n) query verified
- [ ] Consensus trigger → 3 Claws vote, result weighted by spatial proximity

---

*ConstraintTheory gives the Claw its world. Without it, it's just a loop.*
