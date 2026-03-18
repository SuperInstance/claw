# Performance Optimization Quick Start

**Round 13: Performance Optimization**
**Quick Start Guide for Using Optimized Components**

---

## 🚀 Quick Start

### 1. Enable Optimized Components

```rust
// In your main.rs or lib.rs
use claw_core::api::optimized_handlers::create_optimized_router;

#[tokio::main]
async fn main() {
    // Use optimized router instead of standard router
    let app = create_optimized_router();

    // Start server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();

    axum::serve(listener, app).await.unwrap();
}
```

### 2. Use Cache Manager

```rust
use claw_core::api::cache::CacheManager;

// Create cache manager
let cache = CacheManager::new();

// Cache data
cache.agents.insert("key", value).await;

// Retrieve data
if let Some(value) = cache.agents.get("key").await {
    // Use cached value
}
```

### 3. Run Benchmarks

```bash
# Run all performance benchmarks
cd claw/core
cargo bench --bench comprehensive_performance

# Run specific benchmark
cargo bench --bench comprehensive_performance -- api_response_times
```

---

## 📊 Performance Targets

| Metric | Target | How to Check |
|--------|--------|--------------|
| API Response | <100ms | `GET /api/v1/metrics` |
| Cache Hit Rate | >80% | `GET /api/v1/metrics` |
| Memory per Agent | <1MB | `cargo bench` |
| WebSocket Latency | <10ms | `cargo bench` |

---

## 🔧 Configuration

### Cache Configuration

```rust
use claw_core::api::cache::CacheConfig;
use std::time::Duration;

let config = CacheConfig {
    max_size: 1000,                    // Max entries per cache
    ttl: Duration::from_secs(300),     // 5 minutes
    cleanup_interval: Duration::from_secs(60), // 1 minute
};

let cache = CacheManager::with_config(config);
```

### WebSocket Configuration

```rust
use claw_core::api::optimized_websocket::WebSocketConfig;

let config = WebSocketConfig {
    batch_size: 100,                    // Messages per batch
    batch_timeout_ms: 50,               // Batch timeout
    heartbeat_interval_secs: 30,        // Heartbeat interval
    max_message_size: 1024 * 1024,      // 1 MB max message
    compression: true,                  // Enable compression
};
```

---

## 📈 Monitoring

### Get Performance Metrics

```bash
# Get current metrics
curl http://localhost:3000/api/v1/metrics

# Get health status
curl http://localhost:3000/health
```

### Response Example

```json
{
  "success": true,
  "data": {
    "request_count": 10000,
    "cache_hits": 8500,
    "cache_misses": 1500,
    "avg_response_time_ms": 8.5,
    "p50_response_time_ms": 5.0,
    "p95_response_time_ms": 15.0,
    "p99_response_time_ms": 25.0
  }
}
```

---

## 🧪 Testing

### Run Performance Tests

```bash
# Run all tests
cargo test --release

# Run performance benchmarks
cargo bench --bench comprehensive_performance

# Run with output
cargo bench --bench comprehensive_performance -- --nocapture
```

---

## 📝 Common Operations

### Clear Cache

```bash
curl -X POST http://localhost:3000/api/v1/cache/clear
```

### Batch Create Agents

```bash
curl -X POST http://localhost:3000/api/v1/agents/batch \
  -H "Content-Type: application/json" \
  -d '{
    "agents": [
      {"id": "agent-1", "config": {...}},
      {"id": "agent-2", "config": {...}}
    ]
  }'
```

### Paginated Agent List

```bash
curl "http://localhost:3000/api/v1/agents?page=0&page_size=50"
```

---

## 🔍 Troubleshooting

### High Memory Usage

```bash
# Check cache size
curl http://localhost:3000/api/v1/metrics | jq '.data.cache_stats'

# Clear cache
curl -X POST http://localhost:3000/api/v1/cache/clear
```

### Slow API Responses

```bash
# Check response times
curl http://localhost:3000/api/v1/metrics | jq '.data.avg_response_time_ms'

# Check cache hit rate
curl http://localhost:3000/api/v1/metrics | jq '.data.cache_hit_rate'
```

### WebSocket Issues

```bash
# Check WebSocket stats
curl http://localhost:3000/api/v1/metrics | jq '.data.websocket_stats'
```

---

## 📚 Additional Resources

- **Full Guide:** `PERFORMANCE_OPTIMIZATION_GUIDE.md`
- **Benchmarks:** `benches/comprehensive_performance.rs`
- **Cache Implementation:** `src/api/cache.rs`
- **Optimized Handlers:** `src/api/optimized_handlers.rs`
- **WebSocket:** `src/api/optimized_websocket.rs`

---

## ✅ Checklist

- [ ] Enable optimized router in main.rs
- [ ] Configure cache manager
- [ ] Run performance benchmarks
- [ ] Monitor metrics endpoint
- [ ] Test with production workload
- [ ] Adjust configuration as needed

---

**Need Help?** Check the full `PERFORMANCE_OPTIMIZATION_GUIDE.md` for detailed information.
