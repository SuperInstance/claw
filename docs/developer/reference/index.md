# API Reference

Complete reference documentation for Spreadsheet Moment APIs, including REST, GraphQL, WebSocket, and webhook endpoints.

## Base URL

```
Production: https://api.spreadsheetmoment.com
Development: https://api-dev.spreadsheetmoment.com
```

## Authentication

All API requests require authentication using an API key or OAuth 2.0 token.

### API Key Authentication

```http
Authorization: Bearer YOUR_API_KEY
```

### OAuth 2.0 Authentication

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

::: tip Security
Never expose your API keys in client-side code or public repositories. Use environment variables or secret management.
:::

---

## REST API Endpoints

### Spreadsheets

#### List Spreadsheets

```http
GET /v1/spreadsheets
```

Retrieve a paginated list of spreadsheets accessible to the authenticated user.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 50, max: 100) |
| sort | string | No | Sort field (name, created, updated) |
| order | string | No | Sort order (asc, desc) |
| search | string | No | Search in name and description |

**Response:**

```json
{
  "success": true,
  "data": {
    "spreadsheets": [
      {
        "id": "sheet_abc123",
        "name": "Sales Data 2024",
        "description": "Monthly sales tracking",
        "rows": 100,
        "columns": 10,
        "created": "2024-01-15T10:30:00Z",
        "updated": "2024-01-20T15:45:00Z",
        "owner": {
          "id": "user_456",
          "name": "John Doe"
        },
        "permissions": {
          "canRead": true,
          "canWrite": true,
          "canAdmin": false
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  },
  "meta": {
    "requestId": "req_xyz789",
    "timestamp": "2024-01-20T16:00:00Z"
  }
}
```

#### Create Spreadsheet

```http
POST /v1/spreadsheets
```

Create a new spreadsheet.

**Request Body:**

```json
{
  "name": "Sales Data 2024",
  "description": "Monthly sales tracking",
  "rows": 100,
  "columns": 10,
  "settings": {
    "timezone": "America/New_York",
    "locale": "en-US"
  }
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Spreadsheet name (max 255 characters) |
| description | string | No | Spreadsheet description |
| rows | integer | Yes | Number of rows (max: 10,000) |
| columns | integer | Yes | Number of columns (max: 100) |
| settings | object | No | Spreadsheet settings |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "sheet_abc123",
    "name": "Sales Data 2024",
    "description": "Monthly sales tracking",
    "rows": 100,
    "columns": 10,
    "created": "2024-01-20T16:00:00Z",
    "updated": "2024-01-20T16:00:00Z"
  }
}
```

#### Get Spreadsheet

```http
GET /v1/spreadsheets/:id
```

Retrieve details of a specific spreadsheet.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Spreadsheet ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "sheet_abc123",
    "name": "Sales Data 2024",
    "description": "Monthly sales tracking",
    "rows": 100,
    "columns": 10,
    "created": "2024-01-15T10:30:00Z",
    "updated": "2024-01-20T15:45:00Z",
    "settings": {
      "timezone": "America/New_York",
      "locale": "en-US"
    },
    "collaborators": [
      {
        "id": "user_789",
        "name": "Jane Smith",
        "role": "editor",
        "joined": "2024-01-16T09:00:00Z"
      }
    ]
  }
}
```

#### Update Spreadsheet

```http
PUT /v1/spreadsheets/:id
```

Update spreadsheet metadata.

**Request Body:**

```json
{
  "name": "Sales Data 2024 (Updated)",
  "description": "Updated description",
  "settings": {
    "timezone": "America/Los_Angeles"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "sheet_abc123",
    "name": "Sales Data 2024 (Updated)",
    "updated": "2024-01-20T16:30:00Z"
  }
}
```

#### Delete Spreadsheet

```http
DELETE /v1/spreadsheets/:id
```

Delete a spreadsheet permanently.

**Response:**

```json
{
  "success": true,
  "data": {
    "deleted": true,
    "id": "sheet_abc123"
  }
}
```

---

### Cells

#### Get Cells

```http
GET /v1/spreadsheets/:id/cells
```

Retrieve cells from a spreadsheet.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| range | string | No | Cell range (e.g., "A1:C10") |
| cellIds | string | No | Comma-separated cell IDs |
| includeFormat | boolean | No | Include cell formatting (default: false) |
| includeFormulas | boolean | No | Include formula values (default: true) |

**Response:**

```json
{
  "success": true,
  "data": {
    "cells": [
      {
        "id": "A1",
        "value": "Product",
        "formula": null,
        "format": {
          "bold": true,
          "backgroundColor": "#4CAF50"
        },
        "updated": "2024-01-20T16:00:00Z"
      },
      {
        "id": "B1",
        "value": "Price",
        "formula": null,
        "format": {},
        "updated": "2024-01-20T16:00:00Z"
      }
    ]
  }
}
```

#### Update Cell

```http
POST /v1/spreadsheets/:id/cells
```

Update a single cell.

**Request Body:**

```json
{
  "cellId": "A1",
  "value": "New Value",
  "formula": null,
  "format": {
    "bold": true,
    "color": "#2ecc71"
  }
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cellId | string | Yes | Cell identifier (e.g., "A1") |
| value | string | No | Cell value |
| formula | string | No | Formula (if value is calculated) |
| format | object | No | Cell formatting options |

**Response:**

```json
{
  "success": true,
  "data": {
    "cell": {
      "id": "A1",
      "value": "New Value",
      "updated": "2024-01-20T16:30:00Z"
    }
  }
}
```

#### Batch Update Cells

```http
POST /v1/spreadsheets/:id/cells/batch
```

Update multiple cells in a single request.

**Request Body:**

```json
{
  "updates": [
    {
      "cellId": "A1",
      "value": "Product"
    },
    {
      "cellId": "B1",
      "value": "Price"
    },
    {
      "cellId": "C1",
      "value": "Quantity"
    }
  ]
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| updates | array | Yes | Array of cell updates |

**Response:**

```json
{
  "success": true,
  "data": {
    "updated": 3,
    "cells": [
      { "id": "A1", "value": "Product" },
      { "id": "B1", "value": "Price" },
      { "id": "C1", "value": "Quantity" }
    ]
  }
}
```

#### Delete Cell

```http
DELETE /v1/spreadsheets/:id/cells/:cellId
```

Clear a cell's value and formatting.

**Response:**

```json
{
  "success": true,
  "data": {
    "deleted": true,
    "cellId": "A1"
  }
}
```

---

### Formulas

#### Calculate Formula

```http
POST /v1/spreadsheets/:id/calculate
```

Execute a formula calculation.

**Request Body:**

```json
{
  "formula": "=SUM(A1:A10)",
  "range": "A1:A10"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "result": 1500.50,
    "formula": "=SUM(A1:A10)",
    "evaluated": "2024-01-20T16:30:00Z"
  }
}
```

#### Get Formulas

```http
GET /v1/spreadsheets/:id/formulas
```

List all formulas in a spreadsheet.

**Response:**

```json
{
  "success": true,
  "data": {
    "formulas": [
      {
        "cellId": "D1",
        "formula": "=SUM(B2:B100)",
        "value": 1500.50,
        "dependencies": ["B2", "B3", "B4"]
      }
    ]
  }
}
```

---

### Webhooks

#### List Webhooks

```http
GET /v1/webhooks
```

List all webhooks for the authenticated user.

**Response:**

```json
{
  "success": true,
  "data": {
    "webhooks": [
      {
        "id": "webhook_xyz789",
        "url": "https://your-app.com/webhooks/spreadsheet",
        "events": ["cell.changed", "row.added"],
        "spreadsheetId": "sheet_abc123",
        "active": true,
        "created": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### Create Webhook

```http
POST /v1/webhooks
```

Create a new webhook.

**Request Body:**

```json
{
  "url": "https://your-app.com/webhooks/spreadsheet",
  "events": ["cell.changed", "row.added"],
  "spreadsheetId": "sheet_abc123",
  "secret": "your_webhook_secret"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| url | string | Yes | Webhook URL |
| events | array | Yes | Event types to subscribe to |
| spreadsheetId | string | No | Spreadsheet ID (null for all) |
| secret | string | Yes | Webhook signature secret |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "webhook_xyz789",
    "url": "https://your-app.com/webhooks/spreadsheet",
    "events": ["cell.changed", "row.added"],
    "active": true,
    "created": "2024-01-20T16:30:00Z"
  }
}
```

#### Delete Webhook

```http
DELETE /v1/webhooks/:id
```

Delete a webhook.

**Response:**

```json
{
  "success": true,
  "data": {
    "deleted": true,
    "id": "webhook_xyz789"
  }
}
```

---

## WebSocket API

### Connect to Real-Time Updates

```javascript
const ws = new WebSocket('wss://api.spreadsheetmoment.com/v1/spreadsheets/:id/realtime?token=JWT_TOKEN')
```

### Events

#### cell_changed

Emitted when a cell value changes.

```json
{
  "type": "cell_changed",
  "data": {
    "cellId": "A1",
    "value": "New Value",
    "oldValue": "Old Value",
    "user": {
      "id": "user_123",
      "name": "John Doe"
    },
    "timestamp": "2024-01-20T16:30:00Z"
  }
}
```

#### row_added

Emitted when a new row is added.

```json
{
  "type": "row_added",
  "data": {
    "rowIndex": 5,
    "user": {
      "id": "user_123",
      "name": "John Doe"
    },
    "timestamp": "2024-01-20T16:30:00Z"
  }
}
```

#### collaborator_joined

Emitted when a user joins the spreadsheet.

```json
{
  "type": "collaborator_joined",
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "avatar": "https://example.com/avatar.jpg"
    },
    "timestamp": "2024-01-20T16:30:00Z"
  }
}
```

#### collaborator_left

Emitted when a user leaves the spreadsheet.

```json
{
  "type": "collaborator_left",
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe"
    },
    "timestamp": "2024-01-20T16:30:00Z"
  }
}
```

---

## GraphQL API

### Endpoint

```
POST /graphql
```

### Example Query

```graphql
query GetSpreadsheet($id: ID!) {
  spreadsheet(id: $id) {
    id
    name
    description
    rows
    columns
    created
    updated
    cells(range: "A1:C10") {
      id
      value
      formula
      format {
        bold
        color
        backgroundColor
      }
    }
    collaborators {
      id
      name
      role
    }
  }
}
```

### Example Mutation

```graphql
mutation UpdateCell($input: UpdateCellInput!) {
  updateCell(input: $input) {
    cell {
      id
      value
      updated
    }
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "field_name",
      "value": "provided_value"
    }
  },
  "meta": {
    "requestId": "req_xyz789",
    "timestamp": "2024-01-20T16:30:00Z"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| AUTHENTICATION_FAILED | 401 | Invalid or missing authentication |
| AUTHORIZATION_FAILED | 403 | Insufficient permissions |
| RESOURCE_NOT_FOUND | 404 | Resource does not exist |
| VALIDATION_ERROR | 400 | Invalid request parameters |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

---

## Rate Limits

API requests are rate limited based on your plan:

| Plan | Requests/Minute | Requests/Hour |
|------|----------------|---------------|
| Free | 60 | 1,000 |
| Pro | 300 | 10,000 |
| Enterprise | Custom | Custom |

Rate limit headers are included in every response:

```http
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 299
X-RateLimit-Reset: 1640995200
```

---

## Best Practices

### Use Pagination

For large datasets, always use pagination:

```http
GET /v1/spreadsheets?page=1&limit=50
```

### Batch Operations

Use batch endpoints for multiple updates:

```http
POST /v1/spreadsheets/:id/cells/batch
```

### Handle Errors

Always check for errors and handle them appropriately:

```javascript
const response = await fetch(url, options)
const data = await response.json()

if (!data.success) {
  console.error('API Error:', data.error)
  // Handle error
}
```

### Retry Logic

Implement exponential backoff for rate limits:

```javascript
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options)

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After'))
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
      continue
    }

    return response
  }
}
```

---

## Next Steps

- **[API Explorer](/developer/explorer/)**: Test APIs interactively
- **[SDKs](/developer/sdk/)**: Use our official SDKs
- **[Examples](/developer/examples/)**: View code examples
- **[Tutorials](/developer/tutorials/)**: Step-by-step guides

---

## Need Help?

- **Documentation**: [Full documentation](/developer/)
- **Community**: [Join our Discord](https://discord.gg/spreadsheetmoment)
- **Support**: [Contact support](https://spreadsheetmoment.com/support)
- **Status**: [API Status](https://status.spreadsheetmoment.com)
