# Spreadsheet Moment - Metrics Examples and Integration Guide

Complete guide for instrumenting your application with Prometheus metrics.

## Application Metrics Integration

### Python/Flask Example

```python
from prometheus_client import Counter, Histogram, Gauge, start_http_server
from flask import Flask, request
import time

app = Flask(__name__)

# Define metrics
http_requests_total = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
http_request_duration = Histogram('http_request_duration_seconds', 'HTTP request duration', ['method', 'endpoint'])
active_users = Gauge('sheet_moment_active_users', 'Number of active users')
feature_usage = Counter('sheet_moment_feature_usage_total', 'Feature usage', ['feature_name', 'user_type'])

# Middleware to track requests
@app.before_request
def before_request():
    request.start_time = time.time()

@app.after_request
def after_request(response):
    duration = time.time() - request.start_time
    http_requests_total.labels(
        method=request.method,
        endpoint=request.path,
        status=response.status_code
    ).inc()
    http_request_duration.labels(
        method=request.method,
        endpoint=request.path
    ).observe(duration)
    return response

# Business metrics endpoint
@app.route('/api/v1/metrics/users/active')
def get_active_users():
    count = get_active_user_count()  # Your implementation
    active_users.set(count)
    return {'active_users': count}

# Feature usage tracking
@app.route('/api/v1/features/<feature_name>/use')
def use_feature(feature_name):
    user_type = get_user_type()  # Your implementation
    feature_usage.labels(feature_name=feature_name, user_type=user_type).inc()
    return {'status': 'recorded'}

# Start metrics server
if __name__ == '__main__':
    start_http_server(8001)  # Metrics on port 8001
    app.run(port=8000)
```

### Node.js/Express Example

```javascript
const express = require('express');
const promClient = require('prom-client');
const app = express();

// Create Registry
const register = new promClient.Registry();

// Define metrics
const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
});

const activeUsers = new promClient.Gauge({
    name: 'sheet_moment_active_users',
    help: 'Number of active users',
    registers: [register]
});

const featureUsage = new promClient.Counter({
    name: 'sheet_moment_feature_usage_total',
    help: 'Feature usage count',
    labelNames: ['feature_name', 'user_type'],
    registers: [register]
});

// Middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        httpRequestDuration
            .labels(req.method, req.route?.path || req.path, res.statusCode)
            .observe(duration);
    });
    next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Business metrics endpoint
app.get('/api/v1/metrics/users/active', (req, res) => {
    const count = getActiveUserCount(); // Your implementation
    activeUsers.set(count);
    res.json({ active_users: count });
});

// Feature usage
app.post('/api/v1/features/:featureName/use', (req, res) => {
    const userType = getUserType(); // Your implementation
    featureUsage.labels(req.params.featureName, userType).inc();
    res.json({ status: 'recorded' });
});

app.listen(8000, () => {
    console.log('Server running on port 8000');
});
```

### Go Example

```go
package main

import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
    "net/http"
    "time"
)

var (
    httpRequestDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "http_request_duration_seconds",
            Help: "HTTP request duration",
        },
        []string{"method", "endpoint", "status"},
    )

    activeUsers = prometheus.NewGauge(
        prometheus.GaugeOpts{
            Name: "sheet_moment_active_users",
            Help: "Number of active users",
        },
    )

    featureUsage = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "sheet_moment_feature_usage_total",
            Help: "Feature usage count",
        },
        []string{"feature_name", "user_type"},
    )
)

func init() {
    prometheus.MustRegister(httpRequestDuration)
    prometheus.MustRegister(activeUsers)
    prometheus.MustRegister(featureUsage)
}

func middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        ww := &responseWriter{ResponseWriter: w, status: 200}
        next.ServeHTTP(ww, r)
        duration := time.Since(start).Seconds()
        httpRequestDuration.WithLabelValues(r.Method, r.URL.Path, string(ww.status)).Observe(duration)
    })
}

func main() {
    http.Handle("/metrics", promhttp.Handler())
    http.HandleFunc("/api/v1/metrics/users/active", func(w http.ResponseWriter, r *http.Request) {
        count := getActiveUserCount() // Your implementation
        activeUsers.Set(float64(count))
        w.Write([]byte(`{"active_users":` + string(count) + `}`))
    })

    http.ListenAndServe(":8000", middleware(http.DefaultServeMux))
}
```

## Database Metrics

### PostgreSQL Metrics Exporter

Install postgres_exporter:

```bash
docker run -d \
  --name postgres_exporter \
  --network monitoring \
  -e DATA_SOURCE_NAME="postgresql://user:password@hostname:5432/database?sslmode=disable" \
  -p 9187:9187 \
  prometheuscommunitypostgres-exporter
```

Key metrics exposed:
- `pg_stat_database_blks_hit` / `pg_stat_database_blks_read` (Cache hit ratio)
- `pg_stat_activity_count` (Active connections)
- `pg_replication_lag_seconds` (Replication lag)
- `pg_stat_statements_mean_exec_time` (Query performance)

### Redis Metrics Exporter

```bash
docker run -d \
  --name redis_exporter \
  --network monitoring \
  -e REDIS_ADDR="redis://hostname:6379" \
  -p 9121:9121 \
  oliver006/redis_exporter
```

Key metrics:
- `redis_connected_clients` (Active connections)
- `redis_used_memory_bytes` (Memory usage)
- `redis_keyspace_hits_total` / `redis_keyspace_misses_total` (Cache hit ratio)
- `redis_commands_processed_total` (Throughput)

## Custom Business Metrics

### E-commerce Metrics

```python
from prometheus_client import Counter, Gauge, Histogram

# Sales metrics
revenue_total = Counter('sheet_moment_revenue_total', 'Total revenue', ['currency', 'product_category'])
order_total = Counter('sheet_moment_orders_total', 'Total orders', ['status'])
cart_abandonment = Counter('sheet_moment_cart_abandonments_total', 'Cart abandonments')

# Customer metrics
customer_ltv = Gauge('sheet_moment_customer_ltv', 'Customer lifetime value', ['customer_segment'])
conversion_rate = Gauge('sheet_moment_conversion_rate', 'Conversion rate', ['funnel_stage'])

# Track purchase
def record_purchase(currency, amount, category):
    revenue_total.labels(currency=currency, product_category=category).inc(amount)
    order_total.labels(status='completed').inc()

# Track abandonment
def record_cart_abandonment():
    cart_abandonment.inc()

# Track conversion
def update_conversion_rate(stage, rate):
    conversion_rate.labels(funnel_stage=stage).set(rate)
```

### User Engagement Metrics

```python
# Session metrics
session_duration = Histogram('sheet_moment_session_duration_seconds', 'Session duration')
page_views = Counter('sheet_moment_page_views_total', 'Page views', ['page_type'])

# Feature engagement
feature_engagement = Counter('sheet_moment_feature_engagement_total', 'Feature engagement', ['feature_name', 'action_type'])

# User retention
retention_rate = Gauge('sheet_moment_retention_rate', 'User retention rate', ['cohort'])

# Track session
def track_session(duration_seconds):
    session_duration.observe(duration_seconds)

# Track page view
def track_page_view(page_type):
    page_views.labels(page_type=page_type).inc()

# Track feature usage
def track_feature_engagement(feature, action):
    feature_engagement.labels(feature_name=feature, action_type=action).inc()
```

## Performance Metrics

### Response Time Tracking

```python
# Detailed request metrics
request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint', 'status'],
    buckets=[.005, .01, .025, .05, .075, .1, .25, .5, .75, 1.0, 2.5, 5.0, 7.5, 10.0]
)

# Database query duration
db_query_duration = Histogram(
    'db_query_duration_seconds',
    'Database query duration',
    ['query_type', 'table'],
    buckets=[.001, .005, .01, .025, .05, .1, .25, .5, 1.0, 2.5, 5.0]
)

# External API calls
external_api_duration = Histogram(
    'external_api_duration_seconds',
    'External API call duration',
    ['api_name', 'endpoint'],
    buckets=[.1, .25, .5, 1.0, 2.5, 5.0, 10.0, 30.0]
)
```

### Resource Usage Metrics

```python
# Memory usage
memory_usage = Gauge('application_memory_usage_bytes', 'Application memory usage')

# CPU usage
cpu_usage = Gauge('application_cpu_usage_percent', 'Application CPU usage')

# Goroutines/threads
goroutines = Gauge('application_goroutines', 'Number of goroutines')

# Connection pool
connection_pool = Gauge('connection_pool_size', 'Connection pool size', ['pool_name', 'state'])
```

## Security Metrics

### Authentication Metrics

```python
# Authentication attempts
auth_attempts = Counter('auth_attempts_total', 'Authentication attempts', ['method', 'status'])
auth_failures = Counter('auth_failures_total', 'Authentication failures', ['failure_reason'])

# Track login
def track_login(method, success, reason=None):
    if success:
        auth_attempts.labels(method=method, status='success').inc()
    else:
        auth_attempts.labels(method=method, status='failure').inc()
        if reason:
            auth_failures.labels(failure_reason=reason).inc()
```

### Security Events

```python
# Security events
security_events = Counter('security_events_total', 'Security events', ['event_type', 'severity'])
blocked_requests = Counter('blocked_requests_total', 'Blocked requests', ['block_reason'])

# Track security event
def track_security_event(event_type, severity='info'):
    security_events.labels(event_type=event_type, severity=severity).inc()

# Track blocked request
def track_blocked_request(reason):
    blocked_requests.labels(block_reason=reason).inc()
```

## Best Practices

### Metric Naming

- Use `snake_case` for metric names
- Include units in metric names (`_seconds`, `_bytes`, `_total`)
- Use consistent prefixes for your application (`sheet_moment_`)

### Label Design

- Keep cardinality low (< 100 unique values per label)
- Use labels for dimensions you want to filter/aggregate by
- Avoid high-cardinality labels (user IDs, timestamps)

### Metric Types

- **Counter**: Monotonically increasing values (requests, errors)
- **Gauge**: Values that can go up or down (memory usage, active users)
- **Histogram**: Distributions of values (request durations, response sizes)
- **Summary**: Similar to histogram but with quantiles

### Performance Considerations

1. **Avoid high cardinality metrics**
2. **Use appropriate bucket sizes** for histograms
3. **Cache expensive metric calculations**
4. **Use batch updates** for gauge metrics
5. **Monitor metric count** to prevent explosion

## Testing Metrics

### Unit Tests

```python
import unittest
from prometheus_client import REGISTRY

class TestMetrics(unittest.TestCase):
    def setUp(self):
        # Clear registry before each test
        REGISTRY.clear()

    def test_metric_exists(self):
        # Test that metric is registered
        metric_names = [metric.name for metric in REGISTRY.collect()]
        self.assertIn('sheet_moment_active_users', metric_names)

    def test_metric_increment(self):
        # Test counter increment
        counter = Counter('test_counter', 'Test counter')
        counter.inc()
        metric_value = next(counter.collect()).samples[0].value
        self.assertEqual(metric_value, 1.0)
```

### Integration Tests

```python
def test_metrics_endpoint():
    response = requests.get('http://localhost:8001/metrics')
    assert response.status_code == 200
    assert 'sheet_moment_active_users' in response.text
```

## Common Patterns

### Request Tracking

```python
# Track request duration and status code
@app.route('/api/data')
def get_data():
    start = time.time()
    try:
        # Your logic here
        status = 'success'
        return jsonify(data)
    except Exception as e:
        status = 'error'
        raise
    finally:
        duration = time.time() - start
        api_request_duration.labels(endpoint='/api/data', status=status).observe(duration)
```

### Background Job Monitoring

```python
# Background job metrics
job_duration = Histogram('job_duration_seconds', 'Job duration', ['job_name'])
job_errors = Counter('job_errors_total', 'Job errors', ['job_name', 'error_type'])

def run_job(job_name):
    with job_duration.labels(job_name=job_name).time():
        try:
            # Your job logic
            pass
        except Exception as e:
            job_errors.labels(job_name=job_name, error_type=type(e).__name__).inc()
            raise
```

---

**Document Version**: 1.0.0
**Last Updated**: 2025-03-15
