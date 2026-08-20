# Constraint Theory — Current State

**Last Updated:** 2026-08-20
**Repo Path:** `polln/constrainttheory`
**Status:** Active research / modular split in progress

## Overview

Constraint Theory is a deterministic geometric computation system that replaces stochastic matrix multiplication with geometric logic based on Pythagorean manifolds, Φ-folding, and Ω-transform.

The repository has been split into focused components for better organization. The root README notes the split into:
- **constraint-theory-core** — Rust library, main crate
- **constraint-theory-python** — Python bindings via PyO3
- **constraint-theory-web** — Interactive demos & visualizations
- **constraint-theory-research** — Mathematical foundations & papers

## Repository Structure

```
constrainttheory/
├── CHARTER.md
├── CONTRIBUTING.md
├── DEPLOY_INSTRUCTIONS.md
├── DOCKSIDE-EXAM.md
├── LICENSE
├── README.md
├── crates/
│   ├── constraint-theory-core/   # Rust core
│   └── gpu-simulation/           # GPU experiments
├── docs/                         # Extensive documentation
├── research/
├── scripts/
├── tests/
└── web/
```

## Core Crate: constraint-theory-core v0.1.0

**Version:** 0.1.0  — 2026-03-27  
**Edition:** 2021, Rust 1.75+  
**License:** MIT

### Features Implemented

- **Pythagorean Manifold** — Discrete lattice of exact rational coordinates on unit circle
- **KD-tree Indexing** — O(log n) nearest-neighbor lookup via balanced KD-tree
- **SIMD Batch Processing** — AVX2-accelerated batch snapping, 8-way parallelism
- **Ricci Flow** — Curvature evolution for geometric analysis
- **Rigidity Percolation** — Laman's theorem for structural rigidity analysis
- **Sheaf Cohomology** — Topological invariant computation
- **Holonomy Transport** — Gauge connection parallel transport
- **Zero Dependencies** — Pure Rust, no runtime dependencies

### Performance Targets & Actuals

- Single snap: ~100 ns (KD-tree lookup)
- Batch snap: ~74 ns/op (SIMD)
- Manifold build: ~50 μs (200 density, ~1000 states)
- Package size: 22 KB compressed

### Code Quality

- 82 tests (68 unit + 14 doc tests), all passing
- Zero clippy warnings
- All public APIs documented, `#![deny(missing_docs)]` enforced
- `cargo fmt` compliant

### Known Limitations

- 2D only (Pythagorean triples on unit circle)
- ~1000 states at default density
- No empirical ML validation yet
- Research-grade, not production-battle-tested

### Modules

- `manifold` — PythagoreanManifold, snap, PythagoreanTriple
- `kdtree` — Spatial indexing
- `simd` — SIMD batch processing
- `curvature` — Ricci flow
- `percolation` — Rigidity percolation
- `cohomology` — Sheaf cohomology
- `gauge` — Holonomy transport
- `tile` — ConstraintBlock, Origin, Tile

## Documentation

Extensive docs under `docs/`:
- `CONSTRAINTTHEORY_RESEARCH.md` — Research & architecture recommendation
- `CONSTRAINTTHEORY_IMPLEMENTATION_GUIDE.md`
- `ARCHITECTURE.md`, `API_REFERENCE.md`, `BENCHMARKS.md`
- Academic drafts, API contracts, security architecture

## Current Git State

- Located under `polln/constrainttheory` in the `claw` repository
- Not yet tracked as a standalone repo in this working copy
- Merge conflict resolved on 2026-08-20
- Ready for documentation push

## Risks & Gaps

- Repository split announced but not fully materialized in this working tree
- Unclear ownership of `constraint-theory-python` / `constraint-theory-web` repos
- 2D limitation blocks higher-dimensional use cases
- No CI/CD configured for this subtree
- Missing onboarding docs for new contributors

## Dependencies

- `approx = "0.5"`
- Dev: `rand = "0.8"`

Build flags:
- `simd` feature for AVX2/NEON batch paths
- Release profile: opt-level 3, lto fat, codegen-units 1, panic abort
