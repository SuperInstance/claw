# Spreadsheet Moment Platform - Comprehensive Test Suite

## Overview

This test suite provides comprehensive coverage for the Spreadsheet Moment platform with **200+ integration tests** and **850+ unit tests** targeting **82%+ code coverage** across all major modules.

## Integration Test Suite

The integration test suite provides end-to-end testing for:

- **GraphQL API + Database** (30+ tests) - Full CRUD operations with PostgreSQL
- **Analytics + Real-time Subscriptions** (30+ tests) - Event tracking and WebSocket subscriptions
- **Authentication + Authorization** (30+ tests) - JWT flow, RBAC, permissions
- **i18n + Community Features** (30+ tests) - Multilingual content and community interactions
- **Security + Rate Limiting** (30+ tests) - Protection mechanisms and security policies
- **Performance + Caching** (25+ tests) - Cache strategies and optimization
- **Accessibility + React Components** (25+ tests) - ARIA attributes and accessibility compliance

## Unit Test Suite

This unit test suite provides comprehensive module-level testing with **850+ tests**:

## Test Statistics

### Integration Tests

| Module | Test Cases | Status |
|--------|-----------|--------|
| **GraphQL API + Database** | 30+ | ✅ Complete |
| **Analytics + Subscriptions** | 30+ | ✅ Complete |
| **Authentication + Authorization** | 30+ | ✅ Complete |
| **i18n + Community** | 30+ | ✅ Complete |
| **Security + Rate Limiting** | 30+ | Pending |
| **Performance + Caching** | 25+ | Pending |
| **Accessibility + React** | 25+ | Pending |
| **Total Integration Tests** | **200+** | **In Progress** |

### Unit Tests

| Module | Test Files | Test Cases | Target Coverage |
|--------|-----------|-----------|-----------------|
| **Analytics** | 4 | 120+ | 85% |
| **i18n** | 3 | 100+ | 80% |
| **Accessibility** | 4 | 120+ | 85% |
| **Performance** | 4 | 120+ | 80% |
| **Security** | 5 | 130+ | 90% |
| **API v2** | 5 | 140+ | 85% |
| **Community** | 4 | 140+ | 80% |
| **Total** | **29** | **850+** | **82%+** |

## Project Structure

```
tests/
├── integration/                   # Integration tests
│   ├── graphql/                  # GraphQL API + Database tests
│   │   └── spreadsheet.test.ts   # CRUD operations (30+ tests)
│   ├── analytics/                # Analytics & subscriptions tests
│   │   └── analytics.test.ts     # Event tracking & WebSocket (30+ tests)
│   ├── auth/                     # Authentication & authorization tests
│   │   └── auth-flow.test.ts     # JWT flow & RBAC (30+ tests)
│   ├── i18n/                     # i18n & community tests
│   │   └── i18n-community.test.ts # Multilingual features (30+ tests)
│   ├── security/                 # Security & rate limiting tests
│   ├── performance/              # Performance & caching tests
│   ├── accessibility/            # Accessibility tests
│   └── database/                 # Database-specific tests
├── unit/                         # Unit tests
│   ├── analytics/                # Analytics module tests
│   ├── i18n/                     # Internationalization tests
│   ├── accessibility/            # Accessibility tests
│   ├── performance/              # Performance tests
│   ├── security/                 # Security tests
│   ├── api/                      # API tests
│   └── community/                # Community tests
├── helpers/                      # Test helpers
│   ├── api.ts                    # API test helpers & GraphQL builders
│   └── websocket.ts              # WebSocket test utilities
├── database/                     # Database utilities
│   ├── client.ts                 # Database test client
│   └── seeds.ts                  # Test data generators
├── fixtures/                     # Test fixtures
│   └── index.ts                  # Pre-built test fixtures
├── mocks/                        # Mock objects
├── e2e/                          # End-to-end scenario tests
├── setup.ts                      # Test setup file
├── global-setup.ts               # Global test setup
├── global-teardown.ts            # Global test teardown
└── README.md                     # This file
```

## Installation

```bash
npm install --save-dev
```

### Dependencies

- **jest**: Testing framework
- **ts-jest**: TypeScript preprocessor
- **@types/jest**: TypeScript definitions
- **@testing-library/react**: Component testing
- **@testing-library/jest-dom**: Custom matchers
- **supertest**: HTTP assertion library
- **pg**: PostgreSQL client
- **ioredis**: Redis client
- **ws**: WebSocket client
- **jsonwebtoken**: JWT utilities
- **bcrypt**: Password hashing

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Integration Tests Only

```bash
npm run test:integration
```

### Run Specific Integration Test Suite

```bash
# GraphQL API tests
npm test -- tests/integration/graphql

# Analytics tests
npm test -- tests/integration/analytics

# Authentication tests
npm test -- tests/integration/auth

# i18n tests
npm test -- tests/integration/i18n
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Module Tests

```bash
# Analytics tests
npm run test:analytics

# i18n tests
npm run test:i18n

# Accessibility tests
npm run test:accessibility

# Performance tests
npm run test:performance

# Security tests
npm run test:security

# API tests
npm run test:api

# Community tests
npm run test:community
```

### Run Tests in CI/CD

```bash
npm run test:ci
```

### Run Tests with Debug Output

```bash
npm run test:verbose
```

## Configuration

### Jest Configuration

Located in `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  coverageThreshold: {
    global: {
      branches: 82,
      functions: 82,
      lines: 82,
      statements: 82
    }
  }
};
```

### Environment Variables

Create a `.env.test` file:

```env
NODE_ENV=test
DATABASE_URL=test://localhost
REDIS_URL=redis://localhost:6379/1
API_KEY=test-api-key
SECRET_KEY=test-secret-key
JWT_SECRET=test-jwt-secret
ENCRYPTION_KEY=test-encryption-key-32-bytes
```

## Testing Guidelines

### Writing Unit Tests

1. **Test Structure**: Use describe/it pattern
2. **Test Naming**: Be descriptive and clear
3. **Test Isolation**: Each test should be independent
4. **Test Coverage**: Aim for 82%+ coverage
5. **Test Speed**: Tests should run quickly

### Example Test Structure

```typescript
describe('ModuleName', () => {
  let instance: ModuleName;

  beforeEach(() => {
    // Setup before each test
    instance = new ModuleName();
  });

  afterEach(() => {
    // Cleanup after each test
    instance.cleanup();
  });

  describe('methodName', () => {
    it('should do something', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = instance.methodName(input);

      // Assert
      expect(result).toBeDefined();
    });

    it('should handle errors', () => {
      // Test error cases
      expect(() => {
        instance.methodName(invalidInput);
      }).toThrow();
    });
  });
});
```

## Integration Test Utilities

### Database Client

```typescript
import { getTestDb } from './database/client';

// Get database client
const db = getTestDb();

// Start transaction for test isolation
await db.startTransaction();

// Execute queries
const result = await db.query('SELECT * FROM test_schema.users');

// Seed test data
await db.seedData({
  users: [testUser],
  spreadsheets: [testSpreadsheet],
});

// Rollback after test
await db.rollbackTransaction();

// Close connection
await db.close();
```

### API Test Client

```typescript
import { ApiTestClient, GraphQLMutations, GraphQLQueries } from './helpers/api';

// Create client
const apiClient = new ApiTestClient(app);

// Authenticate user
await apiClient.authenticateUser(testUser);

// Execute query
const response = await apiClient.query(GraphQLQueries.getMe);

// Execute mutation
const response = await apiClient.mutate(
  GraphQLMutations.createSpreadsheet('Test Sheet')
);

// Expect error
await apiClient.expectGraphQLError(query, variables, 'Error message');
```

### WebSocket Test Client

```typescript
import { WebSocketTestClient } from './helpers/websocket';

// Create client
const wsClient = new WebSocketTestClient('ws://localhost:8080');

// Connect with authentication
await wsClient.connect(testUser);

// Subscribe to updates
await wsClient.subscribe(GraphQLSubscriptions.spreadsheetUpdated(sheetId));

// Wait for message
const message = await wsClient.waitForMessage('data', 5000);

// Send message
wsClient.send('test_event', { data: 'value' });

// Disconnect
wsClient.disconnect();
```

### Test Data Fixtures

```typescript
import {
  generateTestUser,
  generateTestSpreadsheet,
  generateTestPost,
  getAdminUser,
  getDiverseTestUsers,
} from './database/seeds';

// Generate test user
const user = await generateTestUser({
  email: 'test@example.com',
  role: 'admin',
});

// Generate test spreadsheet
const sheet = generateTestSpreadsheet({
  owner_id: user.id,
  name: 'Test Sheet',
});

// Generate diverse users for i18n testing
const users = await getDiverseTestUsers();
```

## Unit Test Utilities

### Test Helpers

Use the provided test helpers for consistency:

```typescript
import {
  createMockUser,
  createMockRequest,
  createMockResponse,
  generateMockMetrics,
  flushPromises,
} from '@tests/helpers/test-helpers';

import {
  renderWithProviders,
  renderWithA11y,
  renderWithAuth,
} from '@tests/helpers/render-helpers';
```

### Mock Objects

Use the provided mock objects:

```typescript
import { createMockDatabase } from '@tests/mocks/database.mock';
import { mockGraphQLContext, mockDataLoader } from '@tests/mocks/api.mock';
```

## Coverage Reports

Coverage reports are generated in the `coverage/` directory:

- `coverage/index.html` - Interactive HTML report
- `coverage/lcov.info` - LCOV format for CI/CD
- `coverage/coverage-final.json` - JSON format

### View Coverage Report

```bash
npm run test:coverage
open coverage/index.html
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
test:
  stage: test
  image: node:18

  script:
    - npm ci
    - npm run test:ci

  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

## Best Practices

### DO ✅

1. **Write tests first** (TDD approach)
2. **Keep tests simple** and focused
3. **Use descriptive names** for tests
4. **Mock external dependencies**
5. **Test both happy and error paths**
6. **Include edge cases**
7. **Test boundary conditions**
8. **Use test helpers** for common operations
9. **Keep tests fast** (< 100ms per test)
10. **Run tests locally** before pushing

### DON'T ❌

1. **Don't test implementation details**
2. **Don't write brittle tests**
3. **Don't skip tests** without justification
4. **Don't use setTimeout** unless necessary
5. **Don't test third-party libraries**
6. **Don't write complex test logic**
7. **Don't hardcode test data** - use fixtures
8. **Don't ignore test failures**
9. **Don't commit commented-out tests**
10. **Don't write slow integration tests** as unit tests

## Test Metrics

### Coverage Targets

- **Global Coverage**: 82%+
- **Analytics**: 85%
- **i18n**: 80%
- **Accessibility**: 85%
- **Performance**: 80%
- **Security**: 90%
- **API**: 85%
- **Community**: 80%

### Test Execution Time

- **Target**: < 5 minutes total
- **Per Module**: < 30 seconds
- **Per Test**: < 100ms

### Test Health Metrics

- **Pass Rate**: 100%
- **Flaky Tests**: 0%
- **Skipped Tests**: < 5%
- **Timeout Rate**: < 1%

## Troubleshooting

### Tests Fail Locally

1. Clear Jest cache: `npm test -- --clearCache`
2. Update snapshots: `npm test -- -u`
3. Run with verbose output: `npm run test:verbose`

### Coverage is Low

1. Check coverage report: `open coverage/index.html`
2. Identify uncovered lines
3. Add tests for uncovered code
4. Re-run coverage report

### Tests are Slow

1. Check for unnecessary delays
2. Use mocks instead of real dependencies
3. Optimize test setup/teardown
4. Run tests in parallel

### CI/CD Tests Fail

1. Check environment variables
2. Verify dependencies are installed
3. Check for platform-specific issues
4. Review CI/CD logs

## Resources

### Documentation

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [TypeScript Jest](https://kulshekhar.github.io/ts-jest/)

### Internal Resources

- `CLAUDE.md` - Project documentation
- `docs/QUICK_REFERENCE.md` - Quick reference guide
- `docs/API_REFERENCE.md` - API documentation

## Support

For questions or issues:

1. Check existing tests for examples
2. Review test helpers and mocks
3. Consult documentation
4. Ask the team

## Contributing

When adding new features:

1. Write tests first (TDD)
2. Ensure 82%+ coverage
3. Run test suite locally
4. Update documentation
5. Submit pull request

---

**Last Updated**: 2025-03-14
**Test Suite Version**: 1.0.0
**Total Tests**: 850+
**Coverage Target**: 82%+
