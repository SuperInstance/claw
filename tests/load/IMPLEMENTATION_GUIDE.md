# Load Testing Suite - Implementation Guide

## Overview
This document provides step-by-step instructions for implementing and using the comprehensive load testing suite for the Spreadsheet Moment platform.

## Quick Start

### 1. Installation

#### Prerequisites
```bash
# Install k6
brew install k6  # macOS
choco install k6 # Windows
# Or download from: https://k6.io/

# Install Artillery (for WebSocket tests)
npm install -g artillery

# Verify Docker is running
docker --version
docker-compose --version
```

#### Install Test Dependencies
```bash
# The load testing scripts will be added to package.json
# Run the setup script:
node tests/load/scripts/update-package-json.js

# Install the new dependencies
npm install
```

### 2. Generate Test Data

```bash
# Generate test users and spreadsheets
npm run test:load:generate

# Or generate individually:
node tests/load/scripts/generate-users.js
node tests/load/scripts/generate-spreadsheets.js
```

### 3. Start Monitoring Infrastructure

```bash
# Start Prometheus and Grafana
npm run test:load:monitoring

# Access dashboards:
# Grafana: http://localhost:3000 (admin/admin)
# Prometheus: http://localhost:9090
```

### 4. Run Load Tests

#### macOS/Linux
```bash
# Run all tests
npm run test:load

# Run specific tests
npm run test:load:baseline    # 100 users, 5 minutes
npm run test:load:rampup      # 100 → 10,000 users, 30 minutes
npm run test:load:sustained   # 5,000 users, 1 hour
npm run test:load:spike       # Spike test
npm run test:load:stress      # Stress test beyond limits
npm run test:load:websocket   # WebSocket tests
```

#### Windows
```bash
# Run all tests
npm run test:load:win

# Run specific tests
npm run test:load:baseline:win
npm run test:load:rampup:win
# ... etc
```

## Test Scenarios

### 1. Baseline Load Test
**Purpose:** Establish performance baseline
**Configuration:**
- Users: 100
- Duration: 5 minutes
- Expected: All thresholds passed

**Run:**
```bash
k6 run tests/load/k6/baseline-test.js
```

### 2. Ramp-Up Test
**Purpose:** Test gradual load increase
**Configuration:**
- Users: 100 → 10,000
- Duration: 30 minutes
- Expected: Identify breaking points

**Run:**
```bash
k6 run tests/load/k6/rampup-test.js
```

### 3. Sustained Load Test
**Purpose:** Detect memory leaks
**Configuration:**
- Users: 5,000
- Duration: 1 hour
- Expected: No memory growth, stable performance

**Run:**
```bash
k6 run tests/load/k6/sustained-test.js
```

### 4. Spike Test
**Purpose:** Test auto-scaling
**Configuration:**
- Users: 1,000 → 10,000 (1 minute)
- Duration: 10 minutes
- Expected: Graceful handling of sudden load

**Run:**
```bash
k6 run tests/load/k6/spike-test.js
```

### 5. Stress Test
**Purpose:** Find absolute limits
**Configuration:**
- Users: 5,000 → 20,000
- Duration: 21 minutes
- Expected: Identify breaking point and graceful degradation

**Run:**
```bash
k6 run tests/load/k6/stress-test.js
```

### 6. WebSocket Tests
**Purpose:** Test real-time collaboration
**Configuration:**
- Connections: 500 → 5,000
- Duration: Various
- Expected: Low latency, stable connections

**Run:**
```bash
artillery run tests/load/artillery/websocket-baseline.yml
artillery run tests/load/artillery/websocket-stress.yml
```

## Customization

### Adjust Test Parameters

Edit test files to customize:

#### k6 Tests (JavaScript)
```javascript
// In tests/load/k6/baseline-test.js
export const options = {
  scenarios: {
    baseline_load: {
      executor: 'constant-vus',
      vus: 100,              // Change virtual users
      duration: '5m',        // Change duration
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<100'],  // Adjust thresholds
  },
};
```

#### Artillery Tests (YAML)
```yaml
# In tests/load/artillery/websocket-baseline.yml
config:
  target: "ws://localhost:4000"
  phases:
    - duration: 60
      arrivalRate: 8  # Adjust arrival rate
```

### Add New Test Scenarios

1. Create new test file in `tests/load/k6/` or `tests/load/artillery/`
2. Follow the structure of existing tests
3. Add npm script in `package.json`
4. Update CI/CD workflow if needed

## Monitoring

### Grafana Dashboards
1. Navigate to http://localhost:3000
2. Login with admin/admin
3. Open "Spreadsheet Moment Load Testing" dashboard
4. Monitor during test execution

### Key Metrics to Watch
- **Requests/sec:** Throughput
- **Response Time (p95/p99):** Latency
- **Error Rate:** Reliability
- **Active Connections:** WebSocket health
- **Resource Usage:** CPU, Memory, Disk I/O

### Prometheus Queries
```promql
# Requests per second
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# P95 response time
histogram_quantile(0.95, http_request_duration_seconds_bucket)

# Cache hit rate
rate(cache_hits_total[5m]) / (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m]))
```

## Troubleshooting

### Tests Won't Start
```bash
# Check if application is running
curl http://localhost:4000/health

# Check if ports are available
lsof -i :4000  # macOS/Linux
netstat -ano | findstr :4000  # Windows

# Check test data
ls tests/load/data/
```

### High Error Rates
1. Check application logs
2. Verify database connections
3. Check memory usage
4. Review error details in test output

### Memory Issues
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# Check for memory leaks
npm run test:load:sustained
# Monitor memory growth in Grafana
```

### Docker Issues
```bash
# Restart monitoring stack
cd tests/load
docker-compose down
docker-compose up -d prometheus grafana

# Check logs
docker-compose logs prometheus
docker-compose logs grafana
```

## CI/CD Integration

The load testing suite is integrated into CI/CD via `.github/workflows/load-test.yml`:

### Pull Request Checks
- Baseline load test (100 users, 5 minutes)
- Performance regression detection
- PR comments with results

### Nightly Builds
- Full test suite
- All scenarios
- Detailed reports

### Manual Triggers
- Run specific tests via workflow dispatch
- Useful for pre-production validation

## Performance Budgets

See `tests/load/PERFORMANCE_BUDGETS.md` for:
- API performance budgets
- Feature-specific budgets
- Infrastructure budgets
- Resource budgets
- User experience budgets

## Reporting

### Generate Reports
```bash
# Reports are auto-generated in tests/load/reports/
# View HTML reports
open tests/load/reports/summary-*.html

# View JSON data
cat tests/load/reports/baseline-*.json | jq .
```

### Customize Reports
Edit `tests/load/scripts/generate-summary-report.js` to customize report format and content.

## Best Practices

### Before Running Tests
1. Ensure application is running
2. Generate fresh test data
3. Start monitoring infrastructure
4. Close other resource-intensive applications

### During Tests
1. Monitor Grafana dashboard
2. Watch for error spikes
3. Check resource usage
4. Monitor database connections

### After Tests
1. Review all metrics
2. Identify bottlenecks
3. Document findings
4. Create action items

## Support

For issues or questions:
1. Check troubleshooting section
2. Review test logs in `tests/load/reports/`
3. Consult Grafana dashboards
4. Review Prometheus metrics

## Next Steps

1. Run baseline test to establish initial performance
2. Identify bottlenecks
3. Implement optimizations
4. Re-test to measure improvement
5. Update performance budgets based on results
6. Schedule regular load tests (weekly recommended)

## File Structure

```
tests/load/
├── README.md                       # This file
├── PERFORMANCE_BUDGETS.md          # Performance targets
├── LOAD_TEST_REPORT_TEMPLATE.md   # Report template
├── docker-compose.yml              # Monitoring infrastructure
├── k6/                             # k6 test scripts
│   ├── baseline-test.js
│   ├── rampup-test.js
│   ├── sustained-test.js
│   ├── spike-test.js
│   └── stress-test.js
├── artillery/                       # Artillery test scripts
│   ├── websocket-baseline.yml
│   ├── websocket-stress.yml
│   └── websocket-processor.js
├── prometheus/                      # Prometheus configuration
│   ├── prometheus.yml
│   └── rules/
│       └── load-test-alerts.yml
├── grafana/                         # Grafana configuration
│   ├── provisioning/
│   │   ├── datasources/
│   │   └── dashboards/
│   └── dashboards/
│       └── load-testing-dashboard.json
├── scripts/                         # Utility scripts
│   ├── generate-users.js
│   ├── generate-spreadsheets.js
│   ├── run-load-tests.sh
│   ├── run-load-tests.ps1
│   └── generate-summary-report.js
├── data/                           # Generated test data
│   ├── test-users.json
│   └── test-spreadsheets.json
├── reports/                        # Test results
└── .github/
    └── workflows/
        └── load-test.yml          # CI/CD integration
```

---

**Last Updated:** 2026-03-14
**Version:** 1.0.0
