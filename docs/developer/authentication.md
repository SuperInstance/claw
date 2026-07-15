# Authentication & Testing

Comprehensive guide to authentication methods, testing tools, and best practices for secure API integration.

## Authentication Methods

### API Key Authentication

The simplest method for server-to-server communication.

#### Get Your API Key

1. Log in to your [Spreadsheet Moment dashboard](https://dashboard.spreadsheetmoment.com)
2. Navigate to **Settings** → **API Keys**
3. Click **Generate New API Key**
4. Copy and store your key securely

::: warning Security Best Practice
Never commit API keys to version control. Use environment variables or secret management.
:::

#### Using API Keys

```javascript
import { SpreadsheetMomentClient } from '@spreadsheetmoment/sdk'

const client = new SpreadsheetMomentClient({
  apiKey: process.env.SPREADSHEET_MOMENT_API_KEY
})
```

```python
import os
from spreadsheetmoment import SpreadsheetMomentClient

client = SpreadsheetMomentClient(
    api_key=os.environ.get('SPREADSHEET_MOMENT_API_KEY')
)
```

```go
import os

client := spreadsheetmoment.NewClient(
    spreadsheetmoment.WithAPIKey(os.Getenv("SPREADSHEET_MOMENT_API_KEY")),
)
```

### OAuth 2.0 Authentication

For user-facing applications that need to access user data.

#### OAuth 2.0 Flow

1. **Register Your Application**

   - Go to [Developer Dashboard](https://dashboard.spreadsheetmoment.com/developers)
   - Create a new OAuth application
   - Set redirect URIs
   - Copy your client ID and secret

2. **Authorization Code Flow**

   ```javascript
   // Step 1: Redirect user to authorization URL
   const authUrl = `https://auth.spreadsheetmoment.com/authorize?` +
     `client_id=${CLIENT_ID}&` +
     `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
     `response_type=code&` +
     `scope=spreadsheets.read spreadsheets.write`

   // Step 2: Exchange authorization code for access token
   const tokenResponse = await fetch('https://auth.spreadsheetmoment.com/token', {
     method: 'POST',
     body: new URLSearchParams({
       grant_type: 'authorization_code',
       code: authorizationCode,
       client_id: CLIENT_ID,
       client_secret: CLIENT_SECRET,
       redirect_uri: REDIRECT_URI
     })
   })

   const { access_token, refresh_token } = await tokenResponse.json()

   // Step 3: Use access token
   const client = new SpreadsheetMomentClient({
     accessToken: access_token
   })
   ```

3. **Refresh Token Flow**

   ```javascript
   // When access token expires, use refresh token
   const tokenResponse = await fetch('https://auth.spreadsheetmoment.com/token', {
     method: 'POST',
     body: new URLSearchParams({
       grant_type: 'refresh_token',
       refresh_token: refreshToken,
       client_id: CLIENT_ID,
       client_secret: CLIENT_SECRET
     })
   })

   const { access_token: newAccessToken } = await tokenResponse.json()
   ```

#### Scopes

| Scope | Description |
|-------|-------------|
| `spreadsheets.read` | Read spreadsheet data |
| `spreadsheets.write` | Create and modify spreadsheets |
| `spreadsheets.delete` | Delete spreadsheets |
| `user.read` | Read user profile information |
| `webhooks.manage` | Create and manage webhooks |

#### SDK OAuth Support

```javascript
import { SpreadsheetMomentClient } from '@spreadsheetmoment/sdk'

const client = new SpreadsheetMomentClient({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI,
  scopes: ['spreadsheets.read', 'spreadsheets.write']
})

// Get authorization URL
const authUrl = client.getAuthorizationUrl()

// Exchange code for token
await client.exchangeCodeForToken(authorizationCode)

// Refresh token
await client.refreshAccessToken()
```

### JWT Authentication

For service accounts and server-to-server authentication.

#### Create Service Account

1. Go to **Settings** → **Service Accounts**
2. Create a new service account
3. Download the JSON key file

#### Using JWT

```javascript
import { SpreadsheetMomentClient } from '@spreadsheetmoment/sdk'
import { readFileSync } from 'fs'

const serviceAccount = JSON.parse(
  readFileSync('service-account-key.json')
)

const client = new SpreadsheetMomentClient({
  serviceAccount: {
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key
  }
})
```

```python
from spreadsheetmoment import SpreadsheetMomentClient
import json

with open('service-account-key.json') as f:
    service_account = json.load(f)

client = SpreadsheetMomentClient(
    service_account={
        'client_email': service_account['client_email'],
        'private_key': service_account['private_key']
    }
)
```

## Testing

### Local Development

#### Mock API

Use our mock API for local development without making real API calls:

```javascript
import { MockSpreadsheetClient } from '@spreadsheetmoment/sdk/testing'

const mockClient = new MockSpreadsheetClient({
  spreadsheets: [
    {
      id: 'mock-sheet-123',
      name: 'Test Spreadsheet',
      cells: {
        A1: 'Product',
        B1: 'Price',
        C1: 'Quantity'
      }
    }
  ]
})

// Test your code with mock data
const spreadsheet = await mockClient.spreadsheets.get('mock-sheet-123')
console.log(spreadsheet.name) // 'Test Spreadsheet'
```

#### Development Environment

Use the development environment for testing:

```javascript
const client = new SpreadsheetMomentClient({
  apiKey: process.env.SPREADSHEET_MOMENT_DEV_API_KEY,
  environment: 'development'
})
```

### Unit Testing

#### JavaScript (Jest)

```javascript
import { SpreadsheetMomentClient } from '@spreadsheetmoment/sdk'

// Mock the client
jest.mock('@spreadsheetmoment/sdk')

describe('Spreadsheet Service', () => {
  let client
  let mockClient

  beforeEach(() => {
    mockClient = {
      spreadsheets: {
        create: jest.fn().mockResolvedValue({
          id: 'test-sheet-123',
          name: 'Test Spreadsheet'
        })
      }
    }

    SpreadsheetMomentClient.mockImplementation(() => mockClient)
    client = new SpreadsheetMomentClient({ apiKey: 'test-key' })
  })

  test('creates spreadsheet successfully', async () => {
    const spreadsheet = await client.spreadsheets.create({
      name: 'Test Spreadsheet'
    })

    expect(spreadsheet.id).toBe('test-sheet-123')
    expect(mockClient.spreadsheets.create).toHaveBeenCalledWith({
      name: 'Test Spreadsheet'
    })
  })
})
```

#### Python (pytest)

```python
import pytest
from unittest.mock import Mock, patch
from spreadsheetmoment import SpreadsheetMomentClient

@pytest.fixture
def mock_client():
    with patch('spreadsheetmoment.SpreadsheetMomentClient') as mock:
        client = Mock()
        mock.return_value = client
        yield client

def test_create_spreadsheet(mock_client):
    mock_client.spreadsheets.create.return_value = Mock(
        id='test-sheet-123',
        name='Test Spreadsheet'
    )

    spreadsheet = mock_client.spreadsheets.create(
        name='Test Spreadsheet'
    )

    assert spreadsheet.id == 'test-sheet-123'
    mock_client.spreadsheets.create.assert_called_once_with(
        name='Test Spreadsheet'
    )
```

### Integration Testing

#### Test with Real API

```javascript
import { SpreadsheetMomentClient } from '@spreadsheetmoment/sdk'

describe('Spreadsheet API Integration Tests', () => {
  let client
  let testSpreadsheet

  beforeAll(() => {
    client = new SpreadsheetMomentClient({
      apiKey: process.env.TEST_API_KEY,
      environment: 'development'
    })
  })

  test('creates and deletes spreadsheet', async () => {
    // Create
    testSpreadsheet = await client.spreadsheets.create({
      name: 'Integration Test Spreadsheet',
      rows: 10,
      columns: 5
    })

    expect(testSpreadsheet.id).toBeDefined()

    // Update
    await testSpreadsheet.cells.update({
      A1: 'Test Value'
    })

    const cell = await testSpreadsheet.cells.get('A1')
    expect(cell.value).toBe('Test Value')

    // Delete
    await client.spreadsheets.delete(testSpreadsheet.id)
  })
})
```

### Webhook Testing

#### Local Webhook Testing

Use ngrok or similar tools to test webhooks locally:

```bash
# Start ngrok
ngrok http 3000

# Use the ngrok URL in your webhook configuration
```

#### Webhook Verification

```javascript
import crypto from 'crypto'

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const digest = hmac.digest('hex')
  return signature === `sha256=${digest}`
}

// In your webhook handler
app.post('/webhooks/spreadsheet', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-webhook-signature']

  if (!verifyWebhookSignature(req.body, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature')
  }

  const event = JSON.parse(req.body)
  // Process event
})
```

## Security Best Practices

### API Key Management

```javascript
// ✅ Good: Use environment variables
const client = new SpreadsheetMomentClient({
  apiKey: process.env.API_KEY
})

// ❌ Bad: Hardcoded API key
const client = new SpreadsheetMomentClient({
  apiKey: 'sk_live_abc123...'
})
```

### Secure Storage

#### Environment Variables

```bash
# .env file (never commit this)
SPREADSHEET_MOMENT_API_KEY=sk_live_abc123...
SPREADSHEET_MOMENT_WEBHOOK_SECRET=wh_secret_xyz789...
```

#### Secret Management (AWS Secrets Manager)

```javascript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

async function getApiKey() {
  const client = new SecretsManagerClient({})
  const command = new GetSecretValueCommand({
    SecretId: 'spreadsheet-moment/api-key'
  })

  const response = await client.send(command)
  return JSON.parse(response.SecretString).api_key
}

const apiKey = await getApiKey()
const client = new SpreadsheetMomentClient({ apiKey })
```

### Principle of Least Privilege

Create API keys with minimal required permissions:

```javascript
// ✅ Good: Scoped API key
const readOnlyKey = new SpreadsheetMomentClient({
  apiKey: process.env.READ_ONLY_API_KEY,
  scopes: ['spreadsheets.read']
})

// ❌ Bad: Full access key when only read is needed
const fullAccessKey = new SpreadsheetMomentClient({
  apiKey: process.env.FULL_ACCESS_API_KEY
})
```

### Token Rotation

Regularly rotate your API keys and tokens:

```javascript
// Check token expiration
const client = new SpreadsheetMomentClient({
  accessToken: process.env.ACCESS_TOKEN,
  onTokenExpired: async () => {
    // Refresh token
    const newToken = await refreshToken()
    return newToken
  }
})
```

### Rate Limiting

Implement client-side rate limiting to avoid hitting API limits:

```javascript
class RateLimitedClient {
  constructor(client, requestsPerMinute = 60) {
    this.client = client
    this.requestsPerMinute = requestsPerMinute
    this.requests = []
  }

  async makeRequest(...args) {
    const now = Date.now()
    const oneMinuteAgo = now - 60000

    // Remove old requests
    this.requests = this.requests.filter(time => time > oneMinuteAgo)

    // Check rate limit
    if (this.requests.length >= this.requestsPerMinute) {
      const oldestRequest = this.requests[0]
      const waitTime = oldestRequest + 60000 - now
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    // Make request
    this.requests.push(Date.now())
    return this.client.makeRequest(...args)
  }
}
```

## Troubleshooting

### Common Authentication Issues

#### Invalid API Key

```javascript
try {
  await client.spreadsheets.list()
} catch (error) {
  if (error.code === 'AUTHENTICATION_FAILED') {
    console.error('Invalid API key. Check your credentials.')
  }
}
```

#### Expired Access Token

```javascript
try {
  await client.spreadsheets.list()
} catch (error) {
  if (error.code === 'TOKEN_EXPIRED') {
    // Refresh token
    await client.refreshAccessToken()
    // Retry request
    await client.spreadsheets.list()
  }
}
```

#### Rate Limit Exceeded

```javascript
async function makeRequestWithRetry(fn, retries = 3) {
  try {
    return await fn()
  } catch (error) {
    if (error.code === 'RATE_LIMIT_EXCEEDED' && retries > 0) {
      const retryAfter = error.retryAfter * 1000
      await new Promise(resolve => setTimeout(resolve, retryAfter))
      return makeRequestWithRetry(fn, retries - 1)
    }
    throw error
  }
}
```

## Monitoring & Logging

### Request Logging

```javascript
const client = new SpreadsheetMomentClient({
  apiKey: process.env.API_KEY,
  logger: {
    level: 'debug',
    handler: (message) => {
      console.log(`[SpreadsheetMoment] ${message}`)
    }
  }
})
```

### Error Tracking

```javascript
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN
})

try {
  await client.spreadsheets.create({ name: 'Test' })
} catch (error) {
  Sentry.captureException(error)
}
```

## Next Steps

- **[API Reference](/developer/reference/)**: Complete API documentation
- **[Examples](/developer/examples/)**: Code examples and integrations
- **[Tutorials](/developer/tutorials/)**: Step-by-step guides

## Support

- **Documentation**: [Full documentation](/developer/)
- **Community**: [Join our Discord](https://discord.gg/spreadsheetmoment)
- **Support**: [Contact support](https://spreadsheetmoment.com/support)
