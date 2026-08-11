# Spreadsheet Moment Load Testing Suite

Comprehensive load testing infrastructure to validate 10,000 concurrent user capacity.

## Test Scenarios

### 1. Baseline Load Test (100 concurrent users)
- Establish performance baseline
- Identify bottlenecks
- Measure response times

### 2. Ramp-Up Test (100 → 10,000 users)
- Gradual increase over 30 minutes
- Monitor system behavior
- Identify breaking points

### 3. Sustained Load Test (5,000 users for 1 hour)
- Test memory leaks
- Verify stability
- Monitor resource usage

### 4. Spike Test (1,000 → 10,000 users in 1 minute)
- Test auto-scaling
- Verify recovery
- Check queue handling

### 5. Stress Test (Beyond 10,000 users)
- Find absolute limits
- Test graceful degradation
- Identify failure modes

## Performance Targets

| Endpoint | Target | RPS | Concurrent Users |
|----------|--------|-----|------------------|
| GraphQL API | < 100ms p95 | 10,000 | 10,000 |
| REST API | < 50ms p95 | 15,000 | 10,000 |
| WebSocket | < 20ms latency | 5,000 connections | 5,000 |
| Analytics | < 200ms p95 | 1,000 | 1,000 |
| Community | < 150ms p95 | 3,000 | 3,000 |

## Quick Start

### Prerequisites
```bash
# Install k6
brew install k6  # macOS
choco install k6 # Windows
curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz

# Install Artillery
npm install -g artillery

# Install Docker for Prometheus/Grafana
# Already installed in docker-compose.yml
```

### Run Tests

```bash
# Start monitoring infrastructure
cd tests/load
docker-compose up -d prometheus grafana

# Run baseline test
npm run test:load:baseline

# Run ramp-up test
npm run test:load:rampup

# Run sustained load test
npm run test:load:sustained

# Run spike test
npm run test:load:spike

# Run stress test
npm run test:load:stress

# Run all tests
npm run test:load:all

# Generate report
npm run test:load:report
```

## Test Data

Test data is generated automatically using the scripts in `scripts/` directory:
- `generate-users.js` - Generate test user accounts
- `generate-spreadsheets.js` - Generate test spreadsheet data
- `generate-sessions.js` - Generate test session data

## Monitoring

Access dashboards during tests:
- Grafana: http://localhost:3000 (admin/admin)
- Prometheus: http://localhost:9090
- Application metrics: http://localhost:4000/metrics

## Key Metrics

- Response time (p50, p95, p99)
- Requests per second
- Error rate (< 0.1%)
- CPU, memory, disk usage
- Database connection pool utilization
- Cache hit rates
- Network bandwidth

## Troubleshooting

### Tests failing to start
- Ensure application is running on configured port
- Check database connections
- Verify test data is generated

### High error rates
- Check application logs
- Verify database connection pool size
- Monitor resource usage

### Memory issues
- Increase Node.js heap size: `--max-old-space-size=4096`
- Check for memory leaks in application code
- Monitor garbage collection

## CI/CD Integration

Load tests run automatically on:
- Every pull request (baseline test only)
- Nightly builds (full suite)
- Pre-production deployments (full suite)

## Performance Budgets

See `PERFORMANCE_BUDGETS.md` for detailed performance budgets and thresholds.

## Reports

Test reports are generated in `reports/` directory:
- `baseline-{timestamp}.json` - Baseline test results
- `rampup-{timestamp}.json` - Ramp-up test results
- `sustained-{timestamp}.json` - Sustained load results
- `spike-{timestamp}.json` - Spike test results
- `stress-{timestamp}.json` - Stress test results
- `summary-{timestamp}.html` - Executive summary report
