# Claw Troubleshooting Guide

**Comprehensive troubleshooting guide for Claw cellular agent engine**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![docs](https://img.shields.io/badge/docs-rigorous-blue)](docs/)
[![Rust](https://img.shields.io/badge/rust-1.85%2B-orange)](https://www.rust-lang.org/)

**Repository:** https://github.com/SuperInstance/claw
**Last Updated:** 2026-03-18
**Version:** 0.1.0

---

## Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Build Issues](#build-issues)
3. [Runtime Issues](#runtime-issues)
4. [Performance Issues](#performance-issues)
5. [Integration Issues](#integration-issues)
6. [Testing Issues](#testing-issues)
7. [Network Issues](#network-issues)
8. [Memory Issues](#memory-issues)
9. [Authentication Issues](#authentication-issues)
10. [Debugging Techniques](#debugging-techniques)

---

## Quick Diagnostics

### Health Check Script

```bash
#!/bin/bash
# quick-check.sh - Quick health diagnostics for Claw

echo "=== Claw Quick Diagnostics ==="
echo ""

# Check Rust version
echo "1. Rust Version:"
rustc --version
echo ""

# Check Cargo version
echo "2. Cargo Version:"
cargo --version
echo ""

# Check build status
echo "3. Build Status:"
cargo check --quiet 2>&1 | head -5
echo ""

# Run quick tests
echo "4. Quick Tests:"
cargo test --quiet --lib 2>&1 | tail -3
echo ""

# Check for common issues
echo "5. Common Issues:"
if [ ! -d "target" ]; then
    echo "   ⚠️  Build directory missing - run 'cargo build'"
fi
if [ ! -f "Cargo.toml" ]; then
    echo "   ❌ Cargo.toml missing"
fi
if [ ! -d ".git" ]; then
    echo "   ⚠️  Not a git repository"
fi
echo ""

echo "=== Diagnostics Complete ==="
```

### Diagnostic Commands

```bash
# Check all agent statuses
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:8080/api/v1/agents/status

# Check WebSocket connectivity
wscat -c ws://localhost:8080/ws

# Check memory usage
ps aux | grep claw

# Check CPU usage
top -p $(pgrep claw)

# Check network connections
netstat -an | grep 8080
```

---

## Build Issues

### Issue: "Failed to compile"

**Symptoms:**
- Compilation errors
- Missing dependencies
- Version conflicts

**Diagnosis:**
```bash
# Check Rust version
rustc --version

# Update Rust
rustup update

# Clean build
cargo clean

# Check dependencies
cargo tree
```

**Solutions:**

1. **Update Rust toolchain:**
```bash
rustup update stable
rustup default stable
```

2. **Clean and rebuild:**
```bash
cargo clean
cargo build --release
```

3. **Check dependency conflicts:**
```bash
cargo tree | grep "duplicate"
```

4. **Update dependencies:**
```bash
cargo update
```

### Issue: "Linker error"

**Symptoms:**
- `linker` not found
- `lld` errors
- Native dependency failures

**Solutions:**

1. **Install system dependencies:**
```bash
# Ubuntu/Debian
sudo apt-get install build-essential libssl-dev pkg-config

# macOS
xcode-select --install

# Windows
# Install Visual Studio Build Tools
```

2. **Use system linker:**
```bash
# In .cargo/config.toml
[target.x86_64-unknown-linux-gnu]
linker = "clang"
```

### Issue: "Out of memory during build"

**Solutions:**

1. **Limit parallel jobs:**
```bash
cargo build -j 2
```

2. **Use release profile:**
```bash
cargo build --release
```

3. **Increase swap:**
```bash
# Linux
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## Runtime Issues

### Issue: "Agent not responding"

**Symptoms:**
- Agent hangs
- No response to triggers
- Timeout errors

**Diagnosis:**
```bash
# Check agent status
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:8080/api/v1/agents/$AGENT_ID

# Check logs
tail -f /var/log/claw/agent.log

# Check process status
ps aux | grep claw-agent
```

**Solutions:**

1. **Restart agent:**
```bash
curl -X POST \
  -H "Authorization: Bearer $API_KEY" \
  http://localhost:8080/api/v1/agents/$AGENT_ID/restart
```

2. **Check trigger configuration:**
```rust
// Verify trigger is properly configured
use claw_core::TriggerConfig;

let config = TriggerConfig {
    source: "cell:B1".to_string(),
    condition: "value > 100".to_string(),
    debounce_ms: 1000,
};
```

3. **Increase timeout:**
```rust
let config = AgentConfig {
    timeout_ms: 30000, // Increase from default
    ..Default::default()
};
```

### Issue: "Equipment not loading"

**Symptoms:**
- Equipment fails to equip
- Missing capabilities
- Equipment errors

**Diagnosis:**
```bash
# Check available equipment
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:8080/api/v1/equipment

# Check equipment status
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:8080/api/v1/agents/$AGENT_ID/equipment
```

**Solutions:**

1. **Verify equipment registration:**
```rust
use claw_core::EquipmentRegistry;

let registry = EquipmentRegistry::new();
registry.register("MEMORY", memory_equipment);
registry.register("REASONING", reasoning_equipment);
```

2. **Check equipment dependencies:**
```rust
// Ensure dependencies are equipped first
let equipment = vec![
    EquipmentSlot::Memory,  // Required for Reasoning
    EquipmentSlot::Reasoning,
];
```

3. **Check equipment capacity:**
```bash
# Each agent has 6 equipment slots
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:8080/api/v1/agents/$AGENT_ID | jq '.equipment | length'
```

### Issue: "Message delivery failure"

**Symptoms:**
- Messages not delivered
- Lost triggers
- Communication errors

**Diagnosis:**
```bash
# Check message queue
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:8080/api/v1/messages/queue

# Check message history
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:8080/api/v1/messages/history?limit=10
```

**Solutions:**

1. **Check message queue capacity:**
```rust
let config = ClawCoreConfig {
    message_queue_size: 10000, // Increase if needed
    ..Default::default()
};
```

2. **Verify message format:**
```rust
use claw_core::Message;

let msg = Message {
    from: "agent-a".to_string(),
    to: "agent-b".to_string(),
    payload: "Hello".to_string(),
    timestamp: SystemTime::now(),
};
```

3. **Check network connectivity:**
```bash
# Test WebSocket connection
wscat -c ws://localhost:8080/ws

# Test REST API
curl http://localhost:8080/health
```

---

## Performance Issues

### Issue: "Slow agent response"

**Symptoms:**
- High latency
- Slow trigger processing
- Poor throughput

**Diagnosis:**
```bash
# Check response time
time curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:8080/api/v1/agents/$AGENT_ID

# Check CPU usage
top -p $(pgrep claw)

# Profile with perf
perf record -g $(pgrep claw)
perf report
```

**Solutions:**

1. **Enable performance optimizations:**
```toml
# Cargo.toml
[profile.release]
opt-level = 3
lto = true
codegen-units = 1
```

2. **Use async properly:**
```rust
use tokio::time::{timeout, Duration};

// Add timeout to prevent hanging
let result = timeout(Duration::from_secs(5), async {
    process_trigger(trigger).await
}).await?;
```

3. **Batch operations:**
```rust
// Process multiple triggers at once
let triggers = vec![trigger1, trigger2, trigger3];
process_triggers_batch(triggers).await?;
```

4. **Enable caching:**
```rust
use claw_core::CacheConfig;

let config = CacheConfig {
    enabled: true,
    ttl_secs: 300,
    max_size: 1000,
};
```

### Issue: "High memory usage"

**Symptoms:**
- Memory grows over time
- OOM errors
- Memory leaks

**Diagnosis:**
```bash
# Check memory usage
ps aux | grep claw

# Use valgrind
valgrind --leak-check=full ./target/release/claw

# Use heaptrack
heaptrack ./target/release/claw
```

**Solutions:**

1. **Enable memory limits:**
```rust
let config = ClawCoreConfig {
    max_memory_mb: 512,
    ..Default::default()
};
```

2. **Clear caches regularly:**
```rust
// Clear old entries
cache.clear_expired();

// Limit cache size
cache.resize(max_size);
```

3. **Use weak references:**
```rust
use std::sync::{Arc, Weak};

let agent_weak = Arc::downgrade(&agent);
// Allows agent to be dropped when no longer needed
```

4. **Profile memory:**
```bash
# Use flamegraph
cargo install flamegraph
cargo flamegraph
```

### Issue: "CPU bottleneck"

**Symptoms:**
- 100% CPU usage
- Slow processing
- System overload

**Solutions:**

1. **Limit parallelism:**
```rust
let config = ClawCoreConfig {
    max_threads: 4, // Limit CPU usage
    ..Default::default()
};
```

2. **Use thread pool:**
```rust
use rayon::prelude::*;

triggers.par_iter().for_each(|trigger| {
    process_trigger(trigger);
});
```

3. **Implement rate limiting:**
```rust
use governor::{Quota, RateLimiter};

let limiter = RateLimiter::direct(Quota::per_second(100));
limiter.until_ready().await;
```

---

## Integration Issues

### Issue: "Spreadsheet connection fails"

**Symptoms:**
- Cannot connect to spreadsheet
- Connection timeouts
- API errors

**Diagnosis:**
```bash
# Test spreadsheet API
curl https://api.spreadsheet-provider.com/health

# Check authentication
curl -H "Authorization: Bearer $TOKEN" \
  https://api.spreadsheet-provider.com/me
```

**Solutions:**

1. **Verify API credentials:**
```rust
use claw_core::SpreadsheetConfig;

let config = SpreadsheetConfig {
    api_key: std::env::var("SPREADSHEET_API_KEY")?,
    api_url: "https://api.spreadsheet-provider.com".to_string(),
    timeout_secs: 30,
};
```

2. **Check network connectivity:**
```bash
# Test DNS resolution
nslookup api.spreadsheet-provider.com

# Test connectivity
ping api.spreadsheet-provider.com

# Test TLS
openssl s_client -connect api.spreadsheet-provider.com:443
```

3. **Use retry logic:**
```rust
use reqwest::retry::RetryPolicy;

let client = reqwest::Client::builder()
    .retry(RetryPolicy::Exponential {
        max_retries: 3,
        min_delay: std::time::Duration::from_secs(1),
    })
    .build()?;
```

### Issue: "WebSocket not connecting"

**Symptoms:**
- WebSocket connection fails
- Disconnections
- No real-time updates

**Diagnosis:**
```bash
# Test WebSocket
wscat -c ws://localhost:8080/ws

# Check WebSocket logs
tail -f /var/log/claw/websocket.log
```

**Solutions:**

1. **Check WebSocket URL:**
```rust
let ws_url = if cfg!(debug_assertions) {
    "ws://localhost:8080/ws"
} else {
    "wss://api.claw.example.com/ws"
};
```

2. **Implement reconnection:**
```rust
use tokio_tungstenite::tungstenite::Message;

loop {
    match connectWebSocket().await {
        Ok(ws) => {
            while let Some(msg) = ws.next().await {
                // Handle message
            }
        }
        Err(e) => {
            eprintln!("Connection error: {}", e);
            tokio::time::sleep(Duration::from_secs(5)).await;
        }
    }
}
```

3. **Enable heartbeat:**
```rust
use tokio::time::interval;

let mut heartbeat = interval(Duration::from_secs(30));
loop {
    heartbeat.tick().await;
    ws.send(Message::Ping(vec![])).await?;
}
```

---

## Testing Issues

### Issue: "Tests failing"

**Symptoms:**
- Test failures
- Flaky tests
- Timeout errors

**Diagnosis:**
```bash
# Run tests with output
cargo test -- --nocapture

# Run specific test
cargo test test_name

# Run tests with backtrace
RUST_BACKTRACE=1 cargo test
```

**Solutions:**

1. **Fix test timing:**
```rust
use tokio::time::{sleep, Duration};

// Add delays for async operations
sleep(Duration::from_millis(100)).await;

// Use timeout
let result = timeout(Duration::from_secs(5), async {
    // Test code
}).await;
```

2. **Mock external dependencies:**
```rust
use mockito::{mock, Server};

let mut server = Server::new();
let mock = server.mock("GET", "/api/agents")
    .with_status(200)
    .with_body("[]")
    .create();

// Test code
mock.assert();
```

3. **Use test fixtures:**
```rust
#[fixture]
fn agent_config() -> AgentConfig {
    AgentConfig {
        id: "test-agent".to_string(),
        ..Default::default()
    }
}
```

### Issue: "Integration test failures"

**Solutions:**

1. **Use test containers:**
```rust
use testcontainers::clients::Cli;

let docker = Cli::default();
let container = docker.run(testcontainers::images::redis::Redis::default());
```

2. **Set up test database:**
```bash
# Use Docker for test dependencies
docker-compose -f docker-compose.test.yml up -d

# Run tests
cargo test --test '*'

# Cleanup
docker-compose -f docker-compose.test.yml down
```

---

## Network Issues

### Issue: "Port already in use"

**Symptoms:**
- Cannot bind to port
- Address already in use
- EADDRINUSE errors

**Diagnosis:**
```bash
# Check what's using the port
lsof -i :8080
netstat -an | grep 8080
```

**Solutions:**

1. **Kill existing process:**
```bash
# Find and kill process
lsof -ti :8080 | xargs kill -9

# Or use pkill
pkill -f claw
```

2. **Use different port:**
```rust
let config = ServerConfig {
    port: 8081, // Use different port
    ..Default::default()
};
```

3. **Enable SO_REUSEADDR:**
```rust
use socket2::{Socket, Domain, Type, Protocol};

let socket = Socket::new(Domain::IPV4, Type::STREAM, Some(Protocol::TCP))?;
socket.set_reuse_address(true)?;
socket.set_reuse_port(true)?;
```

### Issue: "Firewall blocking connections"

**Diagnosis:**
```bash
# Test local connection
curl http://localhost:8080/health

# Test remote connection
curl http://remote-server:8080/health

# Check firewall rules
sudo iptables -L
sudo ufw status
```

**Solutions:**

1. **Configure firewall:**
```bash
# Ubuntu/Debian
sudo ufw allow 8080/tcp

# CentOS/RHEL
sudo firewall-cmd --add-port=8080/tcp --permanent
sudo firewall-cmd --reload
```

2. **Use reverse proxy:**
```nginx
# nginx.conf
server {
    listen 80;
    server_name claw.example.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Memory Issues

### Issue: "Memory leak"

**Diagnosis:**
```bash
# Monitor memory over time
watch -n 1 'ps aux | grep claw'

# Use valgrind
valgrind --leak-check=full \
         --show-leak-kinds=all \
         --track-origins=yes \
         ./target/release/claw

# Use heaptrack
heaptrack ./target/release/claw
heaptrack_print --diff-type leaks
```

**Solutions:**

1. **Fix reference cycles:**
```rust
// BAD - Creates cycle
struct Agent {
    parent: Option<AgentRef>,
    children: Vec<AgentRef>,
}

// GOOD - Use weak references
struct Agent {
    parent: Option<Weak<Agent>>,
    children: Vec<AgentRef>,
}
```

2. **Use RAII:**
```rust
// Automatically clean up when dropped
struct AgentHandle {
    agent: Agent,
}

impl Drop for AgentHandle {
    fn drop(&mut self) {
        self.agent.cleanup();
    }
}
```

3. **Profile allocations:**
```bash
# Use dhall
cargo install dhall
cargo dhall
```

---

## Authentication Issues

### Issue: "Invalid API key"

**Diagnosis:**
```bash
# Test API key
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:8080/api/v1/me

# Check key format
echo $API_KEY | jq -R 'split(".") | .[0] | @base64d | fromjson'
```

**Solutions:**

1. **Verify key format:**
```rust
use claw_core::auth::ApiKey;

let key = ApiKey::parse(&api_key)?;
if !key.is_valid() {
    return Err(AuthError::InvalidKey);
}
```

2. **Check key permissions:**
```bash
# Get key info
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:8080/api/v1/keys/me

# Should show scopes
```

3. **Regenerate key:**
```bash
# Create new key
curl -X POST \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"scopes": ["AgentRead", "AgentWrite"]}' \
  http://localhost:8080/api/v1/keys
```

### Issue: "JWT token expired"

**Solutions:**

1. **Refresh token:**
```bash
# Refresh token
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "..."}' \
  http://localhost:8080/api/v1/auth/refresh
```

2. **Adjust token expiry:**
```rust
use claw_core::auth::JwtConfig;

let config = JwtConfig {
    access_token_expiry: Duration::from_secs(3600), // 1 hour
    refresh_token_expiry: Duration::from_secs(86400), // 24 hours
};
```

---

## Debugging Techniques

### Logging

```rust
use tracing::{info, warn, error, debug};
use tracing_subscriber;

// Initialize tracing
tracing_subscriber::fmt::init();

// Use logging
info!("Agent started: {}", agent_id);
warn!("Slow operation: {:?}", duration);
error!("Failed to process trigger: {:?}", error);
debug!("Trigger data: {:?}", trigger);
```

### Debugging Build Issues

```bash
# Build with verbose output
cargo build --verbose

# Check expansion
cargo expand

# Check assembly
cargo rustc -- --emit asm

# Check LLVM IR
cargo rustc -- --emit llvm-ir
```

### Debugging Runtime Issues

```bash
# Use gdb
rust-gdb ./target/release/claw

# Use lldb
lldb ./target/release/claw

# Use rr (record and replay)
rr record ./target/release/claw
rr replay
```

### Performance Profiling

```bash
# Use flamegraph
cargo install flamegraph
cargo flamegraph

# Use perf
perf record -g ./target/release/claw
perf report

# Use samply
cargo install samply
cargo samply
```

---

## Getting Help

If you're still stuck:

1. **Check the documentation:**
   - [README.md](README.md)
   - [ARCHITECTURE.md](docs/ARCHITECTURE.md)
   - [API_REFERENCE.md](docs/API_REFERENCE.md)

2. **Search existing issues:**
   - https://github.com/SuperInstance/claw/issues

3. **Join the community:**
   - Discord: https://discord.gg/claw
   - Matrix: #claw:matrix.org

4. **Create an issue:**
   - https://github.com/SuperInstance/claw/issues/new
   - Include: OS, Rust version, error messages, steps to reproduce

---

**Last Updated:** 2026-03-18
**Version:** 0.1.0
**Contributors:** See [CONTRIBUTORS.md](CONTRIBUTORS.md)
