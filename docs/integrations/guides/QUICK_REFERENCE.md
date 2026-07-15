# Integration Quick Reference Guide

## Getting Started

### Installation

```bash
# Install SDK
npm install @polln/integrations

# Python
pip install polln-integrations

# PHP
composer require polln/integrations
```

### Basic Setup

```typescript
import { IntegrationManager } from '@polln/integrations';

const manager = new IntegrationManager({
  apiKey: process.env.POLLN_API_KEY,
  environment: 'production'
});

await manager.initialize();
```

## Common Integrations

### Slack

```typescript
import { createSlackConnector } from '@polln/integrations';

const slack = createSlackConnector({
  id: 'slack-1',
  name: 'Slack',
  apiToken: 'xoxb-your-token',
  defaultChannel: '#general'
});

// Send message
await manager.send('slack-1', 'message', {
  channel: '#general',
  text: 'Hello from Spreadsheet Moment!'
});
```

### GitHub

```typescript
import { createGitHubConnector } from '@polln/integrations';

const github = createGitHubConnector({
  id: 'github-1',
  name: 'GitHub',
  apiToken: process.env.GITHUB_TOKEN
});

// Create issue
await manager.send('github-1', 'createIssue', {
  owner: 'owner',
  repo: 'repo',
  title: 'Issue title',
  body: 'Issue description'
});
```

### PostgreSQL

```typescript
import { createDatabaseConnector } from '@polln/integrations';

const db = createDatabaseConnector({
  id: 'postgres-1',
  name: 'PostgreSQL',
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  user: 'user',
  password: process.env.DB_PASSWORD
});

// Query
const result = await manager.send('postgres-1', 'query', {
  text: 'SELECT * FROM users WHERE active = $1',
  parameters: [true]
});
```

## Authentication

### OAuth 2.0

```typescript
// Redirect user to OAuth provider
const authUrl = await manager.getOAuthUrl('slack', {
  redirectUri: 'https://your-app.com/callback',
  scopes: ['chat:write', 'channels:read']
});

// Handle callback
await manager.handleOAuthCallback(code, state);
```

### API Key

```typescript
const manager = new IntegrationManager({
  apiKey: 'polln_sk_your-key'
});
```

## Webhooks

### Setup Webhook Receiver

```typescript
import { WebhookReceiver } from '@polln/integrations';

const receiver = new WebhookReceiver({
  port: 3000,
  path: '/webhook',
  secret: process.env.WEBHOOK_SECRET,
  verifySignature: true
});

await receiver.start();

// Register route
receiver.registerRoute('github-push', {
  integrationId: 'github-1',
  cellId: 'cell-1'
});
```

### Handle Webhook Events

```typescript
receiver.on('webhook:processed', (event) => {
  console.log('Webhook processed:', event.webhookId);
});
```

## Cell Mapping

### Map Events to Cells

```typescript
const config = {
  cellMapping: {
    eventToCell: {
      'message': 'slack-messages-cell',
      'slashCommand': 'slack-commands-cell'
    },
    cellToOperation: {
      'notifications-cell': 'message',
      'reports-cell': 'upload'
    }
  }
};
```

### Transform Data

```typescript
const config = {
  cellMapping: {
    transforms: {
      'message': (data) => ({
        timestamp: new Date(),
        channel: data.channel,
        text: data.text
      })
    }
  }
};
```

## Rate Limiting

### Configure Rate Limits

```typescript
const config = {
  rateLimit: {
    maxRequests: 1000,
    windowMs: 3600000, // 1 hour
    burstSize: 100
  }
};
```

### Handle Rate Limits

```typescript
try {
  await manager.send('slack-1', 'message', { /* ... */ });
} catch (error) {
  if (error.code === 'RATE_LIMITED') {
    console.log('Retry after:', error.retryDelay);
  }
}
```

## Error Handling

### Common Error Codes

```typescript
switch (error.code) {
  case 'UNAUTHORIZED':
    // Invalid credentials
    break;
  case 'RATE_LIMITED':
    // Rate limit exceeded
    break;
  case 'NETWORK_ERROR':
    // Network issue
    break;
  case 'TIMEOUT':
    // Request timeout
    break;
}
```

### Retry Configuration

```typescript
const config = {
  retry: {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 60000,
    backoffMultiplier: 2,
    retryableStatusCodes: [429, 500, 502, 503, 504]
  }
};
```

## Data Synchronization

### Sync to Spreadsheet

```typescript
await manager.createSyncJob({
  id: 'sync-users',
  source: 'postgres-1',
  target: 'spreadsheet',
  query: 'SELECT * FROM users',
  range: 'Sheet1!A1',
  interval: 300000, // 5 minutes
  transform: (row) => ({
    id: row.id,
    name: row.name,
    email: row.email
  })
});
```

### Sync from Spreadsheet

```typescript
const data = await spreadsheet.exportData({
  range: 'Sheet1!A1:Z1000'
});

await manager.send('postgres-1', 'batchInsert', {
  table: 'users',
  data: data,
  batchSize: 1000
});
```

## Best Practices

### Security

```typescript
// Use environment variables
const apiToken = process.env.SLACK_API_TOKEN;

// Mask credentials
const { maskCredentials } = '@polln/integrations';
const masked = maskCredentials(config);

// Verify signatures
const isValid = verifySignature(payload, signature, secret);
```

### Performance

```typescript
// Use connection pooling
const db = createDatabaseConnector({
  poolSize: 20,
  maxOverflow: 10
});

// Use streaming for large results
await manager.send('postgres-1', 'stream', {
  text: 'SELECT * FROM large_table',
  onRow: (row) => {
    // Process row
  }
});

// Batch operations
await manager.send('slack-1', 'batch', {
  messages: messages,
  delayMs: 1000
});
```

### Error Handling

```typescript
try {
  await manager.send('slack-1', 'message', { /* ... */ });
} catch (error) {
  logger.error('Integration error:', error);
  await notifyUser(error);
}
```

## Testing

### Test Integration

```typescript
// Test connection
await manager.connectIntegration('slack-1');
const isConnected = slack.isConnected();

// Test operation
const result = await manager.send('slack-1', 'message', {
  channel: '#test',
  text: 'Test message'
});

console.log('Result:', result.success);
```

### Mock Integration

```typescript
import { createMockConnector } from '@polln/integrations/test';

const mockSlack = createMockConnector({
  type: 'slack',
  responses: {
    message: { success: true, data: { ts: '1234567890.123456' } }
  }
});

await manager.registerIntegration(mockSlack);
```

## CLI Commands

### Initialize Integration

```bash
polln integrations init \
  --name "My Integration" \
  --type slack
```

### Test Connection

```bash
polln integrations test \
  --integration slack-1 \
  --operation message
```

### Deploy Integration

```bash
polln integrations deploy \
  --integration ./my-integration \
  --environment production
```

## Monitoring

### Health Check

```typescript
const health = await manager.checkAllHealth();
console.log('Health status:', health);

// Per integration
const slackHealth = await slack.healthCheck();
console.log('Slack health:', slackHealth);
```

### Metrics

```typescript
const metrics = manager.getAllMetrics();
console.log('Metrics:', metrics);

// Per integration
const slackMetrics = slack.getMetrics();
console.log('Slack metrics:', slackMetrics);
```

### Events

```typescript
manager.on('integration:connected', (event) => {
  console.log('Integration connected:', event.integrationId);
});

manager.on('integration:event', (event) => {
  console.log('Integration event:', event.type);
});
```

## Troubleshooting

### Connection Issues

```bash
# Test connectivity
polln integrations test-connection \
  --integration slack-1

# Check logs
polln integrations logs \
  --integration slack-1 \
  --tail
```

### Debug Mode

```typescript
const manager = new IntegrationManager({
  debug: true,
  logLevel: 'verbose'
});
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Invalid credentials | Check API token/credentials |
| Rate limited | Wait and retry, reduce frequency |
| Connection timeout | Increase timeout, check network |
| Webhook not received | Verify URL, check signature |

## Resources

### Documentation
- [Full Documentation](/docs/integrations)
- [API Reference](/docs/api/reference)
- [Best Practices](/docs/integrations/best-practices)

### Support
- [Developer Forum](https://community.spreadsheetmoment.com)
- [Discord](https://discord.gg/spreadsheetmoment)
- Email: integrations@spreadsheetmoment.com

### Tools
- [CLI Reference](/docs/cli/reference)
- [SDK Documentation](/docs/sdk/reference)
- [Testing Guide](/docs/testing/guide)

---

**Need Help?** Check our [full documentation](/docs/integrations) or [contact support](mailto:integrations@spreadsheetmoment.com).
