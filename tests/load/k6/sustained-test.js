import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTimeTrend = new Trend('response_time');
const requestCounter = new Counter('requests_total');
const memoryLeakDetector = new Trend('memory_over_time');

// Test configuration - 5,000 users for 1 hour to detect memory leaks
export const options = {
  scenarios: {
    sustained_load: {
      executor: 'constant-vus',
      vus: 5000,
      duration: '1h',
      gracefulStop: '1m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<100', 'p(99)<200'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
    http_reqs: ['rate>500'], // Minimum 500 requests/sec
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const API_KEY = __ENV.API_KEY || 'test-api-key';

const testUsers = JSON.parse(open('../data/test-users.json')) || [];
const testSpreadsheets = JSON.parse(open('../data/test-spreadsheets.json')) || [];

// Track memory usage over time
let requestCount = 0;
const memorySnapshots = [];

export function setup() {
  console.log('Setting up sustained load test...');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Virtual Users: 5,000`);
  console.log(`Duration: 1 hour`);
  console.log('Monitoring for:');
  console.log('  - Memory leaks');
  console.log('  - Connection pool exhaustion');
  console.log('  - Resource utilization');
  console.log('  - Performance degradation');

  return {
    baseUrl: BASE_URL,
    apiKey: API_KEY,
    startTime: Date.now(),
  };
}

export default function(data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
    'X-Test-Scenario': 'sustained',
  };

  requestCount++;

  // Capture memory usage every 1000 requests
  if (requestCount % 1000 === 0) {
    const currentTime = Date.now();
    const elapsedMinutes = (currentTime - data.startTime) / 60000;
    memorySnapshots.push({
      time: elapsedMinutes,
      requests: requestCount,
    });
    memoryLeakDetector.add(elapsedMinutes);
  }

  // Simulate realistic user session with multiple operations
  const sessionPhase = Math.random();

  if (sessionPhase < 0.25) {
    // Phase 1: Browse spreadsheets
    const res = http.get(`${BASE_URL}/api/spreadsheets?limit=20`, {
      headers,
      tags: { name: 'Browse' },
    });

    check(res, {
      'browse status is 200': (r) => r.status === 200,
      'browse response time < 100ms': (r) => r.timings.duration < 100,
    }) || errorRate.add(1);

    responseTimeTrend.add(res.timings.duration);
    requestCounter.add(1);
  } else if (sessionPhase < 0.50) {
    // Phase 2: View specific spreadsheet
    const spreadsheetId = testSpreadsheets.length > 0
      ? testSpreadsheets[Math.floor(Math.random() * testSpreadsheets.length)].id
      : `test-spreadsheet-${Math.floor(Math.random() * 100)}`;

    const res = http.get(`${BASE_URL}/api/spreadsheets/${spreadsheetId}`, {
      headers,
      tags: { name: 'ViewSpreadsheet' },
    });

    check(res, {
      'view status is 200': (r) => r.status === 200,
      'view response time < 50ms': (r) => r.timings.duration < 50,
    }) || errorRate.add(1);

    responseTimeTrend.add(res.timings.duration);
    requestCounter.add(1);
  } else if (sessionPhase < 0.75) {
    // Phase 3: Edit spreadsheet (write operation)
    const spreadsheetId = testSpreadsheets.length > 0
      ? testSpreadsheets[0].id
      : 'test-spreadsheet-1';

    const res = http.put(`${BASE_URL}/api/spreadsheets/${spreadsheetId}/cells`, JSON.stringify({
      updates: [
        {
          row: Math.floor(Math.random() * 100),
          col: Math.floor(Math.random() * 26),
          value: `sustained-test-${Date.now()}`,
        },
      ],
    }), {
      headers,
      tags: { name: 'EditCell' },
    });

    check(res, {
      'edit status is 200': (r) => r.status === 200,
      'edit response time < 100ms': (r) => r.timings.duration < 100,
    }) || errorRate.add(1);

    responseTimeTrend.add(res.timings.duration);
    requestCounter.add(1);
  } else {
    // Phase 4: Run analytics
    const res = http.post(`${BASE_URL}/api/analytics/query`, JSON.stringify({
      type: 'summary',
      timeframe: '1h',
    }), {
      headers,
      tags: { name: 'Analytics' },
    });

    check(res, {
      'analytics status is 200': (r) => r.status === 200,
      'analytics response time < 200ms': (r) => r.timings.duration < 200,
    }) || errorRate.add(1);

    responseTimeTrend.add(res.timings.duration);
    requestCounter.add(1);
  }

  // Simulate realistic user think time
  sleep(Math.random() * 5 + 2); // 2-7 seconds
}

export function teardown(data) {
  const elapsed = (Date.now() - data.startTime) / 60000;
  console.log('Sustained load test completed');
  console.log(`Duration: ${elapsed.toFixed(2)} minutes`);
  console.log(`Total requests: ${requestCount}`);
  console.log(`Average requests/sec: ${(requestCount / (elapsed / 60)).toFixed(2)}`);
  console.log('Memory snapshots collected:', memorySnapshots.length);
  console.log('Check for memory leaks in Grafana');
}
