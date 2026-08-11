# Authentication

Learn how to authenticate with the Spreadsheet Moment API.

## API Key Authentication

The primary authentication method is API keys.

### Generate an API Key

1. Log in to [Spreadsheet Moment](https://spreadsheetmoment.com)
2. Navigate to Settings → API Keys
3. Click "Generate New Key"
4. Copy and store securely

### Use API Key

Include the API key in the `Authorization` header:

```bash
curl https://api.spreadsheetmoment.com/v1/spreadsheets \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Environment Variables

Store API keys in environment variables:

```bash
# .env
SPREADSHEET_MOMENT_API_KEY=your_api_key_here
```

```typescript
import { SpreadsheetMoment } from '@spreadsheetmoment/sdk'

const client = new SpreadsheetMoment({
  apiKey: process.env.SPREADSHEET_MOMENT_API_KEY
})
```

## SDK Authentication

### JavaScript SDK

```typescript
import { SpreadsheetMoment } from '@spreadsheetmoment/sdk'

const client = new SpreadsheetMoment({
  apiKey: 'your-api-key',
  environment: 'production' // or 'development'
})
```

### Python SDK

```python
from spreadsheetmoment import SpreadsheetMoment

client = SpreadsheetMoment(
    api_key='your-api-key',
    environment='production'
)
```

## OAuth 2.0

For user-authorized access, use OAuth 2.0:

### Authorization Flow

1. **Redirect to authorization**

```
https://auth.spreadsheetmoment.com/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  scope=spreadsheets.read+spreadsheets.write&
  response_type=code
```

2. **Handle callback**

Receive authorization code at `redirect_uri`

3. **Exchange for access token**

```bash
curl -X POST https://auth.spreadsheetmoment.com/oauth/token \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d code=AUTHORIZATION_CODE \
  -d grant_type=authorization_code \
  -d redirect_uri=YOUR_REDIRECT_URI
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

4. **Use access token**

```bash
curl https://api.spreadsheetmoment.com/v1/spreadsheets \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

### Refresh Token

```bash
curl -X POST https://auth.spreadsheetmoment.com/oauth/token \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d refresh_token=REFRESH_TOKEN \
  -d grant_type=refresh_token
```

## Token Security

### Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for secrets
3. **Rotate keys regularly** (recommend every 90 days)
4. **Use separate keys** for development and production
5. **Limit key scopes** to minimum required permissions

### Scopes

| Scope | Description |
|-------|-------------|
| `spreadsheets.read` | Read spreadsheet data |
| `spreadsheets.write` | Modify spreadsheet data |
| `spreadsheets.delete` | Delete spreadsheets |
| `webhooks.manage` | Manage webhooks |
| `admin.full` | Full administrative access |

## Troubleshooting

### Common Errors

#### 401 Unauthorized

```json
{
  "error": {
    "code": "authentication_error",
    "message": "Invalid API key"
  }
}
```

**Solutions:**
- Verify API key is correct
- Check key hasn't been revoked
- Ensure key has required scopes

#### 403 Forbidden

```json
{
  "error": {
    "code": "authorization_error",
    "message": "Insufficient permissions"
  }
}
```

**Solutions:**
- Check key has required scopes
- Verify resource access permissions

### Testing Authentication

Test your API key:

```bash
curl https://api.spreadsheetmoment.com/v1/auth/verify \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Response:

```json
{
  "data": {
    "valid": true,
    "keyId": "key_12345",
    "scopes": ["spreadsheets.read", "spreadsheets.write"]
  }
}
```

## Next Steps

- [API Overview](./overview.md)
- [Spreadsheets API](./spreadsheets.md)
- [Webhooks](./webhooks.md)
