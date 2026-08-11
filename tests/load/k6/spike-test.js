import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTimeTrend = new Trend('response_time');
const requestCounter = new Counter('requests_total');
const recoveryTime = new Trend('recovery_time');

// Test configuration - Spike from 1,000 to 10,000 users in 1 minute
export const options = {
  scenarios: {
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 1000,
      stages: [
        { duration: '2m', target: 1000 },   // Baseline: 1,000 users
        { duration: '1m', target: 10000 },  // SPIKE: Jump to 10,000 users
        { duration: '3m', target: 10000 },  // Sustain: Hold at 10,000
        { duration: '2m', target: 1000 },   // Recovery: Drop back to 1,000
        { duration: '2m', target: 1000 },   // Stabilization: Hold at 1,000
      ],
      gracefulRampDown: '1m',
      gracefulStop: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<150', 'p(99)<300'], // Slightly relaxed during spike
    http_req_failed: ['rate<0.05'], // Allow up to 5% errors during spike
    errors: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const API_KEY = __ENV.API_KEY || 'test-api-key';

const testUsers = JSON.parse(open('../data/test-users.json')) || [];
const testSpreadsheets = JSON.parse(open('../data/test-spreadsheets.json')) || [];

let spikeStartTime = null;
let spikeDetected = false;

export function setup() {
  console.log('Setting up spike test...');
  console.log(`Target: ${BASE_URL}`);
  console.log('Spike Test Schedule:');
  console.log('  0-2m:   Baseline (1,000 users)');
  console.log('  2-3m:   SPIKE (1,000 -> 10,000 users)');
  console.log('  3-6m:   Sustain spike (10,000 users)');
  console.log('  6-8m:   Recovery (10,000 -> 1,000 users)');
  console.log('  8-10m:  Stabilization (1,000 users)');
  console.log('');
  console.log('Monitoring:');
  console.log('  - Auto-scaling triggers');
  console.log('  - Queue depth');
  console.log('  - Request rejection rate');
  console.log('  - Recovery time');

  return {
    baseUrl: BASE_URL,
    apiKey: API_KEY,
    spikeStartExpected: new Date(Date.now() + 2 * 60 * 1000), // Spike starts at 2 minutes
  };
}

export default function(data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
    'X-Test-Scenario': 'spike',
  };

  // Detect spike start
  if (!spikeDetected && Date.now() >= data.spikeStartExpected.getTime()) {
    spikeDetected = true;
    spikeStartTime = Date.now();
    console.log('SPIKE DETECTED - Tracking recovery...');
  }

  // Track recovery time after spike
  if (spikeDetected && spikeStartTime) {
    const timeSinceSpike = Date.now() - spikeStartTime;
    recoveryTime.add(timeSinceSpike);
  }

  // Simulate urgent user activity during spike
  const urgentAction = Math.random();

  if (urgentAction < 0.30) {
    // Quick reads (most common during spike)
    const spreadsheetId = testSpreadsheets.length > 0
      ? testSpreadsheets[Math.floor(Math.random() * Math.min(10, testSpreadsheets.length))].id
      : `test-spreadsheet-${Math.floor(Math.random() * 10)}`;

    const res = http.get(`${BASE_URL}/api/spreadsheets/${spreadsheetId}`, {
      headers,
      tags: { name: 'Urgent_Read' },
    });

    check(res, {
      'urgent read status is 200': (r) => r.status === 200,
      'urgent read response time < 100ms': (r) => r.timings.duration < 100,
    }) || errorRate.add(1);

    responseTimeTrend.add(res.timings.duration);
    requestCounter.add(1);
  } else if (urgentAction < 0.60) {
    // List views
    const res = http.get(`${BASE_URL}/api/spreadsheets?limit=10`, {
      headers,
      tags: { name: 'List_View' },
    });

    check(res, {
      'list status is 200': (r) => r.status === 200,
      'list response time < 150ms': (r) => r.timings.duration < 150,
    }) || errorRate.add(1);

    responseTimeTrend.add(res.timings.duration);
    requestCounter.add(1);
  } else if (urgentAction < 0.80) {
    // GraphQL queries
    const query = `
      query GetSpreadsheet($id: ID!) {
        spreadsheet(id: $id) {
          id
          name
          cells(limit: 50) {
            row
            col
            value
          }
        }
      }
    `;

    const spreadsheetId = testSpreadsheets.length > 0
      ? testSpreadsheets[0].id
      : 'test-spreadsheet-1';

    const res = http.post(`${BASE_URL}/graphql`, JSON.stringify({
      query,
      variables: { id: spreadsheetId },
    }), {
      headers,
      tags: { name: 'GraphQL_Query' },
    });

    check(res, {
      'graphql status is 200': (r) => r.status === 200,
      'graphql response time < 200ms': (r) => r.timings.duration < 200,
    }) || errorRate.add(1);

    responseTimeTrend.add(res.timings.duration);
    requestCounter.add(1);
  } else if (urgentAction < 0.95) {
    // Analytics dashboard
    const res = http.get(`${BASE_URL}/api/analytics/summary`, {
      headers,
      tags: { name: 'Analytics_Summary' },
    });

    check(res, {
      'analytics status is 200': (r) => r.status === 200,
      'analytics response time < 300ms': (r) => r.timings.duration < 300,
    }) || errorRate.add(1);

    responseTimeTrend.add(res.timings.duration);
    requestCounter.add(1);
  } else {
    // Write operations (least common during spike)
    const spreadsheetId = testSpreadsheets.length > 0
      ? testSpreadsheets[0].id
      : 'test-spreadsheet-1';

    const res = http.put(`${BASE_URL}/api/spreadsheets/${spreadsheetId}/cells`, JSON.stringify({
      updates: [{
        row: Math.floor(Math.random() * 50),
        col: Math.floor(Math.random() * 26),
        value: `spike-${Date.now()}`,
      }],
    }), {
      headers,
      tags: { name: 'Write_Operation' },
    });

    // More lenient checks for writes during spike
    check(res, {
      'write status is 200 or 202': (r) => r.status === 200 || r.status === 202,
      'write response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);

    responseTimeTrend.add(res.timings.duration);
    requestCounter.add(1);
  }

  // Reduced think time during spike
  sleep(Math.random() * 1 + 0.5); // 0.5-1.5 seconds
}

export function teardown(data) {
  console.log('Spike test completed');
  console.log('Key metrics to review:');
  console.log('  1. Auto-scaling response time');
  console.log('  2. Request queue depth');
  console.log('  3. Error rate during spike');
  console.log('  4. Recovery time after spike');
  console.log('  5. Resource utilization');
  console.log('');
  console.log('Check Grafana dashboard for detailed analysis');
}
