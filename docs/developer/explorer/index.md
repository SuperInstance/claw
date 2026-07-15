# API Explorer

Interactive testing environment for Spreadsheet Moment APIs. Test endpoints, build requests, and generate code directly in your browser.

<ApiExplorer />

## How to Use the API Explorer

The API Explorer lets you:

1. **Authenticate**: Enter your API key to make authenticated requests
2. **Select Endpoints**: Browse and select from all available API endpoints
3. **Build Requests**: Add parameters, headers, and body data
4. **Test Live**: Execute requests against the API and see real responses
5. **Generate Code**: Get ready-to-use code in multiple languages

## Authentication

To use the API Explorer, you need to authenticate with your API key:

```javascript
// Your API key is automatically included in requests
Authorization: Bearer YOUR_API_KEY
```

::: tip Development vs Production
The API Explorer uses our development environment. For production testing, use your production API key.
:::

## Available Endpoints

### Spreadsheets
- `GET /v1/spreadsheets` - List all spreadsheets
- `POST /v1/spreadsheets` - Create a new spreadsheet
- `GET /v1/spreadsheets/:id` - Get spreadsheet details
- `PUT /v1/spreadsheets/:id` - Update spreadsheet
- `DELETE /v1/spreadsheets/:id` - Delete spreadsheet

### Cells
- `GET /v1/spreadsheets/:id/cells` - Get cells
- `POST /v1/spreadsheets/:id/cells` - Update cell
- `POST /v1/spreadsheets/:id/cells/batch` - Batch update cells
- `DELETE /v1/spreadsheets/:id/cells/:cellId` - Delete cell

### Formulas
- `POST /v1/spreadsheets/:id/calculate` - Execute formula
- `GET /v1/spreadsheets/:id/formulas` - List formulas
- `POST /v1/spreadsheets/:id/formulas` - Add formula

### Webhooks
- `GET /v1/webhooks` - List webhooks
- `POST /v1/webhooks` - Create webhook
- `GET /v1/webhooks/:id` - Get webhook details
- `DELETE /v1/webhooks/:id` - Delete webhook

### WebSocket
- `WS /v1/spreadsheets/:id/realtime` - Real-time updates

## Example Requests

### Create Spreadsheet

```json
POST /v1/spreadsheets
{
  "name": "Sales Data 2024",
  "rows": 100,
  "columns": 10,
  "description": "Monthly sales tracking"
}
```

### Update Cell

```json
POST /v1/spreadsheets/sheet_abc123/cells
{
  "cellId": "A1",
  "value": "Revenue",
  "format": {
    "bold": true,
    "backgroundColor": "#4CAF50"
  }
}
```

### Batch Update

```json
POST /v1/spreadsheets/sheet_abc123/cells/batch
{
  "updates": [
    { "cellId": "A1", "value": "Product" },
    { "cellId": "B1", "value": "Price" },
    { "cellId": "C1", "value": "Quantity" },
    { "cellId": "D1", "value": "Total" }
  ]
}
```

### Calculate Formula

```json
POST /v1/spreadsheets/sheet_abc123/calculate
{
  "formula": "=SUM(A1:A10)",
  "range": "A1:A10"
}
```

### Create Webhook

```json
POST /v1/webhooks
{
  "url": "https://your-app.com/webhooks/spreadsheet",
  "events": ["cell.changed", "row.added"],
  "spreadsheetId": "sheet_abc123",
  "secret": "your_webhook_secret"
}
```

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Responses

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid cell reference",
    "details": {
      "field": "cellId",
      "value": "ZZ999"
    }
  }
}
```

## Rate Limits

The API Explorer respects rate limits:

- **Free Plan**: 60 requests/minute
- **Pro Plan**: 300 requests/minute
- **Enterprise**: Custom limits

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 299
X-RateLimit-Reset: 1640995200
```

## Code Generation

The API Explorer can generate code in multiple languages:

### JavaScript/TypeScript
```javascript
import { SpreadsheetMomentClient } from '@spreadsheetmoment/sdk';

const client = new SpreadsheetMomentClient({
  apiKey: 'your_api_key'
});

const spreadsheet = await client.spreadsheets.create({
  name: 'Sales Data 2024',
  rows: 100,
  columns: 10
});
```

### Python
```python
from spreadsheetmoment import SpreadsheetMomentClient

client = SpreadsheetMomentClient(api_key='your_api_key')

spreadsheet = client.spreadsheets.create(
    name='Sales Data 2024',
    rows=100,
    columns=10
)
```

### cURL
```bash
curl -X POST "https://api.spreadsheetmoment.com/v1/spreadsheets" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sales Data 2024",
    "rows": 100,
    "columns": 10
  }'
```

## WebSocket Testing

Test real-time updates with our WebSocket explorer:

```javascript
const ws = new WebSocket('wss://api.spreadsheetmoment.com/v1/spreadsheets/sheet_abc123/realtime?token=your_jwt_token');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};

ws.onopen = () => {
  console.log('Connected to real-time updates');
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

## GraphQL Playground

For GraphQL endpoints, use our integrated GraphQL Playground:

```graphql
query GetSpreadsheet($id: ID!) {
  spreadsheet(id: $id) {
    id
    name
    cells(range: "A1:C10") {
      id
      value
      formula
    }
    collaborators {
      id
      name
      role
    }
  }
}
```

## Best Practices

### 1. Use Appropriate HTTP Methods
- `GET` for retrieving data
- `POST` for creating resources
- `PUT` for updating resources
- `DELETE` for removing resources

### 2. Handle Errors
Always check for error responses and handle them appropriately:

```javascript
const response = await fetch(url, options);
const data = await response.json();

if (!data.success) {
  console.error('API Error:', data.error);
  // Handle error
}
```

### 3. Use Pagination
For large datasets, use pagination:

```javascript
const response = await fetch(
  '/v1/spreadsheets?page=1&limit=50'
);
```

### 4. Cache Responses
Cache responses when appropriate to reduce API calls:

```javascript
const cache = new Map();

async function getCachedSpreadsheet(id) {
  if (cache.has(id)) {
    return cache.get(id);
  }

  const spreadsheet = await client.spreadsheets.get(id);
  cache.set(id, spreadsheet);
  return spreadsheet;
}
```

## Troubleshooting

### Common Issues

**401 Unauthorized**
- Check your API key is valid
- Ensure you're using the correct environment (dev/prod)

**429 Rate Limit Exceeded**
- Implement exponential backoff
- Consider upgrading your plan

**400 Bad Request**
- Validate request parameters
- Check request body format

**404 Not Found**
- Verify the resource ID is correct
- Check the endpoint URL

### Debug Mode

Enable debug mode to see detailed request/response information:

```javascript
const client = new SpreadsheetMomentClient({
  apiKey: 'your_api_key',
  debug: true  // Enable detailed logging
});
```

## Next Steps

- **[SDK Documentation](/developer/sdk/)**: Learn more about our SDKs
- **[API Reference](/api/overview)**: Complete API documentation
- **[Examples](/developer/examples/)**: Sample integrations
- **[Tutorials](/developer/tutorials/)**: Step-by-step guides

## Support

Need help? Contact our support team:

- **Documentation**: [Full API reference](/api/overview)
- **Community**: [Join our Discord](https://discord.gg/spreadsheetmoment)
- **Support**: [Contact support](https://spreadsheetmoment.com/support)
- **Status**: [API Status Page](https://status.spreadsheetmoment.com)
