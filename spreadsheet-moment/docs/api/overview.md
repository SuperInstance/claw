# API Overview

The Spreadsheet Moment API provides programmatic access to all spreadsheet features.

## Base URL

```
https://api.spreadsheetmoment.com/v1
```

## Authentication

All API requests require authentication using an API key:

```bash
curl https://api.spreadsheetmoment.com/v1/spreadsheets \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Rate Limits

- **Free tier**: 100 requests/minute
- **Pro tier**: 1000 requests/minute
- **Enterprise**: Custom limits

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Core Resources

### Spreadsheets

Create, read, update, and delete spreadsheets.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/spreadsheets` | List spreadsheets |
| POST | `/spreadsheets` | Create spreadsheet |
| GET | `/spreadsheets/:id` | Get spreadsheet |
| PATCH | `/spreadsheets/:id` | Update spreadsheet |
| DELETE | `/spreadsheets/:id` | Delete spreadsheet |

### Cells

Manage individual cells and ranges.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/spreadsheets/:id/cells/:cellId` | Get cell |
| PUT | `/spreadsheets/:id/cells/:cellId` | Set cell |
| POST | `/spreadsheets/:id/cells/batch` | Batch set cells |
| GET | `/spreadsheets/:id/ranges/:range` | Get range |

### Webhooks

Configure webhooks for real-time events.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/spreadsheets/:id/webhooks` | List webhooks |
| POST | `/spreadsheets/:id/webhooks` | Create webhook |
| DELETE | `/spreadsheets/:id/webhooks/:webhookId` | Delete webhook |

## Response Format

All responses follow this structure:

```json
{
  "data": { /* Response data */ },
  "meta": {
    "requestId": "req_12345",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Error Handling

Errors follow this format:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid cell reference",
    "details": {
      "field": "cellId",
      "value": "INVALID"
    }
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `validation_error` | Invalid request parameters |
| `authentication_error` | Invalid API key |
| `not_found` | Resource not found |
| `rate_limit_error` | Rate limit exceeded |
| `server_error` | Internal server error |

## Next Steps

- [Authentication](./authentication.md)
- [Spreadsheets API](./spreadsheets.md)
- [Cells API](./cells.md)
- [Webhooks API](./webhooks.md)
- [API Playground](./explorer/playground.md)
