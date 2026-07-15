# Developer Sandbox Environment

Set up and configure your local development sandbox for testing SuperInstance APIs and integrations.

## Quick Start

### 1. Install Dependencies

```bash
# Clone the repository
git clone https://github.com/SuperInstance/polln.git
cd polln

# Install Node.js dependencies
npm install

# Install Python dependencies (optional)
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your API keys and configuration
nano .env
```

### 3. Start Local Development Server

```bash
# Start VitePress documentation site
npm run docs:dev

# Start local API mock server (optional)
npm run mock-server
```

The documentation site will be available at `http://localhost:5173`

---

## Environment Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# API Configuration
SUPERINSTANCE_API_KEY=your_api_key_here
SUPERINSTANCE_API_URL=https://api.superinstance.ai/v1
SUPERINSTANCE_WS_URL=wss://api.superinstance.ai/v1

# Development Mode
NODE_ENV=development
MOCK_API=true

# Feature Flags
ENABLE_WEBSOCKET=true
ENABLE_METRICS=true
ENABLE_DEBUG=true

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=60

# Logging
LOG_LEVEL=debug
LOG_FORMAT=json

# Analytics (optional)
ANALYTICS_ENABLED=false
```

### API Key Management

#### Generate Test API Key

```bash
# Using the CLI
npm run generate-api-key

# Or via API
curl -X POST "https://api.superinstance.ai/v1/api-keys" \
  -H "Authorization: Bearer YOUR_ACCOUNT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Development Key",
    "scopes": ["instances:read", "instances:write"],
    "expiresIn": 86400000
  }'
```

#### API Key Scopes

| Scope | Description |
|-------|-------------|
| `instances:read` | Read instance data |
| `instances:write` | Create/update instances |
| `instances:delete` | Delete instances |
| `messages:send` | Send messages |
| `system:admin` | Administrative access |

#### Secure API Key Storage

```javascript
// Load API key from environment
const apiKey = process.env.SUPERINSTANCE_API_KEY

// Or use secure storage
import { Keychain } from 'keychain-tool'

const keychain = new Keychain()
const apiKey = await keychain.getPassword('superinstance', 'api-key')
```

---

## Mock API Server

### Start Mock Server

```bash
npm run mock-server
```

The mock server will run on `http://localhost:3000` and provide realistic responses for testing.

### Mock Server Configuration

Create `mock-server.config.js`:

```javascript
module.exports = {
  port: 3000,
  latency: 100, // Simulate network latency (ms)
  errorRate: 0.05, // 5% error rate for testing
  data: {
    instances: [
      {
        id: 'mock_instance_1',
        type: 'learning_agent',
        name: 'Mock Agent 1',
        state: 'running',
        confidence: { score: 0.87 }
      }
    ]
  }
}
```

### Custom Mock Responses

```javascript
// mock-server.config.js
module.exports = {
  endpoints: {
    '/instances': {
      GET: (req, res) => {
        return {
          success: true,
          data: {
            items: generateMockInstances(10),
            total: 10
          }
        }
      },
      POST: (req, res) => {
        return {
          success: true,
          data: {
            id: `mock_${Date.now()}`,
            ...req.body
          }
        }
      }
    }
  }
}
```

---

## Local Development Tools

### API Testing with cURL

```bash
# List instances
curl -X GET "http://localhost:3000/v1/instances" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Create instance
curl -X POST "http://localhost:3000/v1/instances" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "learning_agent",
    "name": "Test Agent"
  }'
```

### Testing with Postman

1. Import the Postman collection: `docs/postman-collection.json`
2. Set environment variables:
   - `base_url`: `http://localhost:3000/v1`
   - `api_key`: Your test API key
3. Run requests from the collection

### Testing with REST Client

Create `test.http`:

```http
### List instances
GET {{base_url}}/instances
Authorization: Bearer {{api_key}}

### Create instance
POST {{base_url}}/instances
Authorization: Bearer {{api_key}}
Content-Type: application/json

{
  "type": "learning_agent",
  "name": "Test Agent"
}

### Get instance
GET {{base_url}}/instances/{{instanceId}}
Authorization: Bearer {{api_key}}
```

---

## WebSocket Testing

### Test WebSocket Connection

```javascript
// test-websocket.js
const WebSocket = require('ws')

const ws = new WebSocket('ws://localhost:3000/v1/instances/mock_1/realtime?token=TEST_TOKEN')

ws.on('open', () => {
  console.log('Connected to WebSocket')

  // Send test message
  ws.send(JSON.stringify({
    type: 'data',
    payload: { value: 42 }
  }))
})

ws.on('message', (data) => {
  console.log('Received:', data.toString())
})

ws.on('error', (error) => {
  console.error('WebSocket error:', error)
})

ws.on('close', () => {
  console.log('WebSocket closed')
})
```

### Run WebSocket Test

```bash
node test-websocket.js
```

---

## Integration Testing

### JavaScript Testing

```javascript
// tests/integration.test.js
import { describe, it, expect } from 'vitest'
import { SuperInstanceClient } from '@superinstance/sdk'

describe('SuperInstance API', () => {
  const client = new SuperInstanceClient({
    apiKey: process.env.TEST_API_KEY,
    baseURL: 'http://localhost:3000/v1'
  })

  it('should create an instance', async () => {
    const instance = await client.instances.create({
      type: 'learning_agent',
      name: 'Test Agent'
    })

    expect(instance.id).toBeDefined()
    expect(instance.type).toBe('learning_agent')
  })

  it('should list instances', async () => {
    const instances = await client.instances.list()

    expect(instances.items).toBeInstanceOf(Array)
  })

  it('should get instance details', async () => {
    const instance = await client.instances.get('mock_1')

    expect(instance.id).toBe('mock_1')
    expect(instance.state).toBeDefined()
  })
})
```

### Run Tests

```bash
npm test
```

---

## Debugging

### Enable Debug Logging

```javascript
const client = new SuperInstanceClient({
  apiKey: process.env.API_KEY,
  debug: true // Enable detailed logging
})
```

### View API Requests

All API requests are logged in the console when debug mode is enabled:

```
[SuperInstance] GET /instances
[SuperInstance] Request: {
  headers: { Authorization: 'Bearer ***' },
  params: { limit: 50 }
}
[SuperInstance] Response: {
  success: true,
  data: { items: [...], total: 10 }
}
```

### Network Inspection

Use browser DevTools or a proxy to inspect API requests:

```bash
# Start with proxy
npm run dev -- --proxy http://localhost:8080
```

---

## Performance Testing

### Load Testing with Artillery

Create `load-test.yml`:

```yaml
config:
  target: 'http://localhost:3000/v1'
  phases:
    - duration: 60
      arrivalRate: 10
  defaults:
    headers:
      Authorization: 'Bearer YOUR_API_KEY'

scenarios:
  - name: 'List Instances'
    flow:
      - get:
          url: '/instances'
```

### Run Load Test

```bash
artillery run load-test.yml
```

---

## Continuous Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test
        env:
          SUPERINSTANCE_API_KEY: ${{ secrets.TEST_API_KEY }}

      - name: Build documentation
        run: npm run docs:build
```

---

## Troubleshooting

### Common Issues

**Port already in use**

```bash
# Find process using port 5173
lsof -i :5173

# Kill process
kill -9 <PID>
```

**API key not working**

- Verify API key is correct
- Check API key hasn't expired
- Ensure API key has required scopes

**CORS errors**

- Configure CORS in mock server
- Use correct origin in requests

**WebSocket connection fails**

- Verify WebSocket URL is correct
- Check JWT token is valid
- Ensure instance is in running state

### Debug Mode

Enable debug mode for detailed logging:

```bash
DEBUG=superinstance:* npm run dev
```

---

## Best Practices

### 1. Use Environment Variables

Never hardcode API keys or secrets:

```javascript
// Bad
const apiKey = 'sk_live_abc123'

// Good
const apiKey = process.env.SUPERINSTANCE_API_KEY
```

### 2. Implement Error Handling

Always handle errors gracefully:

```javascript
try {
  const instance = await client.instances.create(data)
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    await retryWithBackoff(() => client.instances.create(data))
  } else {
    console.error('Error:', error.message)
  }
}
```

### 3. Use Test Data

Create consistent test data:

```javascript
const testData = {
  instance: {
    type: 'learning_agent',
    name: 'Test Agent',
    configuration: {
      resources: { cpu: 10, memory: 128 }
    }
  }
}
```

### 4. Clean Up Resources

Always clean up test resources:

```javascript
afterEach(async () => {
  // Delete test instances
  const instances = await client.instances.list()
  for (const instance of instances.items) {
    if (instance.name.startsWith('Test_')) {
      await client.instances.delete(instance.id)
    }
  }
})
```

### 5. Mock External Dependencies

Mock external services for faster, reliable tests:

```javascript
vi.mock('@superinstance/sdk', () => ({
  SuperInstanceClient: vi.fn().mockImplementation(() => ({
    instances: {
      create: vi.fn().mockResolvedValue({ id: 'mock_1' })
    }
  }))
}))
```

---

## Next Steps

- **[Quick Start Guide](/developer/quick-start)**: Make your first API call
- **[API Reference](/developer/reference/api-reference)**: Complete API documentation
- **[API Explorer](/developer/explorer/)**: Interactive API testing
- **[Examples](/developer/examples/)**: Code examples and integrations
- **[Deployment Guide](/developer/DEPLOYMENT_GUIDE.md)**: Production deployment
