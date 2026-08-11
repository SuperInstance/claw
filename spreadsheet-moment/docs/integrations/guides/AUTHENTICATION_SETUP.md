# Authentication Setup Guide

## Overview

This guide covers setting up authentication for Spreadsheet Moment integrations. We support multiple authentication methods to ensure secure connections with your favorite tools.

## Authentication Methods

### 1. OAuth 2.0 (Recommended)

OAuth 2.0 provides secure, delegated access without sharing credentials.

#### Supported OAuth Providers

| Provider | Scopes Required | Documentation |
|----------|----------------|---------------|
| Google | `spreadsheets.readonly`, `drive.readonly` | [Google OAuth Guide](https://developers.google.com/identity/protocols/oauth2) |
| GitHub | `repo`, `read:org` | [GitHub OAuth Guide](https://docs.github.com/en/developers/apps/building-oauth-apps) |
| Slack | `chat:write`, `channels:read` | [Slack OAuth Guide](https://api.slack.com/authentication) |
| Microsoft | `Files.Read`, `Sites.Read.All` | [Microsoft OAuth Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow) |

#### OAuth Flow Implementation

**Step 1: Register Your Application**

```bash
# Using the CLI
polln integrations register oauth \
  --provider slack \
  --redirect-url https://your-app.com/oauth/callback \
  --scopes "chat:write,channels:read"
```

**Step 2: Implement OAuth Callback**

```typescript
import { IntegrationManager } from '@polln/integrations';

const manager = new IntegrationManager({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'https://your-app.com/oauth/callback'
});

// Handle OAuth callback
app.get('/oauth/callback', async (req, res) => {
  const { code, state } = req.query;

  try {
    const tokens = await manager.exchangeCodeForTokens({
      provider: 'slack',
      code: code
    });

    // Store tokens securely
    await manager.storeTokens(tokens);

    res.redirect('/integrations/success');
  } catch (error) {
    res.redirect('/integrations/error?message=' + error.message);
  }
});
```

**Step 3: Use Refresh Tokens**

```typescript
// Automatic token refresh
manager.on('token:expired', async (integration) => {
  const newTokens = await integration.refreshAccessToken();
  await manager.updateTokens(integration.id, newTokens);
});
```

### 2. API Key Authentication

Simple authentication using API keys for services that don't support OAuth.

#### Generating API Keys

```bash
# Using the Dashboard
# 1. Go to Settings > Integrations
# 2. Click "Generate API Key"
# 3. Copy and store securely

# Using the CLI
polln api-keys create \
  --name "Production Integration" \
  --scopes "integrations:read,integrations:write" \
  --expires-in 365d
```

#### Using API Keys

```typescript
import { IntegrationManager } from '@polln/integrations';

const manager = new IntegrationManager({
  apiKey: 'polln_sk_1234567890abcdef'
});

// Or via header
const response = await fetch('https://api.spreadsheetmoment.com/v1/integrations', {
  headers: {
    'Authorization': 'Bearer polln_sk_1234567890abcdef',
    'Content-Type': 'application/json'
  }
});
```

#### API Key Best Practices

- **Never commit API keys to version control**
- Use environment variables for key storage
- Rotate keys regularly (recommended: 90 days)
- Use different keys for development and production
- Implement key scopes for minimum privilege

```bash
# .env file
POLLN_API_KEY=polln_sk_1234567890abcdef
POLLN_ENVIRONMENT=production
```

### 3. JWT (JSON Web Tokens)

For advanced authentication scenarios and microservices architectures.

#### Creating JWT Tokens

```typescript
import { createJWT } from '@polln/integrations';

const token = await createJWT({
  secret: process.env.JWT_SECRET,
  payload: {
    userId: 'user-123',
    integrationId: 'slack-1',
    permissions: ['read', 'write']
  },
  expiresIn: '1h'
});

// Decode and verify
const decoded = await verifyJWT(token, process.env.JWT_SECRET);
```

#### JWT Configuration

```typescript
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  algorithm: 'HS256',
  expiresIn: '1h',
  issuer: 'spreadsheetmoment.com',
  audience: 'api.spreadsheetmoment.com'
};
```

### 4. Webhook Signature Verification

Verify incoming webhooks to ensure they're from trusted sources.

#### HMAC Signature Verification

```typescript
import { WebhookReceiver } from '@polln/integrations';

const receiver = new WebhookReceiver({
  secret: process.env.WEBHOOK_SECRET,
  verifySignature: true
});

// GitHub webhooks
receiver.on('github:push', async (payload, signature) => {
  const isValid = receiver.verifyGitHubSignature(
    payload,
    signature,
    process.env.GITHUB_WEBHOOK_SECRET
  );

  if (!isValid) {
    throw new Error('Invalid webhook signature');
  }

  // Process webhook
});
```

#### Slack Request Signing

```typescript
import { SlackConnector } from '@polln/integrations';

// Verify Slack requests
app.post('/slack/events', async (req, res) => {
  const signature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-request-timestamp'];

  const isValid = SlackConnector.verifyRequestSignature(
    process.env.SLACK_SIGNING_SECRET,
    req.rawBody,
    signature,
    timestamp
  );

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  // Process event
});
```

## Security Best Practices

### Credential Storage

**Environment Variables (Recommended)**
```bash
# .env file
SLACK_API_TOKEN=xoxb-your-token-here
GITHUB_TOKEN=ghp_your-token-here
DATABASE_URL=postgresql://user:pass@host:5432/db
```

**Encrypted Secrets Manager**
```typescript
// Using AWS Secrets Manager
import { SecretsManager } from '@polln/integrations';

const secrets = await SecretsManager.getSecret('production/slack');
const token = secrets.SLACK_API_TOKEN;
```

**Vault Integration**
```typescript
// Using HashiCorp Vault
import { VaultClient } from '@polln/integrations';

const vault = new VaultClient({
  url: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN
});

const secret = await vault.read('secret/integrations/slack');
```

### Token Rotation

**Automatic Rotation**
```typescript
manager.on('token:expiring', async (integration) => {
  // Rotate token before expiry
  if (integration.tokenExpiresAt - Date.now() < 3600000) {
    const newToken = await integration.rotateToken();
    await manager.updateToken(integration.id, newToken);
  }
});
```

**Manual Rotation**
```bash
# Rotate API key
polln api-keys rotate <key-id> --reason "Scheduled rotation"

# Revoke old key
polln api-keys revoke <key-id>
```

### Scope Management

**Minimum Privilege Principle**
```typescript
// Only request necessary scopes
const slackIntegration = await manager.createIntegration({
  type: 'slack',
  scopes: [
    'chat:write',      // Only need to send messages
    'channels:read',   // Only need to read channels
    // NOT: 'channels:write' - Don't need this
  ]
});
```

**Scoped API Keys**
```bash
# Create key with specific scopes
polln api-keys create \
  --name "Integration Key" \
  --scopes "integrations:read,webhooks:write" \
  --no-refresh
```

## Troubleshooting

### Common OAuth Issues

**Issue: Invalid Redirect URI**
```
Error: redirect_uri_mismatch
Solution: Ensure redirect URI matches exactly what's registered
```

**Issue: Expired Authorization Code**
```
Error: invalid_grant
Solution: Authorization codes expire in 10 minutes
```

**Issue: Insufficient Scopes**
```
Error: insufficient_scope
Solution: Request additional scopes during OAuth flow
```

### API Key Issues

**Issue: Invalid API Key**
```typescript
// Validate API key before use
const isValid = await manager.validateApiKey(apiKey);
if (!isValid) {
  throw new Error('Invalid API key');
}
```

**Issue: Rate Limited**
```typescript
// Check rate limit status
const rateLimit = await manager.getRateLimitStatus();
if (rateLimit.remaining < 10) {
  console.warn('Approaching rate limit');
}
```

### Webhook Signature Issues

**Issue: Signature Verification Fails**
```typescript
// Ensure raw body is used for verification
app.use('/webhooks', express.raw({ type: 'application/json' }));

app.post('/webhooks', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const isValid = verifySignature(req.body, signature);

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook
});
```

## Advanced Configuration

### Custom Authentication Providers

```typescript
import { AuthProvider } from '@polln/integrations';

class CustomAuthProvider extends AuthProvider {
  async authenticate(credentials) {
    // Custom authentication logic
  }

  async refreshToken(token) {
    // Custom token refresh logic
  }
}

manager.registerAuthProvider('custom', new CustomAuthProvider());
```

### Multi-Tenant Authentication

```typescript
// Tenant-specific authentication
const tenantManager = new IntegrationManager({
  tenantId: 'tenant-123',
  authProvider: 'oauth',
  credentials: {
    clientId: process.env.TENANT_CLIENT_ID,
    clientSecret: process.env.TENANT_CLIENT_SECRET
  }
});
```

### Session Management

```typescript
// Manage user sessions
const session = await manager.createSession({
  userId: 'user-123',
  integrations: ['slack', 'github'],
  expiresIn: '24h'
});

// Extend session
await session.extend('12h');

// Revoke session
await session.revoke();
```

## Testing Authentication

### Test OAuth Flow

```bash
# Using the CLI
polln integrations test oauth \
  --provider slack \
  --interactive
```

### Test API Key

```bash
# Validate API key
polln api-keys validate polln_sk_1234567890abcdef
```

### Test Webhook Signature

```typescript
// Test signature verification
const payload = { test: 'data' };
const signature = generateSignature(payload, secret);
const isValid = verifySignature(payload, signature, secret);
console.log('Signature valid:', isValid);
```

## Next Steps

- [Webhook Configuration](/docs/integrations/guides/webhook-configuration)
- [API Rate Limits](/docs/integrations/guides/rate-limits)
- [Error Handling](/docs/integrations/guides/error-handling)
- [Integration Examples](/docs/integrations/examples)

---

**Need Help?** Contact us at integrations@spreadsheetmoment.com or join our [Discord community](https://discord.gg/spreadsheetmoment).
