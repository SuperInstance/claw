import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics for stress testing
const errorRate = new Rate('errors');
const responseTimeTrend = new Trend('response_time');
const requestCounter = new Counter('requests_total');
const breakingPoint = new Trend('breaking_point');
const degradationRate = new Trend('degradation_rate');

// Test configuration - Push beyond 10,000 users to find absolute limits
export const options = {
  scenarios: {
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 5000,
      stages: [
        { duration: '3m', target: 5000 },    // Start at 5,000
        { duration: '3m', target: 7500 },    // Ramp to 7,500
        { duration: '3m', target: 10000 },   // Target: 10,000
        { duration: '3m', target: 12500 },   // Push beyond: 12,500
        { duration: '3m', target: 15000 },   // Push further: 15,000
        { duration: '3m', target: 17500 },   // Extreme: 17,500
        { duration: '3m', target: 20000 },   // Maximum: 20,000
        { duration: '2m', target: 0 },       // Rapid cooldown
      ],
      gracefulRampDown: '1m',
      gracefulStop: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // Very relaxed thresholds
    http_req_failed: ['rate<0.20'], // Allow up to 20% errors to find breaking point
  },
  noConnectionReuse: true, // Disable connection reuse to stress connection handling
  discardResponseBodies: true, // Discard bodies to reduce memory usage
  insecureSkipTLSVerify: true, // Skip TLS verification for speed
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const API_KEY = __ENV.API_KEY || 'test-api-key';

const testUsers = JSON.parse(open('../data/test-users.json')) || [];
const testSpreadsheets = JSON.parse(open('../data/test-spreadsheets.json')) || [];

let performanceBaseline = null;
let degradationStartedAt = null;

export function setup() {
  console.log('Setting up STRESS test...');
  console.log(`Target: ${BASE_URL}`);
  console.log('');
  console.log('Stress Test Schedule:');
  console.log('  0-3m:   5,000 users (baseline)');
  console.log('  3-6m:   5,000 -> 7,500 users');
  console.log('  6-9m:   7,500 -> 10,000 users (rated capacity)');
  console.log('  9-12m:  10,000 -> 12,500 users (beyond rated)');
  console.log('  12-15m: 12,500 -> 15,000 users (stress zone)');
  console.log('  15-18m: 15,000 -> 17,500 users (extreme stress)');
  console.log('  18-21m: 17,500 -> 20,000 users (breaking point)');
  console.log('  21-23m: Rapid cooldown');
  console.log('');
  console.log('Objectives:');
  console.log('  1. Find absolute breaking point');
  console.log('  2. Test graceful degradation');
  console.log('  3. Identify failure modes');
  console.log('  4. Measure recovery capability');

  return {
    baseUrl: BASE_URL,
    apiKey: API_KEY,
  };
}

export default function(data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
    'X-Test-Scenario': 'stress',
    'Connection': 'close', // Force connection close
  };

  const requestType = Math.random();
  const startTime = Date.now();

  // Mixed workload to stress all components
  if (requestType < 0.40) {
    // Simple reads (should be fastest)
    const spreadsheetId = `test-spreadsheet-${Math.floor(Math.random() * 100)}`;
    const res = http.get(`${BASE_URL}/api/spreadsheets/${spreadsheetId}`, {
      headers,
      tags: { name: 'Simple_Read' },
    });

    const duration = Date.now() - startTime;

    check(res, {
      'simple read status is 200': (r) => r.status === 200,
      'simple read completed': (r) => r.status !== 0,
    });

    responseTimeTrend.add(duration);
    requestCounter.add(1);

    // Track degradation
    if (!performanceBaseline && duration > 100) {
      performanceBaseline = duration;
      degradationStartedAt = Date.now();
      breakingPoint.add(0); // Mark start of degradation
    } else if (degradationStartedAt) {
      breakingPoint.add((Date.now() - degradationStartedAt) / 1000);
      degradationRate.add(duration / performanceBaseline);
    }

    if (res.status !== 200) {
      errorRate.add(1);
    }
  } else if (requestType < 0.65) {
    // List operations (moderate load)
    const res = http.get(`${BASE_URL}/api/spreadsheets?limit=20`, {
      headers,
      tags: { name: 'List_Operation' },
    });

    const duration = Date.now() - startTime;

    check(res, {
      'list status is 200': (r) => r.status === 200,
      'list completed': (r) => r.status !== 0,
    });

    responseTimeTrend.add(duration);
    requestCounter.add(1);

    if (res.status !== 200) {
      errorRate.add(1);
    }
  } else if (requestType < 0.85) {
    // GraphQL queries (complex)
    const query = `
      query SearchSpreadsheets($query: String!) {
        searchSpreadsheets(query: $query, limit: 10) {
          id
          name
          description
          owner {
            id
            name
          }
        }
      }
    `;

    const res = http.post(`${BASE_URL}/graphql`, JSON.stringify({
      query,
      variables: { query: `test-${Math.floor(Math.random() * 1000)}` },
    }), {
      headers,
      tags: { name: 'GraphQL_Search' },
    });

    const duration = Date.now() - startTime;

    check(res, {
      'graphql status is 200': (r) => r.status === 200,
      'graphql completed': (r) => r.status !== 0,
    });

    responseTimeTrend.add(duration);
    requestCounter.add(1);

    if (res.status !== 200) {
      errorRate.add(1);
    }
  } else if (requestType < 0.95) {
    // Write operations (stress consistency)
    const spreadsheetId = testSpreadsheets.length > 0
      ? testSpreadsheets[0].id
      : 'test-spreadsheet-1';

    const res = http.put(`${BASE_URL}/api/spreadsheets/${spreadsheetId}/cells`, JSON.stringify({
      updates: [{
        row: Math.floor(Math.random() * 100),
        col: Math.floor(Math.random() * 26),
        value: `stress-${Date.now()}-${Math.random()}`,
      }],
    }), {
      headers,
      tags: { name: 'Write_Operation' },
    });

    const duration = Date.now() - startTime;

    // Write operations more likely to fail under stress
    check(res, {
      'write accepted': (r) => [200, 201, 202, 503].includes(r.status),
      'write completed': (r) => r.status !== 0,
    });

    responseTimeTrend.add(duration);
    requestCounter.add(1);

    if (res.status === 503) {
      errorRate.add(1);
    }
  } else {
    // Analytics (heavy operations)
    const res = http.post(`${BASE_URL}/api/analytics/complex`, JSON.stringify({
      metrics: ['cpu', 'memory', 'io', 'network'],
      granularity: 'minute',
      timeframe: '1h',
    }), {
      headers,
      tags: { name: 'Analytics_Complex' },
    });

    const duration = Date.now() - startTime;

    check(res, {
      'analytics status is 200': (r) => r.status === 200,
      'analytics accepted': (r) => [200, 202, 503].includes(r.status),
    });

    responseTimeTrend.add(duration);
    requestCounter.add(1);

    if (res.status === 503) {
      errorRate.add(1);
    }
  }

  // Minimal sleep during stress test
  sleep(Math.random() * 0.5 + 0.1); // 0.1-0.6 seconds
}

export function teardown(data) {
  console.log('');
  console.log('STRESS TEST COMPLETED');
  console.log('');
  console.log('Analysis Checklist:');
  console.log('  [ ] Breaking point identified');
  console.log('  [ ] Graceful degradation observed');
  console.log('  [ ] Failure modes documented');
  console.log('  [ ] Recovery capability verified');
  console.log('  [ ] Resource limits identified');
  console.log('  [ ] Bottleneck components isolated');
  console.log('');
  console.log('Review Grafana dashboards for:');
  console.log('  - Error rate progression');
  console.log('  - Response time degradation');
  console.log('  - Resource exhaustion points');
  console.log('  - Connection pool limits');
  console.log('  - Database query performance');
  console.log('  - Cache effectiveness');
  console.log('');
  console.log('Generate recommendations for:');
  console.log('  - Capacity planning');
  console.log('  - Auto-scaling thresholds');
  console.log('  - Load shedding strategies');
  console.log('  - Performance optimization');
}
