# OpenAPI Explorer

Interactive API explorer powered by OpenAPI specification. Test all endpoints with live requests, parameter building, and response inspection.

<OpenApiExplorer specUrl="/superinstance-openapi.yaml" />

## Features

- **Live API Testing**: Execute real API requests directly from your browser
- **Parameter Builder**: Easily construct path, query, and header parameters
- **Request Body Editor**: JSON editor with validation for POST/PUT requests
- **Response Inspection**: View detailed responses with status codes and timing
- **Code Generation**: Generate code snippets in multiple languages
- **Authentication**: Secure API key management with local storage

## Authentication

The API Explorer uses Bearer token authentication:

```http
Authorization: Bearer YOUR_API_KEY
```

Your API key is:
- Stored locally in your browser's localStorage
- Never sent to any third-party servers
- Only used to make requests to the selected API server

## Rate Limits

Be aware of rate limits when testing:

| Plan | Requests/Minute | Requests/Hour |
|------|----------------|---------------|
| Free | 60 | 1,000 |
| Pro | 300 | 10,000 |
| Enterprise | Custom | Custom |

## Response Format

All API responses include:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Error Handling

Error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

Common error codes:
- `UNAUTHORIZED` (401): Invalid or missing API key
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request parameters
- `RATE_LIMIT_EXCEEDED` (429): Too many requests

## Best Practices

### 1. Use the Development Environment

For testing, use the development server to avoid affecting production data.

### 2. Test with Small Datasets

Start with small datasets when testing to stay within rate limits.

### 3. Monitor Response Times

Keep an eye on response times to identify performance issues early.

### 4. Handle Errors Gracefully

Always check the `success` field in responses and handle errors appropriately.

### 5. Use Batch Operations

When available, use batch operations to reduce the number of API calls.

## WebSocket Testing

For real-time updates, use the WebSocket endpoint:

```javascript
const ws = new WebSocket('wss://api.superinstance.ai/v1/instances/{instanceId}/realtime?token=JWT_TOKEN');

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

## Next Steps

- **[API Reference](/api/overview)**: Complete API documentation
- **[SDK Documentation](/developer/sdk/)**: Official SDKs and libraries
- **[Examples](/developer/examples/)**: Sample integrations and code
- **[Tutorials](/developer/tutorials/)**: Step-by-step guides
