# Constraint Theory — Next Phases

**Last Updated:** 2026-08-20
**Status:** Planning & execution roadmap

## Vision

Advance Constraint Theory from research prototype to production-ready geometric computation platform with multi-dimensional manifolds, ML validation, GPU acceleration, and seamless spreadsheet integration.

## Phase Overview

| Phase | Focus | Timeline | Deliverables |
|-------|-------|----------|--------------|
| Phase 1 | Core stabilization & docs | 0-4 weeks | CURRENT_STATE, ONBOARDING, CI |
| Phase 2 | 3D & n-dimensional manifolds | 4-10 weeks | 3D Pythagorean manifold, SE(3) equivariance |
| Phase 3 | ML validation & empirical testing | 10-16 weeks | Validation framework, benchmarks |
| Phase 4 | GPU & performance | 16-24 weeks | CUDA/OpenCL backends, SIMD enhancements |
| Phase 5 | Python bindings & web UI | 24-32 weeks | PyO3 bindings, interactive demos |
| Phase 6 | Spreadsheet integration | 32-40 weeks | Claw integration, spreadsheet-moment API |

## Phase 1: Core Stabilization & Documentation — Now

**Goal:** Make the current codebase usable and understandable.

### Tasks
- [x] Create CURRENT_STATE.md, NEXT_PHASES.md, ONBOARDING.md
- [ ] Set up CI/CD for `constraint-theory-core`
  - `cargo test --release` on PRs
  - `cargo clippy -- -D warnings`
  - `cargo fmt --check`
- [ ] Add `.github/workflows/ci.yml` for Rust
- [ ] Publish crate to crates.io `0.1.1`
- [ ] Create CHANGELOG with proper versioning
- [ ] Add `README.md` improvements with quick start examples
- [ ] Fix repository split: create separate repos for python/web/research or clarify monorepo structure
- [ ] Resolve git submodule / tracking for `polln/constrainttheory`

### Success Criteria
- New contributor can clone, `cargo build`, run tests in <5 min
- CI green on main
- Docs complete and reviewed

## Phase 2: Multi-Dimensional Manifolds

**Goal:** Extend beyond 2D.

### Tasks
- Design n-dimensional Pythagorean lattice generation
- Implement 3D Pythagorean manifold with unit sphere
- Add SE(3) equivariant operations
- Extend KD-tree to 3D/ND with VP-tree fallback
- Update `snap_batch_simd` for ND vectors
- Add property tests for dimensionality invariance

### Research Questions
- How to generate Pythagorean triples in 3D? Integer solutions to a²+b²+c² = d²
- Memory scaling: 1000 states → 1M states in 3D?
- Could we use spherical harmonics for indexing?

### Success Criteria
- `PythagoreanManifold::new(dim, density)` works for dim 2-4
- Benchmarks show <1μs snap for 3D
- Tests pass for SE(3) invariance

## Phase 3: ML Validation & Empirical Testing

**Goal:** Validate geometric operations with machine learning.

### Tasks
- Build validation harness comparing snap accuracy to ML baselines
- Add integration tests with `constraint-theory-python`
- Create benchmark suite using `criterion`
- Empirical study: noise distribution, convergence
- Add confidence cascade metrics

### Deliverables
- `tests/validation/` suite
- Performance regression tracking
- Paper draft: "Empirical Validation of Constraint Theory"

## Phase 4: GPU & Performance

**Goal:** Scale to large workloads.

### Tasks
- Implement GPU simulation crate `gpu-simulation` with CUDA/OpenCL
- Add compute-shader backend for batch snapping
- Explore JAX/Numba integration for Python path
- Optimize hot paths with `iai` benchmarks
- Memory-zero allocation paths

### Deliverables
- GPU-accelerated `snap_batch_simd_gpu`
- Benchmark report: CPU vs GPU speedup
- Profiling guide

## Phase 5: Python Bindings & Web

**Goal:** Make it accessible.

### Tasks
- Create `constraint-theory-python` repo with PyO3 bindings
- Expose `PythagoreanManifold`, `snap`, `ricci_flow_step`
- Build `constraint-theory-web` interactive demos
- Ship visualization for manifold exploration
- Add Jupyter notebook examples

### Deliverables
- `pip install constraint-theory`
- Web demo at `constraint-theory.superinstance.ai`

## Phase 6: Spreadsheet Integration

**Goal:** Integrate with SuperInstance ecosystem.

### Tasks
- Define API contract with `claw/` cellular agents
- Integrate with `spreadsheet-moment/` UI
- Build `CLAW()` function wrapper for Constraint Theory operations
- Add real-time monitoring of geometric state
- Security review for spreadsheet execution

### Deliverables
- `CONSTRAINTTHEORY_API.md`
- Integration guide for SuperInstance developers

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Repository split ambiguity | Clarify monorepo vs multi-repo strategy in Phase 1 |
| 2D limitation blocks users | Prioritize Phase 2 to 3D |
| Performance regression | CI benchmarks with `criterion` |
| Lack of contributors | Complete ONBOARDING.md and good first issues |
| ML validation gaps | Partner with research team, publish validation paper |

## Metrics

- **Quality:** 100% doc coverage, zero clippy warnings, test coverage >80%
- **Performance:** <100ns single snap, <50ns/op batch
- **Adoption:** 10 external contributors, 100 crates.io downloads/mo
- **Research:** 1 peer-reviewed paper submitted

## Next Immediate Actions

1. Commit and push CURRENT_STATE.md, NEXT_PHASES.md, ONBOARDING.md
2. Create GitHub Issues for Phase 1 tasks
3. Set up CI workflow for Rust core
4. Schedule review with Casey / SuperInstance team

## Dependencies

- SuperInstance papers repo for mathematical references
- Claw repo for integration points
- Spreadsheet-moment for UI integration
