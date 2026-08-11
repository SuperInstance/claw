# CudaClaw MVP Engineering Plan

This document provides a detailed, step‑by‑step plan for the engineering team to build and ship the CudaClaw MVP. It assumes we have 2 weeks (10 working days) to go from the current codebase to a released crate with a working example.

## 1. Overview and Goals

**MVP Objective:**  
Deliver a minimal Rust crate that allows developers to run 10,000+ deterministic agents on a CUDA GPU, demonstrated by a simple boids‑like example.

**Success Criteria:**
- A single `Engine` struct with `new()` and `step()` methods.
- A persistent kernel that loops and updates agent states.
- CRDT merge logic that ensures deterministic updates.
- Example `boids` that prints frames per second.
- Documentation: README, architecture, theory explainer.
- Published on crates.io (optional but recommended).

**Non‑goals (for MVP):**
- Dynamic agent addition/removal.
- Command queue / dispatcher.
- Health monitoring.
- Multiple kernel types.
- Visualization (will be separate project).

## 2. Timeline (2 Weeks)

| Day | Focus |
|-----|-------|
| 1–2 | Repository cleanup and initial code stripping |
| 3–4 | Simplify persistent kernel and CRDT merge |
| 5–6 | Implement minimal host API and boids example |
| 7   | Testing on multiple GPUs, fix alignment issues |
| 8   | Write documentation (README, ARCHITECTURE, THEORY) |
| 9   | Final polish, performance sanity check |
| 10  | Release (crates.io) and announcement prep |

## 3. Detailed Task Breakdown

### Week 1: Core Engine Simplification

#### Day 1–2: Repository Cleanup
- Create a branch `mvp` from current `main`.
- Delete the following directories/files (move to a backup folder if unsure):
  - `web/`
  - `docs/` (keep only a placeholder for new docs)
  - `tests/` (keep only `alignment_test.rs` and maybe one integration test)
  - `crates/` (if any; we'll keep everything in root `src/`)
  - `POLICY_*.toml`, `SOUL.md`, any persona files
  - `src/dispatcher.rs`, `src/monitor.rs`, `src/lock_free_queue.rs`
  - `kernels/` except `persistent_kernel.cu` and `smartcrdt.cuh`
  - `examples/` (we'll rewrite the boids example from scratch)
- Rename `src/cuda_claw.rs` to `src/engine.rs` (or keep as is).
- Update `Cargo.toml`: remove unnecessary dependencies, keep `cust`, `tokio` (if needed), `serde`? Probably not. We'll aim for minimal deps.

**Checklist:**
- [ ] Code compiles after deletions (may require commenting out some parts).
- [ ] Only essential files remain.

#### Day 3–4: Simplify Persistent Kernel
- Edit `kernels/persistent_kernel.cu`:
  - Remove all command‑queue polling logic.
  - Kernel should have an infinite loop that:
    - Computes global thread index.
    - Determines which agent this thread handles.
    - For that agent, reads its state and a few neighbors (hardcoded neighbor list or simple grid).
    - Calls `smartcrdt_merge` with neighbor states.
    - Writes back.
  - Use warp‑level primitives only where they provide clear benefit; comment heavily.
- Strip `kernels/smartcrdt.cuh`:
  - Keep only the core merge function (e.g., `merge_agent_states`).
  - Remove version vectors, history logs, etc. if they exist.
  - Ensure merge is deterministic and commutative.
- Update `kernels/shared_types.h` to match the minimal `AgentState` struct.

**Checklist:**
- [ ] Kernel compiles with `nvcc`.
- [ ] Merge function is isolated and simple.

#### Day 5–6: Host API and Boids Example
- Rewrite `src/engine.rs` (or `cuda_claw.rs`):
  - `Engine::new(num_agents: usize)`: allocate Unified Memory for agent array, load PTX, launch persistent kernel with one thread per agent.
  - `step(&mut self)`: call `cudaDeviceSynchronize()` to wait for kernel (or use events). For MVP, we can just launch the kernel each step? But persistent kernel is already running. Actually, with persistent kernel we don't need to launch each step; we need a way to signal the kernel to advance. Simpler: make the kernel run continuously and use a "frame" counter in constant memory. Host writes a new frame number, kernel checks it and runs one iteration. That avoids relaunch overhead.
    - Alternative: just have the kernel loop forever with a `if (should_run) { do_work(); }` and host sets `should_run` via pinned memory. But for simplicity, we can relaunch the kernel each step (though that adds overhead). For MVP, relaunching is acceptable.
  - Provide `agent_states()` to return a slice of current states (for visualization later).
- Write `examples/boids.rs`:
  - Initialize engine with 10,000 agents.
  - Randomize initial positions/velocities.
  - Loop 1000 steps, printing FPS every 100 steps.
  - (Optional) write frames to a file for later viewing.

**Checklist:**
- [ ] Engine builds and runs boids example.
- [ ] FPS is reported (target: >30 fps on a decent GPU).

### Week 2: Polish and Release

#### Day 7: Testing Across GPUs
- Test on at least two different GPU architectures (e.g., RTX 30xx, GTX 10xx, or a data center card).
- Ensure alignment tests pass (`cargo test alignment_test`).
- Check for any CUDA errors or memory leaks.

#### Day 8: Documentation
- Write `README.md` (as drafted earlier).
- Write `ARCHITECTURE.md` with the simplified diagram and component descriptions.
- Write `THEORY.md` (short explainer with diagrams).
- Update `CONTRIBUTING.md` for the new codebase.

#### Day 9: Final Polish
- Run `cargo fmt` and `cargo clippy`.
- Ensure the example runs without warnings.
- Check crate metadata (license, description, keywords).
- Possibly add a simple CI (GitHub Actions) to build on ubuntu-latest.

#### Day 10: Release
- `cargo publish --dry-run`
- Fix any issues.
- `cargo publish`
- Prepare a short announcement (Twitter, HN, Reddit) with a screen recording of the boids example.

## 4. Code Structure After Cleanup

```
cudaclaw/
├── src/
│   ├── lib.rs               # exports Engine, AgentState
│   ├── engine.rs            # Engine struct and impl
│   ├── alignment.rs         # compile-time alignment checks
│   └── cuda_bridge.rs       # low-level CUDA wrappers (maybe merged into engine)
├── kernels/
│   ├── persistent_kernel.cu
│   ├── smartcrdt.cuh
│   └── shared_types.h
├── examples/
│   └── boids.rs
├── tests/
│   └── alignment_test.rs
├── docs/
│   ├── ARCHITECTURE.md
│   └── THEORY.md
├── Cargo.toml
├── build.rs                 # compiles kernels to PTX
└── README.md
```

## 5. Key Implementation Details

### Persistent Kernel (Simplified)

```cuda
// persistent_kernel.cu
#include "shared_types.h"
#include "smartcrdt.cuh"

__global__ void persistent_kernel(AgentState* agents, int num_agents, volatile int* running) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= num_agents) return;

    while (*running) {
        // For this agent, gather neighbor indices (simplified: use grid or precomputed)
        int neighbors[8]; // example
        int num_neighbors = get_neighbors(idx, agents, num_agents, neighbors);

        AgentState my_state = agents[idx];
        for (int i = 0; i < num_neighbors; i++) {
            AgentState neighbor = agents[neighbors[i]];
            my_state = crdt_merge(my_state, neighbor);
        }
        agents[idx] = my_state;

        __syncthreads(); // ensure all threads in block have written before next iteration
        // Optionally wait for a frame counter increment from host
    }
}
```

But `__syncthreads()` in a while loop is problematic because it will deadlock if some threads exit early. Better to have each thread run independently and use a "tick" counter in global memory that the host increments. The kernel reads the tick, processes one iteration, then waits for tick to change. That's more advanced. For MVP, we can simply relaunch the kernel each frame:

```rust
// In host:
for _ in 0..frames {
    persistent_kernel<<<blocks, threads>>>(agents, num_agents);
    cudaDeviceSynchronize();
}
```

This is simpler and still demonstrates the idea. Launch overhead is acceptable for 1000 frames. We'll adopt that.

### CRDT Merge Function

```cuda
// smartcrdt.cuh
__device__ AgentState crdt_merge(AgentState a, AgentState b) {
    // Deterministic merge: e.g., average positions with Lamport timestamps
    // For boids, we might combine velocities, etc.
    // The exact logic depends on your CRDT design.
    // Ensure it's commutative and associative.
    AgentState result;
    result.pos_x = (a.pos_x + b.pos_x) / 2; // simplified; not a real CRDT
    // ... other fields
    return result;
}
```

**Important:** The merge must be deterministic and not depend on thread order. Use simple arithmetic or bitwise operations.

### Agent State

```rust
#[repr(C)]
#[derive(Clone, Copy)]
pub struct AgentState {
    pub pos_x: u16,   // 12-bit fixed-point or dodecet
    pub pos_y: u16,
    pub pos_z: u16,
    pub vel_x: i16,
    pub vel_y: i16,
    pub vel_z: i16,
    // maybe add a small timestamp or other fields
}

// Ensure total size is multiple of 4 bytes for alignment.
static_assert_size!(AgentState, 16); // example
```

In CUDA, the same struct must be defined in `shared_types.h` with matching layout.

### Host API (engine.rs)

```rust
pub struct Engine {
    agents: DevicePointer<AgentState>,
    num_agents: usize,
    // other CUDA state
}

impl Engine {
    pub fn new(num_agents: usize) -> Result<Self, CudaError> {
        // Initialize CUDA
        // Allocate Unified Memory for agents
        // Load PTX and get function
        Ok(Engine { ... })
    }

    pub fn step(&mut self) {
        // Launch kernel with appropriate grid/block size
        unsafe { launch_kernel(...); }
        cudaDeviceSynchronize().unwrap();
    }

    pub fn agents(&self) -> &[AgentState] {
        // Return slice of agent states from Unified Memory
        unsafe { slice::from_raw_parts(self.agents as *const AgentState, self.num_agents) }
    }
}
```

### Boids Example

The example should initialize agents with random positions and velocities, then in each step:

- Compute new velocities based on boid rules (cohesion, alignment, separation). This can be done in the kernel as part of the CRDT merge (neighbors influence each other).
- Update positions.

Because we are not using a persistent loop, the kernel will run once per frame, reading the current state and writing the next state. This is straightforward.

## 6. Testing and Validation

- **Alignment test:** Ensure Rust and CUDA structs match.
- **Smoke test:** Run boids for a few frames and verify that agent positions change (no crash).
- **Determinism test:** Run the same simulation twice with same seed; positions should be identical. (Optional for MVP but good to have.)
- **Performance:** Measure FPS; if below 30 on a mid-range GPU, consider optimizing.

## 7. Potential Pitfalls and Solutions

| Pitfall | Solution |
|---------|----------|
| CUDA errors on launch | Check that the GPU is available and CUDA toolkit is installed. Provide clear error messages. |
| Memory alignment mismatch | Use `static_assert` in Rust (`std::mem::offset_of!` or `assert_eq_size!` from `static_assertions` crate). In CUDA, use `static_assert(sizeof(AgentState) == expected)`. |
| Kernel launch timeout (on Windows/TDR) | Keep kernel short; our per‑frame kernel should be fine. If persistent kernel with infinite loop, may trigger TDR; but we are relaunching each frame, so okay. |
| Performance too low | Profile with `nvprof`. Optimize memory access patterns (coalescing), reduce thread divergence. |
| Users without CUDA | We target CUDA users for MVP; later consider CPU fallback or WebGPU. |

## 8. Next Steps (After MVP)

Once CudaClaw MVP is out, the team will shift focus to **ClawCanvas** – the visualization tool. ClawCanvas will:

- Be a React + TypeScript app that connects to a running CudaClaw instance via WebSocket.
- Render agent positions in real time using WebGL.
- Provide a live demo on the website.
- Possibly packaged as a desktop app with Tauri.

A separate plan will be created for ClawCanvas. For now, all hands are on CudaClaw.

## 9. Resources for the Team

- **CUDA Programming Guide**: https://docs.nvidia.com/cuda/cuda-c-programming-guide/
- **cust crate docs**: https://docs.rs/cust/latest/cust/
- **CRDTs explained**: https://crdt.tech/
- **Boids algorithm**: https://en.wikipedia.org/wiki/Boids

---

**Let's ship.**

# CudaClaw MVP Implementation Guide

This guide provides a detailed, step‑by‑step plan for your engineering team to build and ship the CudaClaw MVP. It covers everything from code cleanup to testing and release.

---

## 1. Overview

The MVP will consist of:
- A **Rust crate** with a minimal API to create an engine, allocate agents, and run simulation steps.
- A **single persistent CUDA kernel** that loops over agents and applies a CRDT merge based on simple neighbor rules.
- One **example** (boids) demonstrating 10,000 agents with deterministic flocking.

**Timeline:** 2 weeks (10 working days).

---

## 2. Team Roles (Suggested)

| Role | Responsibilities |
|------|------------------|
| **CUDA Lead** | Refactor kernels, implement persistent loop and CRDT merge. |
| **Rust Lead** | Simplify host code, create `Engine` API, integrate with `cust`. |
| **Integration Engineer** | Ensure build system works, write alignment tests, handle errors. |
| **Example Developer** | Implement boids example using the engine. |
| **Documentation Lead** | Write new README, architecture doc, theory explainer. |

All roles collaborate on code reviews and testing.

---

## 3. Preparation: Repository Cleanup

1. **Create an `mvp` branch** from the current `main` in the `cudaclaw` repo.
2. **Delete** all files and directories not needed for the MVP (see the [Transition Guide](TRANSITION_GUIDE.md) for the full list). Keep only:
   - `src/` (will be heavily pruned)
   - `kernels/` (will be pruned)
   - `build.rs`
   - `Cargo.toml`
   - `examples/` (create fresh)
   - `README.md` (replace)
   - `docs/` (create fresh)
3. **Remove** all dependencies from `Cargo.toml` except `cust`, `tokio` (optional), and `anyhow` (for errors). Also add `rand` for example if needed.

---

## 4. Defining the Agent State

The agent state must be compact and `#[repr(C)]` for CUDA compatibility. Start with a minimal version for boids.

**File:** `src/agent.rs`
```rust
use cust::memory::*;
use serde::{Serialize, Deserialize}; // optional, for debugging

#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Agent {
    pub pos_x: f32,
    pub pos_y: f32,
    pub pos_z: f32,
    pub vel_x: f32,
    pub vel_y: f32,
    pub vel_z: f32,
}

// Ensure size is known and alignment is correct
const _: () = assert!(std::mem::size_of::<Agent>() == 24);
```

*Note:* For even more compact storage, you could use 16‑bit floats or dodecets, but keep it simple for MVP. Use `f32` for clarity.

**Alignment check:** In `src/lib.rs` or a build script, add:
```rust
#[test]
fn test_agent_alignment() {
    assert_eq!(std::mem::align_of::<Agent>(), 4);
    // also verify with CUDA: we'll do that later via a small kernel.
}
```

---

## 5. CRDT Merge Function (Simplified)

For boids, the “merge” can be a weighted average of positions and velocities based on neighbors. This is not a true CRDT but suffices for the demo. Later you can replace with a proper RGA merge.

**File:** `kernels/smartcrdt.cuh`
```cuda
#ifndef SMARTCRDT_CUH
#define SMARTCRDT_CUH

struct Agent {
    float pos_x, pos_y, pos_z;
    float vel_x, vel_y, vel_z;
};

// Merge two agent states (this is a placeholder for actual CRDT logic)
// For boids, we compute a weighted average.
__device__ void merge_agents(const Agent& a, const Agent& b, float weight, Agent& result) {
    result.pos_x = a.pos_x * (1.0f - weight) + b.pos_x * weight;
    result.pos_y = a.pos_y * (1.0f - weight) + b.pos_y * weight;
    result.pos_z = a.pos_z * (1.0f - weight) + b.pos_z * weight;
    result.vel_x = a.vel_x * (1.0f - weight) + b.vel_x * weight;
    result.vel_y = a.vel_y * (1.0f - weight) + b.vel_y * weight;
    result.vel_z = a.vel_z * (1.0f - weight) + b.vel_z * weight;
}

#endif
```

*For later:* Replace with RGA merge from your original `smartcrdt.cuh` after simplifying it.

---

## 6. Persistent Kernel

**File:** `kernels/persistent_kernel.cu`
```cuda
#include "smartcrdt.cuh"

extern "C" __global__ void persistent_kernel(Agent* agents, int num_agents, int* running) {
    // Each thread handles one agent
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= num_agents) return;

    // Persistent loop: runs until running flag is set to 0
    while (atomicAdd(running, 0) != 0) {  // check if running flag is still 1
        Agent my_state = agents[idx];

        // Find neighbors (simplified: just use a fixed set of agents for demo)
        // In a real implementation, you'd use spatial hashing.
        // For boids, we might just look at agents with indices near idx.
        // We'll keep it simple: gather a few neighbors in a warp-cooperative way.

        // For now, we'll just compute a simple rule: move towards the center of all agents.
        // This is not efficient but shows the concept.

        // Shared memory for warp aggregation (optional)
        __shared__ float sum_x[256], sum_y[256], sum_z[256]; // one per block
        // ... (implement boids rules)

        // Write back updated state
        agents[idx] = my_state;

        // Synchronize to avoid race conditions (if using shared memory)
        __syncthreads();
    }
}
```

**Important:** The kernel must be launched with enough blocks to cover all agents. Use a grid of `(num_agents + block_size - 1) / block_size` blocks, with block size 256 (multiple of warp size).

**Build:** Ensure `build.rs` compiles this `.cu` file to PTX. Use `cust`'s `nvcc` compiler.

---

## 7. Host Engine (Rust)

**File:** `src/engine.rs`
```rust
use cust::prelude::*;
use cust::memory::*;
use crate::agent::Agent;

pub struct Engine {
    agents: DeviceBuffer<Agent>,
    kernel: Function,
    stream: Stream,
    num_agents: usize,
    running_flag: DeviceBuffer<i32>, // 1 = keep running
}

impl Engine {
    pub fn new(num_agents: usize) -> Result<Self, CustError> {
        // Initialize CUDA
        cust::init(CustFlags::empty())?;
        let device = Device(0)?;
        let ctx = Context::new(device)?;

        // Load the PTX module
        let ptx = include_str!(concat!(env!("OUT_DIR"), "/persistent_kernel.ptx"));
        let module = Module::from_ptx(ptx, &[])?;

        // Get kernel function
        let kernel = module.get_function("persistent_kernel")?;

        // Allocate agents on Unified Memory (use managed memory for simplicity)
        let agents = unsafe { DeviceBuffer::<Agent>::uninitialized(num_agents)? };
        // Initialize with random values (using host-side mapping)
        let mut host_agents = vec![Agent::default(); num_agents];
        // fill with random positions (use rand)
        agents.copy_from(&host_agents)?;

        // Create stream
        let stream = Stream::new(StreamFlags::NON_BLOCKING, None)?;

        // Allocate running flag (initialized to 1)
        let running_flag = unsafe { DeviceBuffer::<i32>::uninitialized(1)? };
        running_flag.copy_from(&[1])?;

        Ok(Engine {
            agents,
            kernel,
            stream,
            num_agents,
            running_flag,
        })
    }

    pub fn step(&self) -> Result<(), CustError> {
        // Launch kernel with 256 threads per block
        let block_size = 256;
        let grid_size = (self.num_agents + block_size - 1) / block_size;

        unsafe {
            self.kernel.launch(
                &LaunchConfig {
                    grid_dim: (grid_size as u32, 1, 1),
                    block_dim: (block_size as u32, 1, 1),
                    shared_mem_bytes: 0,
                    stream: self.stream,
                },
                &[
                    &self.agents.as_device_ptr(),
                    &(self.num_agents as i32),
                    &self.running_flag.as_device_ptr(),
                ],
            )?;
        }

        // Wait for kernel to finish (synchronize stream)
        self.stream.synchronize()?;
        Ok(())
    }

    pub fn stop(&self) -> Result<(), CustError> {
        // Set running flag to 0 to stop persistent kernel
        self.running_flag.copy_from(&[0])?;
        Ok(())
    }
}
```

**File:** `src/lib.rs`
```rust
pub mod agent;
pub mod engine;
pub use agent::Agent;
pub use engine::Engine;
```

---

## 8. Example: Boids

**File:** `examples/boids.rs`
```rust
use cudaclaw::{Engine, Agent};
use rand::prelude::*;
use std::time::Instant;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let num_agents = 10_000;
    let mut engine = Engine::new(num_agents)?;

    // Initialize agents on host (random positions)
    let mut rng = thread_rng();
    let mut agents = vec![Agent::default(); num_agents];
    for a in &mut agents {
        a.pos_x = rng.gen_range(0.0..100.0);
        a.pos_y = rng.gen_range(0.0..100.0);
        a.pos_z = rng.gen_range(0.0..100.0);
        a.vel_x = rng.gen_range(-1.0..1.0);
        a.vel_y = rng.gen_range(-1.0..1.0);
        a.vel_z = rng.gen_range(-1.0..1.0);
    }
    engine.upload_agents(&agents)?; // you'd need to add this method to Engine

    let mut frame_count = 0;
    let start = Instant::now();

    loop {
        engine.step()?;
        frame_count += 1;

        if frame_count % 100 == 0 {
            let elapsed = start.elapsed();
            let fps = frame_count as f64 / elapsed.as_secs_f64();
            println!("FPS: {:.2}", fps);
        }

        // Optionally download agents for visualization (slow, skip for now)
        // engine.download_agents(&mut agents)?;
    }
}
```

You'll need to add `upload_agents` and `download_agents` methods to `Engine` using `copy_from` and `copy_to`.

---

## 9. Build System

**File:** `build.rs`
```rust
use std::path::PathBuf;

fn main() {
    // Set output directory for PTX
    let out_dir = PathBuf::from(std::env::var("OUT_DIR").unwrap());

    // Compile CUDA kernel to PTX
    let cuda_files = ["kernels/persistent_kernel.cu"];
    let ptx_file = out_dir.join("persistent_kernel.ptx");

    // Invoke nvcc
    let mut cmd = std::process::Command::new("nvcc");
    cmd.args(&[
        "--ptx",
        "-o",
        ptx_file.to_str().unwrap(),
        "-I",
        "kernels",
    ]);
    for file in &cuda_files {
        cmd.arg(file);
    }

    let status = cmd.status().expect("failed to run nvcc");
    assert!(status.success(), "nvcc failed");

    // Tell Cargo to rerun if CUDA files change
    for file in &cuda_files {
        println!("cargo:rerun-if-changed={}", file);
    }
    println!("cargo:rerun-if-changed=kernels/smartcrdt.cuh");
}
```

**Cargo.toml** dependencies:
```toml
[dependencies]
cust = "0.3"
anyhow = "1.0"
rand = "0.8"  # for examples only (put under [dev-dependencies])
```

---

## 10. Testing and Validation

**Unit Tests:** Keep only alignment test.

**Integration Test:** A simple test that runs a few steps and ensures no crash.

**File:** `tests/basic.rs`
```rust
#[test]
fn test_engine_creation() {
    let engine = cudaclaw::Engine::new(100).unwrap();
    engine.step().unwrap();
    engine.stop().unwrap();
}
```

**Performance Benchmark:** Not required for MVP but can be added as an example.

---

## 11. Error Handling and Edge Cases

- **CUDA errors:** Use `?` to propagate; in examples, print and exit.
- **Out of memory:** `cust` will return error; handle gracefully.
- **Kernel launch failures:** Catch and report.
- **Running flag:** Ensure it’s properly initialized to 1 and set to 0 on drop.

**Add `Drop` impl for `Engine` to stop kernel automatically:**
```rust
impl Drop for Engine {
    fn drop(&mut self) {
        let _ = self.stop();
    }
}
```

---

## 12. Documentation (New)

Create the following docs:

- `README.md` – as drafted earlier.
- `docs/ARCHITECTURE.md` – as drafted.
- `docs/THEORY.md` – short explainer with diagrams.
- `docs/ROADMAP.md` – as drafted.
- `CONTRIBUTING.md` – as drafted.

Add doc comments to public API in Rust.

---

## 13. Release Process

1. **Merge** `mvp` branch to `main` after code review.
2. **Tag** with version `v0.1.0`.
3. **Publish** to crates.io:
   ```bash
   cargo publish
   ```
4. **Announce** on social media, Hacker News, Reddit (r/rust, r/cuda, r/programming). Include:
   - Link to repo
   - 30‑second demo video
   - One‑line: “10,000 deterministic agents on your GPU.”

---

## 14. Potential Pitfalls and Solutions

| Pitfall | Solution |
|---------|----------|
| **CUDA kernel doesn’t compile** | Check nvcc version, ensure PTX generation works. Use `cust`’s runtime compilation as fallback. |
| **Memory alignment issues** | Add `#[repr(C)]` and static asserts. Test with a small kernel that accesses fields. |
| **Kernel too slow** | Optimize by reducing memory accesses, using shared memory, and warp-level primitives. For MVP, just ensure it runs. |
| **Race conditions** | Use `__syncthreads()` where needed. For boids, we may need atomic operations for accumulation; consider using shared memory per block. |
| **Unified memory oversubscription** | Allocate only what’s needed. For 10k agents, 24 bytes each = 240KB, fine. |
| **Example too complex** | Start with a very simple rule (move towards origin) then build up to boids. |

---

## 15. Next Steps After MVP

Once the MVP is out, the team can pivot to **ClawCanvas** (the visualizer) and then iterate based on feedback. The roadmap document provides more detail.

---

This guide should give your team a clear path forward. If you need further elaboration on any section (e.g., detailed CUDA kernel implementation, boids rules, or error handling), let me know and I can provide additional specifics.

We'll dive deep into the **CudaClaw MVP implementation plan** with concrete tasks, technical details, and a roadmap for your engineering team. This is a hands‑on guide to get you from the current codebase to a shippable MVP.

---

## 🧱 MVP Scope Recap

The MVP is a **minimal demonstration** of CudaClaw’s core value:

- Run **10,000+ agents** on a GPU with deterministic updates.
- Agents use a **simple CRDT merge** (just position/velocity state).
- Provide a **single example** (e.g., flocking boids) that prints FPS.
- No command dispatcher, no monitoring, no multiple kernels.
- Code is clean, well‑commented, and easy to build.

---

## 📁 Final MVP Directory Structure

```
cudaclaw/
├── src/
│   ├── lib.rs               # Public API (Engine, AgentState)
│   ├── engine.rs             # Host-side engine (init, step)
│   ├── cuda.rs                # CUDA wrapper (load kernel, alloc)
│   └── alignment.rs           # #[repr(C)] structs and checks
├── kernels/
│   ├── persistent_kernel.cu   # Main kernel
│   ├── smartcrdt.cuh           # CRDT merge logic
│   └── warp_helpers.cuh        # Warp-level utilities (optional)
├── examples/
│   └── boids.rs                # Flocking simulation
├── build.rs                    # Compile .cu to PTX
├── Cargo.toml
├── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── THEORY.md
│   └── ROADMAP.md
└── tests/
    └── alignment_test.rs       # Only essential test
```

---

## 🔨 Step‑by‑Step Implementation Tasks

### Phase 0: Preparation (1 day)
- [ ] Create an `mvp` branch from current `main`.
- [ ] Agree on the final list of files to keep (as above). Delete everything else (but keep a backup if needed).
- [ ] Update `.gitignore` to exclude temporary files, PTX outputs, etc.

### Phase 1: Core Engine (`engine.rs`, `cuda.rs`, `lib.rs`) (3–4 days)

#### 1.1 Define the Agent State (`alignment.rs`)
- Create a minimal `AgentState` struct. For boids, we need at least position and velocity.
- Use fixed‑point or integer representation to avoid floating‑point ambiguity? The current design uses floats, but for determinism we might want exact rationals. However, for MVP, floats are okay if we accept small non‑determinism across runs? But the core claim is determinism. We can use integers for position (dodecet) and maybe store velocity as integers scaled by a factor. Let's decide: use `i16` for position and velocity, scaled by some factor (e.g., 0.001). Then CRDT merges are integer operations. This ensures bit‑exact determinism.

```rust
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct AgentState {
    pub pos_x: i16,
    pub pos_y: i16,
    pub pos_z: i16,
    pub vel_x: i16,
    pub vel_y: i16,
    pub vel_z: i16,
    // maybe padding for alignment (ensure size is multiple of 4)
}
```

- Add a simple alignment test that verifies size and offset using `std::mem` and `std::offset_of` (nightly) or a build script.

#### 1.2 CUDA Wrapper (`cuda.rs`)
- Write a minimal CUDA context manager that loads the PTX generated from `persistent_kernel.cu`.
- Use the `cust` crate for Rust CUDA bindings.
- Functions:
  - `init()` – initialize CUDA, load module.
  - `alloc_agents(n: usize) -> DevicePointer<AgentState>` – allocate Unified Memory.
  - `launch_kernel(stream, agents_ptr, n_agents, ...)` – launches persistent kernel with grid/block dimensions.
  - `sync()` – synchronize stream.

#### 1.3 Engine API (`engine.rs`, `lib.rs`)
- `Engine::new(num_agents: usize) -> Self`
  - Initializes CUDA, allocates agent array.
  - Initializes agents with random positions/velocities (on host, then copy to Unified Memory? Actually Unified Memory allows direct CPU access, so we can fill on host after allocation).
  - Launches persistent kernel in a separate non‑blocking stream.
- `Engine::step(&mut self)`
  - Currently, the kernel runs continuously. But to get FPS, we might want to run one iteration per step. However, a persistent kernel is meant to run forever; we can have it loop internally, and `step()` just synchronizes to ensure one frame is done. But if the kernel never exits, we can't synchronize easily. Alternative: launch the kernel for a fixed number of iterations per `step()` (non‑persistent). But then launch overhead becomes significant. For MVP, we can keep the persistent kernel and have it update a global iteration counter. Host can wait for that counter to increment. Simpler: just run the kernel for a fixed number of iterations per launch (i.e., non‑persistent) and measure performance. For demo, it's fine.

Let's decide: **Non‑persistent kernel** for simplicity. Each `step()` launches the kernel for one iteration. This allows easy benchmarking and avoids complexity. Launch overhead for 10k agents is negligible compared to computation. We'll use this.

So `step()` will:
  - Copy host data to device? No, Unified Memory – data is already accessible.
  - Launch kernel with `<<<grid, block>>>(d_agents, n_agents)`.
  - Synchronize.
  - (Optionally) read back some data for FPS calculation.

- `Engine::agents(&self) -> &[AgentState]` – returns a slice of the Unified Memory (mapped to host).

#### 1.4 Build Script (`build.rs`)
- Compile `kernels/persistent_kernel.cu` to PTX using `nvcc`. Output to `target/` and include via `include_bytes!` or let `cust` load from file.
- Keep it simple: run `nvcc` with appropriate flags (`-arch=sm_60` etc.).

### Phase 2: CUDA Kernel (`persistent_kernel.cu`) (3–4 days)

#### 2.1 Kernel Structure
- Each thread processes one agent: `int idx = blockIdx.x * blockDim.x + threadIdx.x; if (idx >= n_agents) return;`.
- For each agent, we need to determine its neighbors. In a simple boids simulation, we could use a naive O(n²) approach (each agent checks all others), but that doesn't scale. For 10k, O(n²) is 100M checks – too many. We need a spatial index. Options:
  - Uniform grid: assign agents to cells; each agent checks neighboring cells. This can be done on GPU efficiently.
  - For MVP, we can hardcode a simpler rule: each agent only interacts with a fixed set of neighbors (e.g., nearest in a 1D ring). That's not realistic but demonstrates CRDT merging.
  - Better: implement a simple uniform grid in shared memory. However, that adds complexity.

Given time constraints, we can start with a naive O(n²) but limit to a small number of agents (e.g., 1000) for the MVP. But the promise is 10k. We need a scalable solution.

Recommendation: Implement a **simple spatial hashing** in the kernel:
  - Divide space into cells (e.g., 32x32x32 grid).
  - Each agent computes its cell index.
  - Use an atomic counter to build a list of agents per cell (in global memory).
  - Then each agent iterates over agents in its own and neighboring cells.
  - This is a common GPU pattern; we can find reference implementations.

But this might be too much for MVP. Alternatively, we can just demonstrate that CRDT merging works without complex neighbor search: have each agent merge with a fixed set of randomly assigned neighbors. That still shows the core idea.

Let's choose a **compromise**: For the MVP, we'll have each agent interact with a fixed number of randomly selected neighbors (e.g., 5) stored in an array. This array is precomputed on CPU and copied to device. Then the kernel just does:

```
AgentState me = agents[idx];
for (int i = 0; i < 5; i++) {
    int neigh_idx = neighbor_indices[idx * 5 + i];
    AgentState other = agents[neigh_idx];
    me = crdt_merge(me, other);
}
agents[idx] = me;
```

This demonstrates the CRDT merge and is simple to implement. The neighbor list can be static (randomly generated once). That's enough for a tech demo.

#### 2.2 CRDT Merge (`smartcrdt.cuh`)
- Write a simple merge function that combines two agent states. For boids, we might average positions and velocities, but that's not a CRDT. A true CRDT merge should be commutative, associative, and idempotent. A simple approach: each agent stores a Lamport timestamp and a value. Merge takes the value with the highest timestamp. But that's not interesting for continuous motion.

We need to define a meaningful CRDT for agent state. Perhaps each agent has a "goal" position and a "current" position, and merging means moving toward the goal. Or we can use a **last-writer-wins** register for each field, but that's trivial.

Given the complexity, for MVP we can **simplify**: skip the CRDT part and just have agents update based on boids rules using atomic operations? But that loses determinism. We need to stay true to the unique value.

Maybe we can implement a **state‑based CRDT** where each agent maintains a vector clock and a value. Merge takes the union of causal history. This is overkill.

Alternatively, we can frame the boids rules as **constraint satisfaction** and use a simple averaging that is commutative? If we average positions, it's not idempotent (averaging again changes result). So not a CRDT.

We need to be honest: for a true deterministic swarm, the updates must be based on a CRDT. Let's design a minimal CRDT:

- Each agent has a position and a velocity.
- Each agent also has a **Lamport timestamp** (logical clock) that increments each time it updates.
- When two agents interact, they exchange states. The merge rule: take the state with the higher timestamp for each field? That's not meaningful because fields are interdependent.

A better approach: treat the entire agent state as a **last‑writer‑wins register** with a timestamp. Then merging simply picks the state with the highest timestamp. This ensures convergence but loses the cooperative behavior.

Given the time, I suggest we **postpone the full CRDT** for the MVP and instead focus on the GPU engine with deterministic updates via a simple rule that is deterministic by construction (e.g., each agent moves according to a fixed formula that depends only on its own state and its neighbors' states, using integer arithmetic). This still gives deterministic results across runs if the order of neighbor processing is deterministic (e.g., always process neighbors in increasing index order). That's not a CRDT but a deterministic algorithm. We can call it "deterministic agent coordination" without claiming CRDT.

For the MVP, that's acceptable. Later we can introduce true CRDTs.

So in `smartcrdt.cuh`, we'll have a function:

```c
__device__ AgentState boids_merge(AgentState a, AgentState b) {
    // Compute new velocity based on boids rules (cohesion, alignment, separation)
    // Use integer arithmetic.
    // Return new state.
}
```

This function will be called for each neighbor pair.

#### 2.3 Kernel Implementation Details
- Use `__syncthreads()` if needed (e.g., for shared memory).
- Ensure memory coalescing: agents array should be accessed with contiguous threads.
- Use `restrict` pointers to help compiler.

### Phase 3: Example (`boids.rs`) (2 days)
- Write a simple binary that creates an `Engine` with 10,000 agents.
- Initialize agents with random positions (using host-side RNG, writing to the Unified Memory slice).
- In a loop, call `engine.step()` and measure time.
- Print FPS every 100 steps.
- Optionally, write positions to a file for later visualization.

### Phase 4: Testing and Documentation (2 days)
- Write a basic alignment test (size and offset).
- Write a smoke test that runs a few steps and checks that agents moved (optional).
- Write the README, ARCHITECTURE, THEORY, and ROADMAP documents as previously outlined.
- Ensure `cargo test` passes.

### Phase 5: Polish and Publish (1 day)
- Run `cargo fmt` and `cargo clippy`.
- Test on a clean machine (maybe a GitHub Actions workflow with self‑hosted runner?).
- Publish to crates.io (requires API token).
- Create a GitHub release with the tag `v0.1.0`.
- Announce on social media.

---

## ⚙️ Technical Challenges and Mitigations

### 1. Neighbor Discovery
- For MVP we use precomputed neighbor lists to keep kernel simple.
- In the future, we can implement spatial hashing.

### 2. Memory Bandwidth
- Each agent reads and writes its state. With 10k agents and many neighbors, we could exceed memory bandwidth.
- Mitigation: Use shared memory to cache neighbor states for a warp. Each warp loads a block of agents into shared memory, then threads process neighbors from that cache.

### 3. Warp Divergence
- If agents have varying numbers of neighbors, threads in a warp may diverge.
- Mitigation: Ensure all threads in a warp process the same number of neighbors (pad neighbor lists).

### 4. Determinism
- Use integer arithmetic and fixed order of operations (e.g., always process neighbors in ascending index order).
- Avoid atomics (except maybe for building neighbor lists, which we skip).

### 5. Compilation
- `cust` requires PTX at compile time. Our `build.rs` must generate PTX and place it where `cust` can find it (e.g., in `$OUT_DIR`). We'll use `include_bytes!` to embed PTX in the binary.

---

## 🔌 Integration with ClawCanvas (Post‑MVP)

After the MVP, we'll build ClawCanvas. For that, we need a way to stream agent positions from CudaClaw to the visualizer. We can add a small WebSocket server in a separate binary or feature.

In the MVP, we'll just write positions to a file or print them. But if we want to prepare for integration, we can add a simple TCP socket that sends binary frames of agent positions. That can be a separate crate or an optional feature.

For now, focus on the engine.

---

## 📅 Timeline Estimate

| Phase | Days |
|-------|------|
| Phase 0: Prep | 1 |
| Phase 1: Core Engine | 4 |
| Phase 2: Kernel | 4 |
| Phase 3: Example | 2 |
| Phase 4: Testing/Docs | 2 |
| Phase 5: Polish/Publish | 1 |
| **Total** | **14 days** |

That's two weeks of focused work. Adjust based on team size.

---

## ✅ Final Checklist for Team

Before we call the MVP done:

- [ ] `cargo build --release` succeeds with no warnings.
- [ ] `cargo run --example boids --release` runs and prints FPS (should be >0).
- [ ] The kernel uses only integer arithmetic (no floats) for deterministic output.
- [ ] The README is clear and inviting.
- [ ] The ARCHITECTURE.md explains the design.
- [ ] The THEORY.md gives a short, visual explanation of the idea.
- [ ] The ROADMAP.md outlines future plans.
- [ ] All unnecessary files are removed from the repo.
- [ ] Code is formatted and linted.
- [ ] The repo is pushed to GitHub with a `v0.1.0` tag.

---

## 🚀 Next Steps After MVP

- Gather feedback from early users.
- Build ClawCanvas to visualize the agents.
- Optimize kernel performance.
- Add more examples.
- Write bindings for Python.
- Start work on AutoClaw (if there's demand).

---

This plan gives your team a clear path. If you need help with any specific part—like the kernel code or build script—just ask!