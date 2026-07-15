# Webhooks API

Configure webhooks for real-time event notifications.

## Webhook Overview

Webhooks allow you to receive real-time notifications when events occur in your spreadsheets.

### Supported Events

| Event | Description |
|-------|-------------|
| `cell.changed` | Cell value changed |
| `row.created` | Row added |
| `row.deleted` | Row removed |
| `spreadsheet.created` | Spreadsheet created |
| `spreadsheet.deleted` | Spreadsheet deleted |
| `user.joined` | User joined spreadsheet |
| `user.left` | User left spreadsheet |

## List Webhooks

List all webhooks for a spreadsheet.

### Request

```http
GET /v1/spreadsheets/:id/webhooks
```

### Example

```bash
curl https://api.spreadsheetmoment.com/v1/spreadsheets/spr_12345/webhooks \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Response

```json
{
  "data": [
    {
      "id": "wh_12345",
      "url": "https://example.com/webhook",
      "events": ["cell.changed", "row.created"],
      "secret": "webhook_secret_***",
      "active": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Create Webhook

Create a new webhook.

### Request

```http
POST /v1/spreadsheets/:id/webhooks
```

### Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | Webhook URL |
| `events` | array | Yes | Events to subscribe to |
| `secret` | string | No | Webhook signature secret |

### Example

```bash
curl -X POST https://api.spreadsheetmoment.com/v1/spreadsheets/spr_12345/webhooks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/webhook",
    "events": ["cell.changed", "row.created"],
    "secret": "my_webhook_secret"
  }'
```

### Response

```json
{
  "data": {
    "id": "wh_12345",
    "url": "https://example.com/webhook",
    "events": ["cell.changed", "row.created"],
    "active": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## Delete Webhook

Delete a webhook.

### Request

```http
DELETE /v1/spreadsheets/:id/webhooks/:webhookId
```

### Example

```bash
curl -X DELETE https://api.spreadsheetmoment.com/v1/spreadsheets/spr_12345/webhooks/wh_12345 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Webhook Payload

All webhooks send a POST request with the following structure:

```json
{
  "id": "evt_12345",
  "event": "cell.changed",
  "spreadsheetId": "spr_12345",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "cellId": "A1",
    "oldValue": null,
    "newValue": "Hello"
  }
}
```

## Webhook Signature

Webhooks are signed using HMAC-SHA256:

```
X-SpreadsheetMoment-Signature: sha256=SIGNATURE
```

### Verify Signature

```typescript
import crypto from 'crypto'

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  const expectedSignature = `sha256=${digest}`
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}
```

```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected_signature = 'sha256=' + hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected_signature)
```

## Best Practices

### 1. Use HTTPS

Always use HTTPS URLs for webhooks:

```json
{
  "url": "https://example.com/webhook"
}
```

### 2. Respond Quickly

Respond within 5 seconds:

```typescript
app.post('/webhook', (req, res) => {
  // Process webhook asynchronously
  processWebhook(req.body).catch(console.error)

  // Respond immediately
  res.sendStatus(200)
})
```

### 3. Handle Retries

Implement idempotency for retry handling:

```typescript
const processedEvents = new Set()

app.post('/webhook', (req, res) => {
  const { id, event, data } = req.body

  // Skip if already processed
  if (processedEvents.has(id)) {
    return res.sendStatus(200)
  }

  // Process event
  await handleEvent(event, data)

  // Mark as processed
  processedEvents.add(id)

  res.sendStatus(200)
})
```

### 4. Validate Events

Validate event structure:

```typescript
function isValidWebhook(payload: any): boolean {
  return (
    payload.id &&
    payload.event &&
    payload.spreadsheetId &&
    payload.timestamp &&
    payload.data
  )
}
```

## Retry Policy

If your webhook endpoint fails, Spreadsheet Moment will retry:

| Attempt | Delay |
|---------|-------|
| 1 | Immediate |
| 2 | 1 minute |
| 3 | 5 minutes |
| 4 | 30 minutes |
| 5 | 2 hours |

After 5 failed attempts, the webhook is disabled.

## Test Webhooks

Test your webhook endpoint:

```bash
curl -X POST https://api.spreadsheetmoment.com/v1/webhooks/test \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/webhook",
    "event": "cell.changed",
    "data": {
      "cellId": "A1",
      "value": "Test"
    }
  }'
```

## SDK Examples

### JavaScript

```typescript
// Create webhook
const webhook = await spreadsheet.webhooks.create({
  url: 'https://example.com/webhook',
  events: ['cell.changed', 'row.created'],
  secret: 'my_secret'
})

// List webhooks
const webhooks = await spreadsheet.webhooks.list()

// Delete webhook
await spreadsheet.webhooks.delete(webhook.id)
```

### Python

```python
# Create webhook
webhook = spreadsheet.webhooks.create(
    url='https://example.com/webhook',
    events=['cell.changed', 'row.created'],
    secret='my_secret'
)

# List webhooks
webhooks = spreadsheet.webhooks.list()

# Delete webhook
spreadsheet.webhooks.delete(webhook.id)
```

## Next Steps

- [API Overview](./overview.md)
- [Guides: Automation](../guides/automation/webhooks.md)
- [API Playground](./explorer/playground.md)
