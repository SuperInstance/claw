# Constraint Theory — Onboarding Guide

**Welcome!** This guide gets you productive with Constraint Theory in under 30 minutes.

## Who Should Read This

- New contributors to `constraint-theory-core`
- Researchers interested in geometric computation
- Engineers integrating Constraint Theory into SuperInstance
- Anyone curious about deterministic manifold snapping

## Quick Start

### Prerequisites

- Rust 1.75+ (`rustc --version`)
- Git
- Basic familiarity with Rust and linear algebra

Install Rust via rustup:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Clone & Build

```bash
git clone https://github.com/SuperInstance/claw.git
cd claw/constrainttheory
cd crates/constraint-theory-core
cargo build --release
cargo test --release
```

Expected output: `82 passed; 0 failed`

### Hello Constraint Theory

Create `examples/hello_snap.rs`:
```rust
use constraint_theory_core::{PythagoreanManifold, snap};

fn main() {
    let manifold = PythagoreanManifold::new(200);
    let vec = [0.6f32, 0.8];
    let (snapped, noise) = snap(&manifold, vec);
    println!("Input:  {:?}", vec);
    println!("Snapped:{:?}", snapped);
    println!("Noise:  {noise:.6}");
    assert!(noise < 0.01);
}
```

Run:
```bash
cargo run --example hello_snap --release
```

## Repository Structure

```
constrainttheory/
├── crates/
│   └── constraint-theory-core/
│       ├── src/
│       │   ├── lib.rs          # Crate root, public API
│       │   ├── manifold.rs     # PythagoreanManifold, snap
│       │   ├── kdtree.rs       # Spatial index
│       │   ├── simd.rs         # SIMD batch
│       │   ├── curvature.rs    # Ricci flow
│       │   ├── percolation.rs  # Rigidity
│       │   ├── cohomology.rs   # Sheaf cohomology
│       │   ├── gauge.rs        # Holonomy
│       │   └── tile.rs         # Constraint blocks
│       └── Cargo.toml
├── docs/                       # Research & architecture
├── tests/                      # Integration tests
└── CURRENT_STATE.md
```

## Development Workflow

### Code Style

All code must pass:
```bash
cargo fmt
cargo clippy -- -D warnings
cargo test --release
```

Public APIs require doc comments. The crate enforces `#![deny(missing_docs)]`.

### Running Tests

```bash
# Unit tests
cargo test --lib

# With output
cargo test -- --nocapture

# Specific module
cargo test manifold
```

### Adding a Feature

1. Fork the repo, create branch `feat/<name>`
2. Implement with tests
3. Update docs
4. Run `cargo fmt && cargo clippy -- -D warnings && cargo test --release`
5. Open PR against `main`

PR template requires:
- What changed
- Why it changed
- Tests added
- Performance impact

## Key Concepts

### Pythagorean Manifold

Discrete set of points on unit circle with exact rational coordinates derived from Pythagorean triples. Provides deterministic snapping.

### Φ-Folding Operator

`Φ(v) = R · v` snapped to nearest Pythagorean triple. O(log n) via KD-tree.

### Ω-Transform

Unitary symmetry invariant based on Platonic solids and manifold volume.

### Ricci Flow

Curvature evolution for geometric analysis.

### Rigidity Percolation

Laman's theorem for structural rigidity.

## Common Tasks

### Snap a vector

```rust
use constraint_theory_core::{PythagoreanManifold, snap};
let m = PythagoreanManifold::new(200);
let (snapped, noise) = snap(&m, [0.6, 0.8]);
```

### Batch SIMD

```rust
use constraint_theory_core::PythagoreanManifold;
let m = PythagoreanManifold::new(200);
let vectors = vec![[0.6,0.8], [0.8,0.6]];
let results = m.snap_batch_simd(&vectors);
```

### Use Ricci Flow

```rust
use constraint_theory_core::ricci_flow_step;
let result = ricci_flow_step(&manifold, steps=10);
```

## Debugging Tips

- **High noise**: Increase manifold density `PythagoreanManifold::new(400)`
- **Slow snap**: Check KD-tree is built; use `snap_batch_simd` for throughput
- **Clippy warnings**: Fix before PR; CI will reject
- **Missing docs**: Add `///` doc comment for all `pub` items

## Documentation

- `docs/CONSTRAINTTHEORY_RESEARCH.md` — Research background
- `docs/CONSTRAINTTHEORY_IMPLEMENTATION_GUIDE.md` — Implementation details
- `docs/ARCHITECTURE.md` — System architecture
- `CURRENT_STATE.md` — Current status
- `NEXT_PHASES.md` — Roadmap

## Getting Help

- Open an issue with reproduction steps
- Check `CONTRIBUTING.md` for guidelines
- Discussions: SuperInstance GitHub Discussions
- Captain: Casey Digennaro

## Good First Issues

- Add property tests for manifold invariance
- Improve error messages in `CTErr`
- Add benchmarks for 3D manifold prototype
- Write examples for holonomy transport
- Improve doc examples with runnable snippets

## Safety & Security

This is research-grade code. Not production-battle-tested.

- Do not use in safety-critical systems yet
- Validate results independently
- Report numerical instability issues

## License

MIT. See `LICENSE`.

## Next Steps

1. Read `CURRENT_STATE.md`
2. Read `NEXT_PHASES.md`
3. Pick a good first issue
4. Join the team!

Happy snapping!
