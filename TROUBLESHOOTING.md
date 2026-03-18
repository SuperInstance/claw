# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Claw cellular agent engine.

## Quick Diagnosis

### Issue Categories

- [Installation Issues](#installation-issues)
- [Build Issues](#build-issues)
- [Runtime Issues](#runtime-issues)
- [Performance Issues](#performance-issues)
- [WebSocket Issues](#websocket-issues)
- [Authentication Issues](#authentication-issues)

---

## Installation Issues

### Problem: `cargo install` fails

**Symptoms:**
- Error during `cargo install claw`
- Missing dependencies
- Compilation errors

**Solutions:**

1. **Check Rust version:**
   ```bash
   rustc --version
   # Should be 1.70.0 or later
   ```

2. **Update Rust:**
   ```bash
   rustup update stable
   ```

3. **Install system dependencies:**

   **Ubuntu/Debian:**
   ```bash
   sudo apt-get install build-essential libssl-dev pkg-config
   ```

   **macOS:**
   ```bash
   xcode-select --install
   ```

   **Windows:**
   - Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - Install [Rust](https://rustup.rs/)

### Problem: Git clone fails

**Symptoms:**
- `fatal: unable to access`
- SSL certificate errors
- Timeout errors

**Solutions:**

1. **Check internet connection**
2. **Update git:**
   ```bash
   git update
   ```
3. **Disable SSL verification (temporary):**
   ```bash
   git -c http.sslVerify=false clone https://github.com/SuperInstance/claw.git
   ```

---

## Build Issues

### Problem: Compilation errors

**Symptoms:**
- `error[E0432]: unresolved import`
- `error[E0277]: the trait bound is not satisfied`
- Type errors

**Solutions:**

1. **Clean build:**
   ```bash
   cargo clean
   cargo build --release
   ```

2. **Update dependencies:**
   ```bash
   cargo update
   ```

3. **Check for Rust updates:**
   ```bash
   rustup update stable
   cargo +stable build --release
   ```

4. **Check for feature conflicts:**
   ```bash
   cargo build --release --features default
   ```

### Problem: Linker errors

**Symptoms:**
- `linking with `cc` failed`
- `undefined reference`
- LTO errors

**Solutions:**

1. **Disable LTO:**
   ```bash
   cargo build --release --profile release-lto
   ```

2. **Check linker:**
   ```bash
   rustup show
   ```

3. **Use system linker (Windows):**
   ```bash
   cargo build --release --config "target.x86_64-pc-windows-msvc.linker=\"lld\""
   ```

### Problem: Out of memory during build

**Symptoms:**
- Build process killed
- `error: out of memory`
- System becomes unresponsive

**Solutions:**

1. **Reduce parallel jobs:**
   ```bash
   cargo build --release -j 2
   ```

2. **Check available memory:**
   ```bash
   # Linux/macOS
   free -h

   # Windows
   wmic OS get FreePhysicalMemory
   ```

3. **Close other applications**
4. **Increase swap space (Linux):**
   ```bash
   sudo fallocate -l 4G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

---

## Runtime Issues

### Problem: Agent won't start

**Symptoms:**
- `Error: Failed to start agent`
- `panic!` or `unwrap()` failure
- Silent failure

**Solutions:**

1. **Check configuration:**
   ```bash
   claw validate config.toml
   ```

2. **Enable debug logging:**
   ```bash
   RUST_LOG=debug claw start
   ```

3. **Check port availability:**
   ```bash
   # Linux/macOS
   lsof -i :8080

   # Windows
   netstat -ano | findstr :8080
   ```

4. **Verify agent definition:**
   ```bash
   claw check-agent <agent-id>
   ```

### Problem: Agent crashes immediately

**Symptoms:**
- Agent starts then exits
- No error message
- Exit code 1 or 101

**Solutions:**

1. **Check logs:**
   ```bash
   tail -f /var/log/claw/agent.log
   ```

2. **Run with backtrace:**
   ```bash
   RUST_BACKTRACE=1 claw start
   ```

3. **Check resource limits:**
   ```bash
   # Linux
   ulimit -a

   # Increase file descriptor limit
   ulimit -n 4096
   ```

4. **Validate seed configuration:**
   ```bash
   claw validate-seed seed.json
   ```

### Problem: Agent stuck in loop

**Symptoms:**
- High CPU usage
- No progress
- Repeated log messages

**Solutions:**

1. **Check trigger conditions:**
   ```bash
   claw debug-trigger <agent-id>
   ```

2. **Inspect state:**
   ```bash
   claw inspect <agent-id>
   ```

3. **Check for circular dependencies:**
   ```bash
   claw check-circular <agent-id>
   ```

4. **Kill and restart:**
   ```bash
   claw stop <agent-id>
   claw start <agent-id>
   ```

---

## Performance Issues

### Problem: High memory usage

**Symptoms:**
- Agent consumes >100MB RAM
- Memory leak suspected
- System slows down

**Solutions:**

1. **Check memory usage:**
   ```bash
   claw stats <agent-id> --memory
   ```

2. **Reduce equipment load:**
   ```bash
   claw unequip <agent-id> MEMORY
   ```

3. **Adjust memory limits:**
   ```bash
   claw config set memory.limit 52428800  # 50MB
   ```

4. **Profile memory:**
   ```bash
   cargo build --release --features profiling
   valgrind --leak-check=full claw start
   ```

### Problem: Slow trigger processing

**Symptoms:**
- >100ms trigger latency
- Laggy responses
- Queue buildup

**Solutions:**

1. **Check queue depth:**
   ```bash
   claw stats <agent-id> --queue
   ```

2. **Optimize trigger:**
   ```bash
   claw optimize-trigger <agent-id>
   ```

3. **Reduce equipment overhead:**
   ```bash
   claw unequip <agent-id> REASONING
   ```

4. **Profile performance:**
   ```bash
   cargo flamegraph --bin claw -- start
   ```

### Problem: High CPU usage

**Symptoms:**
- 100% CPU usage
- Fan spins up
- Battery drains quickly

**Solutions:**

1. **Check active agents:**
   ```bash
   claw list --active
   ```

2. **Reduce polling frequency:**
   ```bash
   claw config set polling.interval 5000  # 5 seconds
   ```

3. **Enable CPU throttling:**
   ```bash
   claw config set cpu.throttle true
   ```

4. **Profile hotspots:**
   ```bash
   cargo build --release --features profiling
   perf record -g claw start
   perf report
   ```

---

## WebSocket Issues

### Problem: WebSocket connection fails

**Symptoms:**
- `WebSocket connection failed`
- `Connection reset by peer`
- Handshake errors

**Solutions:**

1. **Check WebSocket server:**
   ```bash
   claw ws status
   ```

2. **Verify port:**
   ```bash
   curl http://localhost:8080/health
   ```

3. **Check firewall:**
   ```bash
   # Linux
   sudo ufw allow 8080/tcp

   # Windows
   netsh advfirewall firewall add rule name="Claw WS" dir=in action=allow protocol=TCP localport=8080
   ```

4. **Test connection:**
   ```bash
   wscat -c ws://localhost:8080/ws
   ```

### Problem: WebSocket disconnects frequently

**Symptoms:**
- Intermittent disconnections
- `close event 1006`
- Reconnection loops

**Solutions:**

1. **Check heartbeat:**
   ```bash
   claw config set websocket.ping_interval 30000  # 30 seconds
   ```

2. **Increase timeout:**
   ```bash
   claw config set websocket.timeout 120  # 120 seconds
   ```

3. **Check network stability:**
   ```bash
   ping -c 100 localhost
   ```

4. **Enable reconnection:**
   ```bash
   claw config set websocket.reconnect true
   ```

### Problem: WebSocket authentication fails

**Symptoms:**
- `401 Unauthorized`
- `Invalid API key`
- Token errors

**Solutions:**

1. **Verify API key:**
   ```bash
   claw api-key list
   ```

2. **Regenerate key:**
   ```bash
   claw api-key regenerate <key-id>
   ```

3. **Check permissions:**
   ```bash
   claw api-key inspect <key-id>
   ```

4. **Test authentication:**
   ```bash
   curl -H "Authorization: Bearer <key>" http://localhost:8080/api/health
   ```

---

## Authentication Issues

### Problem: API key doesn't work

**Symptoms:**
- `401 Unauthorized`
- `Invalid credentials`
- Access denied

**Solutions:**

1. **Verify key format:**
   ```bash
   claw api-key validate <key>
   ```

2. **Check key expiration:**
   ```bash
   claw api-key inspect <key-id>
   ```

3. **Verify scopes:**
   ```bash
   claw api-key scopes <key-id>
   ```

4. **Regenerate key:**
   ```bash
   claw api-key regenerate <key-id>
   ```

### Problem: Rate limiting errors

**Symptoms:**
- `429 Too Many Requests`
- Requests blocked
- Throttling active

**Solutions:**

1. **Check rate limits:**
   ```bash
   claw api-key limits <key-id>
   ```

2. **Increase quota:**
   ```bash
   claw api-key update <key-id> --rate-limit 1000
   ```

3. **Implement backoff:**
   ```bash
   claw config set api.backoff exponential
   ```

4. **Use batch operations:**
   ```bash
   claw batch --file operations.json
   ```

### Problem: Permission denied

**Symptoms:**
- `403 Forbidden`
- Operation not allowed
- Scope errors

**Solutions:**

1. **Check required scopes:**
   ```bash
   claw scopes list
   ```

2. **Verify key scopes:**
   ```bash
   claw api-key scopes <key-id>
   ```

3. **Grant additional scopes:**
   ```bash
   claw api-key grant <key-id> AgentWrite
   ```

4. **Check admin status:**
   ```bash
   claw admin check <user-id>
   ```

---

## Getting Help

### Community Resources

- **GitHub Issues:** https://github.com/SuperInstance/claw/issues
- **GitHub Discussions:** https://github.com/SuperInstance/claw/discussions
- **Documentation:** https://claw.superinstance.ai

### Diagnostic Information

When reporting issues, include:

1. **Claw version:**
   ```bash
   claw --version
   ```

2. **System information:**
   ```bash
   claw system-info
   ```

3. **Configuration:**
   ```bash
   claw config show
   ```

4. **Relevant logs:**
   ```bash
   claw logs --agent <agent-id> --tail 100
   ```

5. **Error message:**
   - Full error output
   - Backtrace (if panic)
   - Steps to reproduce

### Debug Mode

Enable comprehensive debugging:

```bash
# Full debug output
RUST_LOG=debug claw start

# With backtrace
RUST_BACKTRACE=full claw start

# Log to file
RUST_LOG=debug claw start 2>&1 | tee claw-debug.log
```

### Known Issues

Check the [known issues](https://github.com/SuperInstance/claw/issues?q=is%3Aissue+is%3Aopen+label%3Aknown-issue) page for:
- Workarounds
- Temporary fixes
- Upcoming solutions

---

## Advanced Troubleshooting

### Enable Core Dumps

**Linux:**
```bash
ulimit -c unlimited
echo "/tmp/core.%e.%p" | sudo tee /proc/sys/kernel/core_pattern
```

**macOS:**
```bash
ulimit -c unlimited
```

### Memory Profiling

```bash
# Install tools
cargo install flamegraph

# Generate flamegraph
cargo flamegraph --bin claw -- start

# Analyze with heaptrack
heaptrack claw start
```

### Network Debugging

```bash
# Capture WebSocket traffic
tcpdump -i lo -w ws.pcap port 8080

# Analyze with Wireshark
wireshark ws.pcap
```

---

**Still having issues?**

Please open a GitHub issue with:
- Detailed description
- Steps to reproduce
- Diagnostic information
- Log files

We'll help you resolve it!
