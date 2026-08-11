# Contributing to SuperInstance Examples

Thank you for your interest in contributing to SuperInstance example applications!

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Documentation](#documentation)
7. [Pull Request Process](#pull-request-process)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/superinstance-examples-apps.git
cd superinstance-examples-apps
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Write code following our standards
- Add tests for new functionality
- Update documentation

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Run tests
npm test

# Build
npm run build
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

Commit message format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test changes
- `refactor:` Code refactoring
- `style:` Code style changes
- `chore:` Maintenance tasks

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
# Create pull request on GitHub
```

## Coding Standards

### TypeScript

```typescript
// Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// Use types for unions/aliases
type Status = 'pending' | 'active' | 'inactive';

// Use async/await over promises
async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// Handle errors
try {
  const user = await getUser(id);
  return user;
} catch (error) {
  console.error('Failed to get user:', error);
  throw error;
}
```

### React

```tsx
// Use functional components with hooks
import { useState, useEffect } from 'react';

interface Props {
  userId: string;
}

export const UserProfile: React.FC<Props> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getUser(userId).then(setUser);
  }, [userId]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};
```

### Naming Conventions

```typescript
// Files: kebab-case
user-profile.tsx
api-service.ts

// Variables: camelCase
const userName = 'John';
const isActive = true;

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';

// Classes: PascalCase
class UserService {}

// Interfaces: PascalCase
interface UserProfile {}

// Types: PascalCase
type UserStatus = 'active' | 'inactive';
```

### Error Handling

```typescript
// Always handle errors
async function getData() {
  try {
    const data = await api.fetch();
    return data;
  } catch (error) {
    if (error instanceof NetworkError) {
      logger.error('Network error:', error);
      throw new ApiError('Failed to fetch data', error);
    }
    throw error;
  }
}
```

### Logging

```typescript
import logger from './logger';

// Use structured logging
logger.info('User logged in', {
  userId: user.id,
  timestamp: new Date().toISOString()
});

// Log errors with context
logger.error('Failed to process payment', {
  userId: user.id,
  amount: payment.amount,
  error: error.message,
  stack: error.stack
});
```

## Testing Guidelines

### Unit Tests

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('UserService', () => {
  it('should fetch user by ID', async () => {
    const mockUser = { id: '1', name: 'John' };
    vi.mock('./api', () => ({
      fetch: vi.fn().mockResolvedValue(mockUser)
    }));

    const user = await getUser('1');
    expect(user).toEqual(mockUser);
  });
});
```

### Integration Tests

```typescript
describe('API Integration', () => {
  it('should create and fetch user', async () => {
    const created = await createUser({
      name: 'John',
      email: 'john@example.com'
    });

    const fetched = await getUser(created.id);
    expect(fetched).toEqual(created);
  });
});
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test('user can sign up', async ({ page }) => {
  await page.goto('/signup');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});
```

## Documentation

### Code Comments

```typescript
/**
 * Fetches a user by their ID
 * @param id - The user's ID
 * @returns The user object
 * @throws {ApiError} If the user is not found
 * @example
 * ```ts
 * const user = await getUser('123');
 * ```
 */
async function getUser(id: string): Promise<User> {
  // Implementation
}
```

### README Files

Each example should have a README with:
- Overview
- Features
- Tech stack
- Installation instructions
- Usage examples
- API reference
- Testing instructions
- Deployment guide

### API Documentation

Use OpenAPI/Swagger for REST APIs:

```yaml
openapi: 3.0.0
info:
  title: Analytics API
  version: 1.0.0
paths:
  /api/agents:
    get:
      summary: List all agents
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Agent'
```

## Pull Request Process

### 1. Before Creating PR

- [ ] Code follows style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] No merge conflicts

### 2. PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] All tests passing

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Changes require update to README
```

### 3. Review Process

1. Automated checks must pass
2. At least one approval required
3. Address all review comments
4. Squash commits if needed
5. Merge when approved

## Performance Guidelines

### Optimization

```typescript
// Use pagination
async function getUsers(page: number, limit: number) {
  return db.users.findMany({
    skip: page * limit,
    take: limit
  });
}

// Cache expensive operations
const cache = new Map();
async function getExpensiveData(key: string) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const data = await fetchExpensiveData(key);
  cache.set(key, data);
  return data;
}

// Use batch operations
await Promise.all(users.map(user => processUser(user)));
```

### Memory Management

```typescript
// Clean up resources
useEffect(() => {
  const subscription = subscribeToEvents();
  return () => subscription.unsubscribe();
}, []);

// Clear intervals
const interval = setInterval(callback, 1000);
return () => clearInterval(interval);
```

## Security Guidelines

### Input Validation

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(120)
});

function validateUser(data: unknown) {
  return UserSchema.parse(data);
}
```

### Authentication

```typescript
// Always verify authentication
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Verify token
  next();
}
```

### SQL Injection Prevention

```typescript
// Use parameterized queries
async function getUser(id: string) {
  return db.query('SELECT * FROM users WHERE id = $1', [id]);
}
```

## Getting Help

- GitHub Issues: https://github.com/SuperInstance/superinstance-examples-apps/issues
- Discord: https://discord.gg/superinstance
- Email: support@superinstance.ai

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
