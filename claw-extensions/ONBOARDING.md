# ONBOARDING.md

## Welcome to Claw Extensions

**Get up and running with Claw Extensions in under 30 minutes**

---

## What is Claw Extensions?

Claw Extensions provides advanced, optional features for the Claw cellular agent engine. While `claw-core` provides a minimal MVP for basic agent functionality, Claw Extensions adds:

- **Equipment System** - Multi-slot equipment with hot-swapping
- **Social Coordination** - Multi-agent patterns and consensus
- **Seed Learning** - Training and model distillation
- **Bot Automation** - Loop-based automation without ML
- **WebSocket Server** - Real-time bidirectional communication
- **GPU Acceleration** - CUDA/WGPU support
- **Advanced Monitoring** - Metrics, health checks, telemetry

---

## Prerequisites

### Required
- **Rust 1.70+** - Install via `rustup`
- **Git** - For version control
- **Node.js 18+** - For TypeScript memory layer (optional)
- **Cargo** - Comes with Rust

### Recommended
- **VS Code** with Rust Analyzer extension
- **Docker** - For containerized testing
- **Claw Core** - Clone from upstream repo

### Verify Installation
```bash
rustc --version
cargo --version
git --version
node --version  # Optional
```

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/SuperInstance/claw.git
cd claw/polln  # Repo root
# claw-extensions is a subdirectory
cd claw-extensions
```

### 2. Check Out Main Branch

```bash
git checkout main
git status
```

**Note:** The repository may have merge conflicts. See [Troubleshooting](#troubleshooting).

### 3. Explore the Project

```bash
# See structure
find . -maxdepth 2 -type d | head -20

# Read overview
cat README.md

# Check Rust code
ls src/
ls extensions/
```

### 4. Build the Project

```bash
# Build core extensions
cargo build

# Build with all features
cargo build --all-features

# Run tests
cargo test
```

### 5. Explore Extensions

```bash
# Equipment system
ls extensions/equipment/

# Social coordination
ls extensions/social/

# Learning system
ls extensions/learning/
```

---

## Development Setup

### Local Development Environment

#### Option A: Full Rust + TypeScript

```bash
# Install Rust tools
rustup component add rustfmt clippy

# Install TypeScript tools (for memory layer)
npm install -g typescript ts-node

# Verify
cargo clippy -- --help
```

#### Option B: Docker

```bash
docker run --rm -v $(pwd):/workspace -w /workspace rust:latest bash -c "cargo build"
```

### IDE Setup

#### VS Code

1. Install extensions:
   - Rust Analyzer
   - CodeLLDB
   - ESLint (for TypeScript)

2. Create `.vscode/settings.json`:
```json
{
  "rust-analyzer.check.command": "clippy",
  "editor.formatOnSave": true,
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer"
  }
}
```

#### Configuration

The project uses:
- `Cargo.toml` for Rust dependencies
- `tsconfig.json` for TypeScript (memory layer)
- `.gitignore` for exclusions

---

## Understanding the Codebase

### Project Structure

```
claw-extensions/
├── Cargo.toml              # Rust workspace manifest
├── lib.rs                  # Crate root with public API
├── src/                    # Core Rust source
│   ├── lib.rs
│   └── equipment.rs
├── extensions/             # Extension modules (Rust)
│   ├── equipment/         # Multi-slot equipment
│   │   ├── mod.rs
│   │   ├── memory.rs
│   │   ├── reasoning.rs
│   │   └── ...
│   ├── social/           # Coordination patterns
│   ├── learning/         # Seed learning
│   ├── bot/              # Automation
│   ├── websocket/        # Real-time comms
│   ├── gpu/              # GPU acceleration
│   └── monitoring/       # Metrics
├── memory/               # TypeScript memory layer
│   ├── manager.ts
│   ├── embeddings.ts
│   └── ...
└── docs/                 # Documentation
```

### Key Files

- **`lib.rs`** - Public API, feature flags, CapabilityHandshake traits
- **`Cargo.toml`** - Dependencies, features
- **`extensions/*/mod.rs`** - Extension module entry points
- **`README.md`** - Project overview
- **`INTEGRATION_GUIDE.md`** - How to use with claw-core

### Architecture

```
claw-core (MVP)
    ↓ extends via
claw-extensions (Advanced)
    ↓ provides
Equipment, Social, Learning, Bot, WebSocket, GPU, Monitoring
```

---

## First Contribution

### Step 1: Pick a Good First Issue

Look for:
- Issues labeled `good first issue`
- Documentation improvements
- Test coverage gaps
- Typo fixes

### Step 2: Create a Branch

```bash
git checkout -b feat/my-first-contribution
# or
git checkout -b fix/bug-description
```

### Step 3: Make Changes

Example: Add a test for equipment manager

```bash
# Create test file
touch extensions/equipment/tests/test_equipment.rs

# Write test
# Run test
cargo test extensions::equipment
```

### Step 4: Run Quality Checks

```bash
# Format code
cargo fmt

# Lint
cargo clippy

# Test
cargo test

# Check documentation
cargo doc --no-deps --open
```

### Step 5: Commit

```bash
git add .
git commit -m "feat(equipment): add hot-swap test

- Test equipment hot-swapping with memory module
- Verify state preservation during swap
- Add edge case for failed swap"
```

### Step 6: Push and PR

```bash
git push origin feat/my-first-contribution
```

Create Pull Request on GitHub with:
- Clear description
- Link to issue
- Test results
- Screenshots if UI changes

---

## Development Workflow

### Working with Rust Extensions

```rust
// Example: Using Equipment Manager
use claw_extensions::equipment::{EquipmentManager, EquipmentSlot};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut manager = EquipmentManager::new();
    manager.equip(Box::new(HierarchicalMemory::new())).await?;
    Ok(())
}
```

### Working with Feature Flags

```toml
# Cargo.toml
[dependencies]
claw-extensions = { version = "0.1", features = ["equipment", "social"] }
```

Available features:
- `equipment`
- `social`
- `learning`
- `bot`
- `websocket`
- `gpu`
- `monitoring`
- `full` - all features

### Testing

```bash
# Run all tests
cargo test

# Run specific module
cargo test equipment

# Run with output
cargo test -- --nocapture

# Run TypeScript tests (memory layer)
cd memory
npm test
```

---

## Common Tasks

### Adding a New Extension

1. Create directory: `extensions/my_extension/`
2. Create `mod.rs` with public API
3. Add feature flag to `Cargo.toml`
4. Export in `lib.rs`
5. Add tests
6. Update documentation

### Updating Documentation

```bash
# Update README
# Update INTEGRATION_GUIDE.md
# Run cargo doc to verify docs build
cargo doc --no-deps
```

### Running Benchmarks

```bash
cargo bench
# See BENCHMARKS.md for details
```

---

## Troubleshooting

### Git Merge Conflicts

The repo has unmerged paths from repository consolidation.

**Quick fix:**
```bash
# Check status
git status

# For files you don't care about, use ours
git checkout --ours path/to/file
git add path/to/file

# For files you want remote version
git checkout --theirs path/to/file
git add path/to/file

# Commit resolution
git commit -m "Resolve merge conflicts"
```

**Need help?** See `CURRENT_STATE.md` for full conflict list.

### Build Failures

**Error: `claw_core` not found**
```bash
# Verify path exists
ls ../claw/core_rust

# Or update Cargo.toml path
```

**Error: Feature not found**
```bash
# Build with correct features
cargo build --features equipment
```

### Test Failures

```bash
# Clean build
cargo clean
cargo test

# Run specific test
cargo test test_name -- --nocapture
```

---

## Resources

### Documentation
- `README.md` - Project overview
- `INTEGRATION_GUIDE.md` - Integration with claw-core
- `MIGRATION_GUIDE.md` - Migration guide
- `CURRENT_STATE.md` - Current project state
- `NEXT_PHASES.md` - Roadmap
- `EXTRACTION_SUMMARY.md` - Feature extraction history

### External
- [Claw Core Repo](https://github.com/SuperInstance/claw)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Async Rust](https://rust-lang.github.io/async-book/)
- [Tokio Tutorial](https://tokio.rs/tokio/tutorial)

### Community
- GitHub Issues: Bug reports and feature requests
- Discussions: Questions and ideas
- Discord: Real-time chat (link in README)

---

## Code Style

### Rust Style

- Follow `rustfmt` output
- Use `cargo clippy` for linting
- Document public APIs with `///`
- Use descriptive variable names
- Prefer `Result<T, E>` over panics

### Commit Messages

Format: `<type>(scope): description`

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructure
- `test` - Tests
- `chore` - Maintenance

Example:
```
feat(equipment): add hot-swap support

- Implement hot-swapping for equipment slots
- Add tests for swap validation
- Update integration guide
```

---

## Getting Help

1. **Check Documentation** - Read relevant `.md` files
2. **Search Issues** - GitHub Issues may have answers
3. **Ask in Discussions** - Post questions
4. **Check Logs** - `cargo test -- --nocapture` for details
5. **Contributors** - Tag maintainers in PRs

---

## Next Steps

After onboarding:
1. Read `CURRENT_STATE.md` to understand current status
2. Read `NEXT_PHASES.md` to see roadmap
3. Pick an issue to work on
4. Join community discussions
5. Make your first PR!

Welcome to Claw Extensions! 🚀

---

*Last Updated: 2026-08-20*
