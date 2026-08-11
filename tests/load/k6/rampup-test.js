import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTimeTrend = new Trend('response_time');
const requestCounter = new Counter('requests_total');
const throughputTrend = new Trend('throughput');

// Test configuration - Ramp from 100 to 10,000 users over 30 minutes
export const options = {
  scenarios: {
    ramp_up_load: {
      executor: 'ramping-vus',
      startVUs: 100,
      stages: [
        { duration: '5m', target: 500 },    // Ramp to 500 users
        { duration: '5m', target: 1000 },   // Ramp to 1,000 users
        { duration: '5m', target: 2500 },   // Ramp to 2,500 users
        { duration: '5m', target: 5000 },   // Ramp to 5,000 users
        { duration: '5m', target: 7500 },   // Ramp to 7,500 users
        { duration: '5m', target: 10000 },  // Ramp to 10,000 users
      ],
      gracefulRampDown: '5m',
      gracefulStop: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<100', 'p(99)<200'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
    http_reqs: ['rate>100'], // Minimum 100 requests/sec
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const API_KEY = __ENV.API_KEY || 'test-api-key';

const testUsers = JSON.parse(open('../data/test-users.json')) || [];
const testSpreadsheets = JSON.parse(open('../data/test-spreadsheets.json')) || [];

export function setup() {
  console.log('Setting up ramp-up load test...');
  console.log(`Target: ${BASE_URL}`);
  console.log('Ramp-up Schedule:');
  console.log('  0-5m:   100 -> 500 users');
  console.log('  5-10m:  500 -> 1,000 users');
  console.log('  10-15m: 1,000 -> 2,500 users');
  console.log('  15-20m: 2,500 -> 5,000 users');
  console.log('  20-25m: 5,000 -> 7,500 users');
  console.log('  25-30m: 7,500 -> 10,000 users');

  return {
    baseUrl: BASE_URL,
    apiKey: API_KEY,
  };
}

export default function(data) {
  const startTime = Date.now();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
    'X-Test-Scenario': 'rampup',
  };

  // Distribute requests across different endpoints
  const requestType = Math.random();

  if (requestType < 0.15) {
    // Health Check
    const res = http.get(`${BASE_URL}/health`, {
      headers,
      tags: { name: 'HealthCheck' },
    });

    check(res, {
      'health status is 200': (r) => r.status === 200,
      'health response time < 50ms': (r) => r.timings.duration < 50,
    }) || errorRate.add(1);

    responseTimeTrend.add(res.timings.duration);
    requestCounter.add(1);
  } else if (requestType < 0.35) {
    // GraphQL - List Spreadsheets
    const query = `
      query ListSpreadsheets($limit: Int, $offset: Int) {
        spreadsheets(limit: $limit, offset: $offset) {
          id
          name
          createdAt
          updatedAt
        }
      }
    `;

    const res = http.post(`${BASE_URL}/graphql`, JSON.stringify({
      query,
      variables: { limit: 10, offset: Math.floor(Math.random() * 100) },
    }), {
      headers,
      tags: { name: 'GraphQL_ListSpreadsheets' },
    });

    check(res, {
      'graphql status is 200': (r) => r.status === 200,
      'graphql has data': (r) => {
        try {
          return JSON.parse(r.body).data !== undefined;
        } catch {
          return false;
        }
      },
      'graphql response time < 100ms': (r) => r.timings.duration < 100,
    }) || errorRate.add(1);

    responseTimeTrend.add(res.timings.duration);
    requestCounter.add(1);
  } else if (requestType < 0.55) {
    // REST - Get Spreadsheet
    const spreadsheetId = testSpreadsheets.length > 0
      ? testSpreadsheets[Math.floor(Math.random() * testSpreadsheets.length)].id
      : `test-spreadsheet-${Math.floor(Math.random() * 1000)}`;

    const res = http.get(`${BASE_URL}/api/spreadsheets/${spreadsheetId}`, {
      headers,
      tags: { name: 'REST_GetSpreadsheet' },
    });

    check(res, {
      'rest status is 200': (r) => r.status === 200,
      'rest has data': (r) => {
        try {
          return JSON.parse(r.body).id !== undefined;
        } catch {
          return false;
        }
      },
      'rest response time < 50ms': (r) => r.timings.duration < 50,
    }) || errorRate.add(1);

    responseTimeTrend.add(res.timings.duration);
    requestCounter.add(1);
  } else if (requestType < 0.75) {
    // REST - Update Cell (Write Operation)
    const spreadsheetId = testSpreadsheets.length > 0
      ? testSpreadsheets[0].id
      : 'test-spreadsheet-1';

    const res = http.put(`${BASE_URL}/api/spreadsheets/${spreadsheetId}/cells`, JSON.stringify({
      updates: [
        {
          row: Math.floor(Math.random() * 100),
          col: Math.floor(Math.random() * 26),
          value: Math.random().toString(36).substring(7),
        },
      ],
    }), {
      headers,
      tags: { name: 'REST_UpdateCell' },
    });

    check(res, {
      'update status is 200': (r) => r.status === 200,
      'update response time < 100ms': (r) => r.timings.duration < 100,
    }) || errorRate.add(1);

    responseTimeTrend.add(res.timings.duration);
    requestCounter.add(1);
  } else if (requestType < 0.90) {
    // Analytics Dashboard
    const res = http.get(`${BASE_URL}/api/analytics/dashboard`, {
      headers,
      tags: { name: 'Analytics_Dashboard' },
    });

    check(res, {
      'analytics status is 200': (r) => r.status === 200,
      'analytics has metrics': (r) => {
        try {
          return JSON.parse(r.body).metrics !== undefined;
        } catch {
          return false;
        }
      },
      'analytics response time < 200ms': (r) => r.timings.duration < 200,
    }) || errorRate.add(1);

    responseTimeTrend.add(res.timings.duration);
    requestCounter.add(1);
  } else {
    // Community Posts
    const res = http.get(`${BASE_URL}/api/community/posts?limit=20`, {
      headers,
      tags: { name: 'Community_GetPosts' },
    });

    check(res, {
      'community status is 200': (r) => r.status === 200,
      'community has posts': (r) => {
        try {
          return Array.isArray(JSON.parse(r.body).posts);
        } catch {
          return false;
        }
      },
      'community response time < 150ms': (r) => r.timings.duration < 150,
    }) || errorRate.add(1);

    responseTimeTrend.add(res.timings.duration);
    requestCounter.add(1);
  }

  const endTime = Date.now();
  throughputTrend.add(endTime - startTime);

  // Variable sleep to simulate realistic user behavior
  sleep(Math.random() * 3 + 0.5); // 0.5-3.5 seconds
}

export function teardown(data) {
  console.log('Ramp-up load test completed');
  console.log('Monitoring system behavior during load increase...');
  console.log('Check Grafana for detailed analysis');
}
