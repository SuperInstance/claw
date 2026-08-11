We'll design a **radically simplified MVP of CudaClaw** that you can build and ship in 1–2 weeks. This design extracts the core differentiator—GPU-accelerated deterministic coordination of geometric agents—and strips away all theoretical documentation, agent personas, and non-essential packages.

## 🎯 MVP Goal

**A single, runnable binary that demonstrates 10,000+ geometric agents coordinating deterministically on a GPU using SmartCRDTs and warp-level primitives.**

The user should be able to:

1. Install with `cargo install cudaclaw` (or build from source).
2. Run `cudaclaw example 10000` and see live stats (FPS, agent positions, conflicts resolved).
3. Optionally connect a visualizer (like the planned `cudaclaw-viz`) via a simple WebSocket.

---

## 📁 Repository Structure (Stripped Down)

```
cudaclaw/
├── Cargo.toml
├── build.rs
├── README.md
├── examples/
│   └── simple_grid.rs          # The single runnable example
├── src/
│   ├── main.rs                  # (optional) CLI entry point
│   ├── lib.rs                    # Core library
│   ├── cuda_claw.rs              # Host code: load kernel, launch, command queues
│   ├── bridge.rs                  # Rust ⇄ CUDA memory bridge (Unified Memory)
│   ├── lock_free_queue.rs         # SPSC queue for commands (ported from existing)
│   └── alignment.rs                # Ensure #[repr(C)] layouts match
├── kernels/
│   ├── persistent_kernel.cu       # The one persistent worker kernel
│   ├── smartcrdt.cuh               # RGA CRDT merge logic (warp‑aggregated)
│   ├── crdt_engine.cuh              # Warp‑level coordination helpers
│   └── shared_types.h               # struct definitions (mirrored in Rust)
└── docs/
    └── theory.md                    # One-page summary of geometric/CRDT concepts (from Constraint-Theory)
```

**Everything else** (all other crates, web folders, papers, policies, SOUL.md, etc.) is archived or deleted.

---

## 🦀 Core Components (Minimal)

### 1. Shared Types (`kernels/shared_types.h` and `src/bridge.rs`)

Define the geometric state of an agent (112 bits as in your original). Must be `#[repr(C)]` in Rust and exactly mirrored in CUDA.

```c
// shared_types.h
typedef struct {
    unsigned int position;      // 12 bits dodecet (packed into 32 bits)
    float orientation;           // 32 bits
    float holonomy[3][3];        // 36 bits (3x3 rotation matrix, could be packed)
    float confidence;            // 32 bits
} AgentState;  // total 14 bytes (112 bits) + possible padding – verify alignment
```

In Rust:

```rust
#[repr(C)]
#[derive(Clone, Copy)]
pub struct AgentState {
    pub position: u32,      // actually 12 bits used
    pub orientation: f32,
    pub holonomy: [[f32; 3]; 3],
    pub confidence: f32,
}
```

### 2. Lock‑Free Queue (`src/lock_free_queue.rs`)

Port your existing lock‑free SPSC queue for commands (e.g., “add agent”, “remove agent”, “update constraint”). Keep only the bare minimum needed for the example.

### 3. Host Code (`src/cuda_claw.rs`)

- Use `cust` to load the PTX generated from `persistent_kernel.cu`.
- Allocate Unified Memory for agent state and command queues.
- Launch the persistent kernel with a single CUDA stream.
- Provide a simple API: `step()`, `add_agent()`, `get_agent_states()`.

### 4. Persistent Kernel (`kernels/persistent_kernel.cu`)

- Single kernel that runs forever, processing commands from the lock‑free queue and updating agent states.
- Each warp handles a batch of agents (e.g., 32 agents per warp).
- Inside the warp, threads coordinate via `__shfl_sync`, `__ballot_sync`, and `__syncwarp`.
- The kernel periodically yields to avoid watchdog timeouts (e.g., `__threadfence_system();` or a small sleep).

```cuda
__global__ void persistent_kernel(
    AgentState* agents,
    Command* cmd_queue,
    volatile int* queue_head,
    volatile int* queue_tail,
    int max_agents)
{
    __shared__ int warp_cmd[32];  // one command per warp
    int warp_id = threadIdx.x / 32;
    int lane = threadIdx.x % 32;
    int global_warp_id = blockIdx.x * (blockDim.x / 32) + warp_id;

    while (true) {
        // 1. Check for commands (one per warp)
        if (lane == 0) {
            // atomically pop from queue
            warp_cmd[warp_id] = pop_command(queue_head, queue_tail);
        }
        __syncwarp();

        // 2. If command, all threads in warp execute it (e.g., add agent)
        int cmd = warp_cmd[warp_id];
        if (cmd != -1) {
            // handle command using warp aggregation
        }

        // 3. Process agents assigned to this warp
        int agent_base = global_warp_id * 32;
        for (int i = lane; i < 32; i += 32) {
            int agent_idx = agent_base + i;
            if (agent_idx < max_agents) {
                AgentState s = agents[agent_idx];
                // apply geometric rules / constraints
                // possibly exchange data with other threads in warp using shuffle
                agents[agent_idx] = s;
            }
        }

        // 4. Optional: periodic sync to allow host to see updates
        if (threadIdx.x == 0 && blockIdx.x == 0) {
            __threadfence_system();  // ensure visibility for Unified Memory
        }
        // small cooperative delay to avoid timeouts (could use clock())
    }
}
```

### 5. Example (`examples/simple_grid.rs`)

A self‑contained example that:

- Initializes 10,000 agents with random positions in a 2D grid.
- Each agent tries to claim a unique cell.
- Conflict resolution uses your CRDT merge (deterministic, last‑writer‑wins based on Lamport timestamp).
- Runs for 1000 steps and prints statistics: number of conflicts resolved, FPS, final grid occupancy.

The example should be a single file that links against the `cudaclaw` library and demonstrates the API.

---

## 📄 Stripped‑Down `README.md`

```markdown
# CudaClaw – GPU‑accelerated geometric agent coordination

CudaClaw is a minimal runtime for running **10,000+ lightweight agents** on a single GPU, with deterministic coordination using **SmartCRDTs** and warp‑level parallelism.

## Quick Start

### Prerequisites
- Rust (nightly) and Cargo
- CUDA Toolkit 11+ (with `nvcc` in PATH)
- An NVIDIA GPU (compute capability 6.0+)

### Build and Run the Example
```bash
git clone https://github.com/SuperInstance/cudaclaw
cd cudaclaw
cargo run --example simple_grid --release
```

You'll see live output:
```
Agents: 10000, Steps: 100, Conflicts resolved: 234, FPS: 1520
```

### What It Demonstrates
- 10,000 agents each trying to claim a unique cell in a 128×128 grid.
- Conflicts are resolved deterministically using a warp‑aggregated CRDT merge.
- All agent state fits in ~1.4 MB (112 bits per agent), processed entirely on the GPU.

## How It Works
- **Persistent kernel** runs forever, processing commands and updating agents.
- **Lock‑free queue** passes commands from CPU to GPU (add/remove agents).
- **Warp‑level primitives** (`__shfl_sync`, `__ballot_sync`) coordinate threads without global locks.
- **Unified Memory** enables zero‑copy access from both CPU and GPU.

## Next Steps
- Visualize the agents with [cudaclaw‑viz](https://github.com/SuperInstance/cudaclaw-viz) (coming soon).
- Use CudaClaw as a backend for your own multi‑agent simulations.

## License
MIT
```

---

## 🛠️ Build System (`Cargo.toml` & `build.rs`)

**Cargo.toml** (minimal dependencies):

```toml
[package]
name = "cudaclaw"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
cust = "0.3"
rand = "0.8"
byteorder = "1.4"

[build-dependencies]
cc = "1.0"

[features]
default = []
```

**build.rs** (compile CUDA kernel to PTX):

```rust
fn main() {
    println!("cargo:rerun-if-changed=kernels/");

    let out_dir = std::env::var("OUT_DIR").unwrap();
    cc::Build::new()
        .cuda(true)
        .flag("-arch=sm_70")  // adjust for your GPU
        .flag("-rdc=true")
        .flag("-lineinfo")
        .file("kernels/persistent_kernel.cu")
        .compile("libcudaclaw_kernels.a");

    // Also generate PTX for runtime loading
    std::process::Command::new("nvcc")
        .args(&[
            "-ptx",
            "kernels/persistent_kernel.cu",
            "-o",
            &format!("{}/persistent_kernel.ptx", out_dir),
        ])
        .status()
        .unwrap();
}
```

---

## 🧹 What to Delete/Archive

| Repository           | Action                                                                 |
|----------------------|------------------------------------------------------------------------|
| `Constraint-Theory`  | Archive; move key mathematical summary to `cudaclaw/docs/theory.md`    |
| `claw`               | Archive (it's a large personal assistant – not core to the GPU engine) |
| `dodecet-encoder`    | Archive; the encoding is now just a `u32` field in `AgentState`        |
| `SuperInstance-papers`| Archive; keep as a record of your research, but not part of MVP        |
| `autoclaw`           | Keep for later; but do not reference in `cudaclaw` MVP README          |
| `spreadsheet-moment` | Rename to `cudaclaw-viz` and strip down later; for now just archive    |
| `cudaclaw` (old)     | You will replace with this new stripped version – force push or new repo |

---

## 🚀 Launch Checklist

1. **Write the new code** – extract minimal versions of your lock‑free queue, CRDT merge, and persistent kernel.
2. **Test the example** – ensure it runs on a clean machine with only Rust and CUDA installed.
3. **Create a release binary** – `cargo build --release` and optionally package for `crates.io`.
4. **Write the README** – as above, short and clear.
5. **Record a demo video** – show the example running with `nvidia-smi` in another window to prove GPU usage.
6. **Announce** – on Twitter, Reddit r/rust, Hacker News, with a link to the repo and the demo video.

**One‑week sprint:** aim to have the code working by day 5, documentation and video by day 7.

---

This design gives you a **shippable MVP** that highlights your unique differentiator: massive scale deterministic coordination on GPU. Everything else can wait. Now go build and ship!