# Claw Contribution Guide

**Guide for contributing to Claw cellular agent engine**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![docs](https://img.shields.io/badge/docs-rigorous-blue)](docs/)
[![Rust](https://img.shields.io/badge/rust-1.85%2B-orange)](https://www.rust-lang.org/)

**Repository:** https://github.com/SuperInstance/claw
**Last Updated:** 2026-03-18
**Version:** 0.1.0

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Standards](#code-standards)
4. [Testing Guidelines](#testing-guidelines)
5. [Documentation Standards](#documentation-standards)
6. [Pull Request Process](#pull-request-process)
7. [Architecture Guidelines](#architecture-guidelines)
8. [Performance Guidelines](#performance-guidelines)
9. [Security Guidelines](#security-guidelines)

---

## Getting Started

### Prerequisites

- **Rust 1.85+** - Latest stable release
- **Git** - Version control
- **GitHub account** - For contributions
- **Code editor** - VS Code with rust-analyzer recommended

### Initial Setup

```bash
# Fork the repository
# https://github.com/SuperInstance/claw/fork

# Clone your fork
git clone https://github.com/YOUR_USERNAME/claw.git
cd claw

# Add upstream remote
git remote add upstream https://github.com/SuperInstance/claw.git

# Install dependencies
cargo install cargo-watch
cargo install cargo-edit
cargo install cargo-expand

# Run tests to verify setup
cargo test --all
```

### Development Environment

```bash
# Install development tools
cargo install cargo-watch
cargo install cargo-expand
cargo install cargo-tree

# Set up pre-commit hooks
cargo install cargo-husky
cargo husky install

# Configure Git
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Project Structure

```
claw/
├── core/              # Core engine
│   ├── src/
│   │   ├── agent/    # Agent implementation
│   │   ├── equipment/ # Equipment system
│   │   ├── trigger/   # Trigger handling
│   │   └── social/    # Social coordination
│   └── tests/         # Unit tests
├── docs/              # Documentation
├── examples/          # Example code
├── benches/           # Benchmarks
└── scripts/           # Utility scripts
```

---

## Development Workflow

### Branch Strategy

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Create bugfix branch
git checkout -b bugfix/your-bugfix

# Create documentation branch
git checkout -b docs/your-doc-update
```

### Commit Guidelines

**Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Test additions/changes
- `chore` - Build process or tooling

**Examples:**
```
feat(equipment): Add WebSocket equipment for real-time updates

Implement new WebSocket equipment that allows agents to receive
real-time updates from external sources.

Closes #123
```

```
fix(trigger): Resolve memory leak in trigger handler

Fix issue where trigger handlers were not properly cleaning up
resources after processing.

Fixes #456
```

### Development Cycle

```bash
# 1. Create feature branch
git checkout -b feature/new-equipment

# 2. Make changes
# ... edit code ...

# 3. Watch for changes and run tests
cargo watch -x test

# 4. Format code
cargo fmt

# 5. Run clippy
cargo clippy -- -D warnings

# 6. Run full test suite
cargo test --all

# 7. Commit changes
git add .
git commit -m "feat(equipment): Add new equipment type"

# 8. Push to fork
git push origin feature/new-equipment

# 9. Create pull request
# https://github.com/SuperInstance/claw/pull/new
```

### Syncing with Upstream

```bash
# Fetch latest changes
git fetch upstream

# Merge upstream main into your branch
git checkout feature/your-feature
git merge upstream/main

# Resolve conflicts if any
# ... edit conflicted files ...
git add .
git commit -m "conflict: Resolve merge conflicts"

# Push updated branch
git push origin feature/your-feature
```

---

## Code Standards

### Rust Style Guidelines

**Follow Rust conventions:**
```rust
// Good - follows naming conventions
pub struct AgentConfig {
    pub id: String,
    pub model: String,
}

impl AgentConfig {
    pub fn new(id: &str) -> Self {
        Self {
            id: id.to_string(),
            model: "default".to_string(),
        }
    }
}

// Bad - doesn't follow conventions
pub struct agent_config {  // Should be PascalCase
    pub ID: String,        // Should be snake_case
}
```

**Error handling:**
```rust
// Good - explicit error handling
use anyhow::{Result, Context};

pub async fn process_trigger(&self, trigger: Trigger) -> Result<Response> {
    let data = self.fetch_data(&trigger.source)
        .await
        .context("Failed to fetch trigger data")?;

    let response = self.analyze(&data)
        .context("Failed to analyze data")?;

    Ok(response)
}

// Bad - unwrap and expect
pub async fn process_trigger(&self, trigger: Trigger) -> Response {
    let data = self.fetch_data(&trigger.source).await.unwrap();
    self.analyze(&data).expect("Should not fail")
}
```

**Async/await:**
```rust
// Good - proper async
use tokio::time::{timeout, Duration};

pub async fn process_with_timeout(&self, data: Data) -> Result<Response> {
    timeout(Duration::from_secs(5), async {
        self.process(data).await
    })
    .await?
}

// Bad - blocking in async
pub async fn process_blocking(&self, data: Data) -> Result<Response> {
    // This blocks the entire runtime
    let result = std::thread::sleep(Duration::from_secs(5));
    Ok(self.process(data)?)
}
```

### Documentation Comments

```rust
/// Configuration for a Claw agent.
///
/// # Fields
///
/// * `id` - Unique identifier for the agent
/// * `model` - ML model to use for reasoning
/// * `equipment` - List of equipment slots to equip
///
/// # Examples
///
/// ```
/// use claw_core::AgentConfig;
///
/// let config = AgentConfig {
///     id: "my-agent".to_string(),
///     model: "gpt-4".to_string(),
///     ..Default::default()
/// };
/// ```
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentConfig {
    /// Unique identifier for this agent
    pub id: String,

    /// ML model for reasoning
    pub model: String,

    /// Equipment to equip
    pub equipment: Vec<EquipmentSlot>,
}
```

### Code Organization

**Module structure:**
```rust
// core/src/lib.rs
pub mod agent;
pub mod equipment;
pub mod trigger;
pub mod social;

// Re-export common types
pub use agent::{Agent, AgentConfig};
pub use equipment::{Equipment, EquipmentSlot};
pub use trigger::{Trigger, TriggerConfig};
pub use social::{SocialConfig, CoordinationStrategy};
```

**Trait design:**
```rust
/// Equipment provides modular capabilities to agents
pub trait Equipment: Send + Sync {
    /// Returns the name of this equipment
    fn name(&self) -> &str;

    /// Executes the equipment with given input
    async fn execute(
        &self,
        input: &str,
        ctx: &EquipmentContext
    ) -> Result<String, Error>;

    /// Optional: Cleanup when equipment is unequipped
    fn cleanup(&self) -> Result<(), Error> {
        Ok(())
    }
}
```

---

## Testing Guidelines

### Test Organization

```
core/
├── src/
│   └── agent.rs
└── tests/
    ├── agent_tests.rs      # Unit tests
    ├── integration_tests.rs # Integration tests
    └── fixtures/           # Test fixtures
```

### Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_agent_creation() {
        let config = AgentConfig {
            id: "test-agent".to_string(),
            ..Default::default()
        };

        let agent = Agent::new(config);
        assert_eq!(agent.id(), "test-agent");
    }

    #[test]
    fn test_agent_state_transitions() {
        let mut agent = Agent::new(test_config());
        assert_eq!(agent.state(), AgentState::Idle);

        agent.start().await.unwrap();
        assert_eq!(agent.state(), AgentState::Running);

        agent.stop().await.unwrap();
        assert_eq!(agent.state(), AgentState::Stopped);
    }
}
```

### Integration Tests

```rust
#[tokio::test]
#[cfg_attr(not(feature = "integration"), ignore)]
async fn test_agent_lifecycle() {
    let mut core = ClawCore::new();

    // Create agent
    let config = AgentConfig {
        id: "test-agent".to_string(),
        ..Default::default()
    };
    core.add_agent(config).await.unwrap();

    // Start agent
    core.start_agent("test-agent").await.unwrap();

    // Send trigger
    let trigger = Trigger::test_data();
    core.send_trigger("test-agent", trigger).await.unwrap();

    // Verify response
    let response = core.get_response("test-agent").await.unwrap();
    assert!(response.is_some());

    // Cleanup
    core.stop().await.unwrap();
}
```

### Property-Based Testing

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn test_agent_config_roundtrip(config in any_agent_config()) {
        let serialized = serde_json::to_string(&config).unwrap();
        let deserialized: AgentConfig = serde_json::from_str(&serialized).unwrap();
        prop_assert_eq!(config, deserialized);
    }
}
```

### Test Coverage

```bash
# Install tarpaulin
cargo install cargo-tarpaulin

# Generate coverage report
cargo tarpaulin --out Html --output-dir coverage

# View coverage
open coverage/index.html
```

**Target coverage:**
- Core logic: 90%+
- Equipment: 85%+
- Triggers: 90%+
- Social: 80%+

---

## Documentation Standards

### Code Documentation

**Every public item must be documented:**
```rust
/// Processes a trigger and returns a response.
///
/// This is the main entry point for trigger processing. It validates
/// the trigger, executes any equipped handlers, and returns a response.
///
/// # Arguments
///
/// * `trigger` - The trigger to process
///
/// # Returns
///
/// Returns a `Result<Response, Error>` where `Response` contains the
/// processed result and `Error` indicates any failures.
///
/// # Errors
///
/// This function will return an error if:
/// - The trigger is invalid
/// - Required equipment is not equipped
/// - Processing times out
///
/// # Examples
///
/// ```no_run
/// use claw_core::{Agent, Trigger};
///
/// # async fn example() -> Result<(), Box<dyn std::error::Error>> {
/// let agent = Agent::new(test_config());
/// let trigger = Trigger::from("test-data");
/// let response = agent.process(trigger).await?;
/// # Ok(())
/// # }
/// ```
pub async fn process(&self, trigger: Trigger) -> Result<Response, Error> {
    // ...
}
```

### README Documentation

**Repository README must include:**
1. Project description
2. Key features
3. Installation instructions
4. Quick start example
5. Documentation links
6. Contributing guidelines
7. License information

### API Documentation

**API docs should be comprehensive:**
```markdown
# API Reference

## Agent Management

### Create Agent

```http
POST /api/v1/agents
Content-Type: application/json
Authorization: Bearer <api_key>

{
  "id": "my-agent",
  "model": "gpt-4",
  "equipment": ["MEMORY", "REASONING"]
}
```

**Parameters:**
- `id` (string, required): Unique agent identifier
- `model` (string, required): ML model to use
- `equipment` (array, optional): Equipment slots

**Response:**
```json
{
  "id": "my-agent",
  "status": "running",
  "created_at": "2026-03-18T10:00:00Z"
}
```
```

---

## Pull Request Process

### Before Submitting

1. **Update documentation:**
   ```bash
   # Update README if needed
   # Update CHANGELOG.md
   # Add/update examples
   ```

2. **Run full test suite:**
   ```bash
   cargo test --all-features
   cargo clippy -- -D warnings
   cargo fmt --check
   ```

3. **Check coverage:**
   ```bash
   cargo tarpaulin --out Html
   ```

4. **Update CHANGELOG:**
   ```markdown
   ## [Unreleased]

   ### Added
   - New WebSocket equipment for real-time updates

   ### Fixed
   - Memory leak in trigger handler

   ### Changed
   - Improved error messages for invalid configurations
   ```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No merge conflicts

## Related Issues
Closes #123
Related to #456
```

### Review Process

1. **Automated checks:**
   - CI/CD pipeline runs
   - All tests must pass
   - Code coverage checked
   - Clippy warnings checked

2. **Code review:**
   - At least one maintainer approval
   - All review comments addressed
   - No unresolved conversations

3. **Integration testing:**
   - Test in staging environment
   - Performance benchmarks run
   - Security audit if needed

---

## Architecture Guidelines

### Core Principles

1. **Cell-First Design:**
   - Each cell is an independent agent
   - Agents communicate via messages
   - No shared mutable state

2. **Actor Model:**
   - Agents are actors
   - Message-driven communication
   - Isolated execution context

3. **Equipment System:**
   - Modular capabilities
   - Hot-swappable
   - Clear contracts

4. **Type Safety:**
   - Leverage Rust's type system
   - Compile-time guarantees
   - No runtime type errors

### Design Patterns

**Factory Pattern:**
```rust
pub trait AgentFactory {
    fn create(&self, config: AgentConfig) -> Result<Agent, Error>;
}

pub struct DefaultAgentFactory;

impl AgentFactory for DefaultAgentFactory {
    fn create(&self, config: AgentConfig) -> Result<Agent, Error> {
        Agent::new(config)
    }
}
```

**Builder Pattern:**
```rust
pub struct AgentBuilder {
    id: String,
    model: String,
    equipment: Vec<EquipmentSlot>,
}

impl AgentBuilder {
    pub fn new(id: &str) -> Self {
        Self {
            id: id.to_string(),
            model: "default".to_string(),
            equipment: Vec::new(),
        }
    }

    pub fn model(mut self, model: &str) -> Self {
        self.model = model.to_string();
        self
    }

    pub fn equipment(mut self, equipment: EquipmentSlot) -> Self {
        self.equipment.push(equipment);
        self
    }

    pub fn build(self) -> Result<Agent, Error> {
        Agent::new(AgentConfig {
            id: self.id,
            model: self.model,
            equipment: self.equipment,
            ..Default::default()
        })
    }
}
```

**Strategy Pattern:**
```rust
pub trait CoordinationStrategy: Send + Sync {
    async fn coordinate(&self, agents: &[Agent]) -> Result<Vec<Response>, Error>;
}

pub struct SequentialStrategy;

impl CoordinationStrategy for SequentialStrategy {
    async fn coordinate(&self, agents: &[Agent]) -> Result<Vec<Response>, Error> {
        let mut results = Vec::new();
        for agent in agents {
            let result = agent.process().await?;
            results.push(result);
        }
        Ok(results)
    }
}
```

---

## Performance Guidelines

### Performance Targets

- **Agent startup:** <100ms
- **Trigger processing:** <10ms
- **Message passing:** <1ms
- **Memory per agent:** <10MB
- **CPU per agent:** <1%

### Optimization Techniques

**Use async properly:**
```rust
// Good - concurrent operations
let (data1, data2) = tokio::join!(
    fetch_data(source1),
    fetch_data(source2)
);

// Bad - sequential operations
let data1 = fetch_data(source1).await;
let data2 = fetch_data(source2).await;
```

**Avoid allocations:**
```rust
// Good - reuse buffer
let mut buffer = Vec::with_capacity(1024);
for item in items {
    buffer.clear();
    serialize(item, &mut buffer);
    process(&buffer).await?;
}

// Bad - allocate each time
for item in items {
    let buffer = serialize(item)?;
    process(&buffer).await?;
}
```

**Use appropriate data structures:**
```rust
// Good - O(1) lookup
use std::collections::HashMap;
let map: HashMap<String, Agent> = HashMap::new();
let agent = map.get("agent-id")?;

// Bad - O(n) lookup
let agents: Vec<Agent> = Vec::new();
let agent = agents.iter().find(|a| a.id() == "agent-id")?;
```

### Benchmarking

```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn benchmark_trigger_processing(c: &mut Criterion) {
    let agent = Agent::new(test_config());

    c.bench_function("process_trigger", |b| {
        b.iter(|| {
            let trigger = Trigger::test_data();
            agent.process(black_box(trigger))
        })
    });
}

criterion_group!(benches, benchmark_trigger_processing);
criterion_main!(benches);
```

---

## Security Guidelines

### Security Principles

1. **Input Validation:**
   - Validate all inputs
   - Sanitize data from external sources
   - Use type-safe parsing

2. **Least Privilege:**
   - Minimal permissions by default
   - Explicit authorization
   - Audit logging

3. **Defense in Depth:**
   - Multiple layers of security
   - Fail securely
   - Rate limiting

### Secure Coding Practices

**Validate inputs:**
```rust
use validator::Validate;

#[derive(Validate, Deserialize)]
pub struct AgentConfig {
    #[validate(length(min = 1, max = 100))]
    pub id: String,

    #[validate(url)]
    pub model_url: String,
}

pub fn create_agent(config: AgentConfig) -> Result<Agent, Error> {
    config.validate()?;
    // ...
}
```

**Prevent injection:**
```rust
// Good - parameterized queries
use sqlx::query;

query!("INSERT INTO agents (id, model) VALUES (?, ?)", agent_id, model)
    .execute(&pool)
    .await?;

// Bad - string concatenation
let query = format!("INSERT INTO agents (id, model) VALUES ('{}', '{}')", agent_id, model);
pool.execute(&query).await?;
```

**Rate limiting:**
```rust
use governor::{Quota, RateLimiter};

let limiter = RateLimiter::direct(Quota::per_second(100));

pub async fn handle_request(&self, request: Request) -> Result<Response, Error> {
    limiter.until_ready().await;
    // Process request
}
```

---

## Getting Help

### Resources

- **Documentation:** https://docs.claw.example.com
- **Issues:** https://github.com/SuperInstance/claw/issues
- **Discussions:** https://github.com/SuperInstance/claw/discussions
- **Discord:** https://discord.gg/claw

### Contact

- **Maintainers:** See [CONTRIBUTORS.md](CONTRIBUTORS.md)
- **Email:** contributors@claw.example.com
- **Security:** security@claw.example.com

---

**Last Updated:** 2026-03-18
**Version:** 0.1.0
**Contributors:** See [CONTRIBUTORS.md](CONTRIBUTORS.md)
