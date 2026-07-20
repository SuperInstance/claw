# Claw Onboarding Package

## 🚀 Overview
This package serves as the primary onboarding material for developers and agents working on the **Claw Engine** repository. The goal of this repository is to provide a high-performance, minimal, and scalable cellular agent engine.

**Current Mission:** Transition from the monolithic `OpenCLAW` architecture to a streamlined, Rust-powered modular engine.

---

## 🛠 Architecture: The Minimal Claw Engine

The new Claw architecture is designed around three core pillars: **Cellular Locality**, **Modular Equipment**, and **Seed-Driven Learning**.

### 1. Cellular Locality
Each instance of a Claw (an agent) is designed to live within a single "cell" (e.g., a spreadsheet cell, a sensor node, or a domain-specific container). 
- **Independence:** Agents should ideally operate without heavy global state dependencies.
- **Scalability:** Optimization targets `<10ms` agent creation and `<100ms` trigger response.

### 2. Modular Equipment System
Claws do not carry all their tools at once. They "equip" and "unequip" modules (Equipment) based on their current state or triggers.

| Slot | Purpose | Example Module |
| :--- | :--- | :--- |
| **MEMORY** | State persistence | `HierarchicalMemory` |
| **REASONING**| Decision making | `EscalationEngine` |
| **CONSENSUS**| Multi-claw agreement | `TripartiteConsensus` |
| **INTERFACE** | External communication| `TileInterface` (Spreadsheet), `WebSocket` |
| **DISTILLATION**| Model efficiency | `Quantizer` |

### 3. Seed-Driven Learning
Instead of hard-coding behaviors, we define **Seeds**.
- **Seed:** A natural language description of an intended behavior.
- **Training:** A process where the Seed is optimized against specific trigger data.
- **Result:** A specialized, stabilized agent loop.

---

## 🗺 Conversion Roadmap (The "Decoupling" Plan)

The transition follows a phased approach to ensure stability while aggressively reducing bloat.

### Phase 1: Core Cleanup (Current)
- [ ] **Identify Bloat:** Categorize existing OpenCLAW code into "Core Engine" vs "Application Wrappers".
- [ ] **Schema Lockdown:** Finalize all JSON schemas for Claw, Bot, and Seed.
- [ ] **Dependency Audit:** Identify and prepare to strip out non-core dependencies (e.g., unnecessary UI wrappers, mobile-specific code that doesn't belong in the engine core).

### Phase 2: Rust Implementation (Next)
- [ ] **Core Logic Port:** Port the essential agent loop and state management to Rust.
- [ ] **Schema Integration:** Implement native Rust validation for the finalized schemas.
- [ ] **Performance Benchmarking:** Establish baseline latency for agent lifecycle events.

### Phase 3: Modularization & Extensions
- [ ] **Equipment API:** Build the interface for dynamic module loading/unloading.
- [ ] **Extension Repository:** Move all non-core features (LLM integrations, specialized tools) to the `claw-extensions/` repository.

---

## 📋 Developer Checklist

### Before you write code:
1. **Validate against Schemas:** Ensure all new data structures comply with `claw/schemas/`.
2. **Check the "Minimal" Rule:** Ask, *"Does this logic belong in the engine, or should it be an extension?"* If it's not required for the lifecycle of a single cellular agent, it's an extension.
3. **Provenance Check:** Ensure every operation tracks its origin to support the Trace Protocol.

### Testing Requirements:
- **Unit Tests:** 90%+ coverage for all new core logic.
- **Integration Tests:** Verify that unequipped "Muscle Memory" triggers still function correctly.
- **Performance:** Any change to the core loop must be benchmarked against the `<10ms` creation target.

---

## 🔗 Key References
- **Main Repo:** `claw/`
- **Schemas:** `claw/schemas/`
- **Integration Patterns:** [Link to Spreadsheet-Moment Integration Guide (TBD)]
- **Theory:** [Link to SuperInstance-papers (TBD)]

---
*Last Updated: 2026-03-15*
