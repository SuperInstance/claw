import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTimeTrend = new Trend('response_time');
const requestCounter = new Counter('requests_total');

// Test configuration
export const options = {
  scenarios: {
    baseline_load: {
      executor: 'constant-vus',
      vus: 100,
      duration: '5m',
      gracefulStop: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<100', 'p(99)<200'], // Response time thresholds
    http_req_failed: ['rate<0.01'], // Error rate must be below 1%
    errors: ['rate<0.01'],
  },
};

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const API_KEY = __ENV.API_KEY || 'test-api-key';

// Test data
const testUsers = JSON.parse(open('../data/test-users.json')) || [];
const testSpreadsheets = JSON.parse(open('../data/test-spreadsheets.json')) || [];

export function setup() {
  // Setup code - generate test data if needed
  console.log('Setting up baseline load test...');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Virtual Users: 100`);
  console.log(`Duration: 5 minutes`);

  return {
    baseUrl: BASE_URL,
    apiKey: API_KEY,
  };
}

export default function(data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
    'X-Test-Scenario': 'baseline',
  };

  // Test 1: Health Check (10% of requests)
  if (Math.random() < 0.1) {
    const healthRes = http.get(`${BASE_URL}/health`, {
      headers,
      tags: { name: 'HealthCheck' },
    });

    check(healthRes, {
      'health status is 200': (r) => r.status === 200,
      'health response time < 50ms': (r) => r.timings.duration < 50,
    }) || errorRate.add(1);

    responseTimeTrend.add(healthRes.timings.duration);
    requestCounter.add(1);
  }

  // Test 2: GraphQL Query - List Spreadsheets (20% of requests)
  else if (Math.random() < 0.3) {
    const query = `
      query ListSpreadsheets($limit: Int, $offset: Int) {
        spreadsheets(limit: $limit, offset: $offset) {
          id
          name
          createdAt
          updatedAt
          owner {
            id
            name
          }
        }
      }
    `;

    const graphqlRes = http.post(`${BASE_URL}/graphql`, JSON.stringify({
      query,
      variables: { limit: 10, offset: 0 },
    }), {
      headers,
      tags: { name: 'GraphQL_ListSpreadsheets' },
    });

    check(graphqlRes, {
      'graphql status is 200': (r) => r.status === 200,
      'graphql has data': (r) => JSON.parse(r.body).data !== undefined,
      'graphql response time < 100ms': (r) => r.timings.duration < 100,
    }) || errorRate.add(1);

    responseTimeTrend.add(graphqlRes.timings.duration);
    requestCounter.add(1);
  }

  // Test 3: REST API - Get Spreadsheet (30% of requests)
  else if (Math.random() < 0.6) {
    const spreadsheetId = testSpreadsheets.length > 0
      ? testSpreadsheets[Math.floor(Math.random() * testSpreadsheets.length)].id
      : 'test-spreadsheet-1';

    const restRes = http.get(`${BASE_URL}/api/spreadsheets/${spreadsheetId}`, {
      headers,
      tags: { name: 'REST_GetSpreadsheet' },
    });

    check(restRes, {
      'rest status is 200': (r) => r.status === 200,
      'rest has data': (r) => JSON.parse(r.body).id !== undefined,
      'rest response time < 50ms': (r) => r.timings.duration < 50,
    }) || errorRate.add(1);

    responseTimeTrend.add(restRes.timings.duration);
    requestCounter.add(1);
  }

  // Test 4: Analytics Query (20% of requests)
  else if (Math.random() < 0.8) {
    const analyticsRes = http.get(`${BASE_URL}/api/analytics/dashboard`, {
      headers,
      tags: { name: 'Analytics_Dashboard' },
    });

    check(analyticsRes, {
      'analytics status is 200': (r) => r.status === 200,
      'analytics has metrics': (r) => JSON.parse(r.body).metrics !== undefined,
      'analytics response time < 200ms': (r) => r.timings.duration < 200,
    }) || errorRate.add(1);

    responseTimeTrend.add(analyticsRes.timings.duration);
    requestCounter.add(1);
  }

  // Test 5: Community API (20% of requests)
  else {
    const communityRes = http.get(`${BASE_URL}/api/community/posts`, {
      headers,
      tags: { name: 'Community_GetPosts' },
    });

    check(communityRes, {
      'community status is 200': (r) => r.status === 200,
      'community has posts': (r) => Array.isArray(JSON.parse(r.body).posts),
      'community response time < 150ms': (r) => r.timings.duration < 150,
    }) || errorRate.add(1);

    responseTimeTrend.add(communityRes.timings.duration);
    requestCounter.add(1);
  }

  // Small sleep to simulate real user behavior
  sleep(Math.random() * 2 + 1); // 1-3 seconds between requests
}

export function teardown(data) {
  console.log('Baseline load test completed');
  console.log('Check Grafana dashboard for detailed results');
}
