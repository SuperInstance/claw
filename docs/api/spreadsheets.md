# Spreadsheets API

Complete reference for the Spreadsheets API.

## List Spreadsheets

Retrieve all spreadsheets accessible to the authenticated user.

### Request

```http
GET /v1/spreadsheets
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `perPage` | integer | No | Items per page (default: 20, max: 100) |
| `search` | string | No | Search in name and description |
| `sortBy` | string | No | Sort field (name, createdAt, updatedAt) |
| `sortOrder` | string | No | Sort order (asc, desc) |

### Example

```bash
curl "https://api.spreadsheetmoment.com/v1/spreadsheets?page=1&perPage=20" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Response

```json
{
  "data": [
    {
      "id": "spr_12345",
      "name": "Sales Data",
      "description": "Monthly sales figures",
      "columns": 26,
      "rows": 1000,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-02T00:00:00Z",
      "owner": {
        "id": "usr_12345",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "permission": "editor"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "perPage": 20,
    "totalPages": 3
  }
}
```

## Create Spreadsheet

Create a new spreadsheet.

### Request

```http
POST /v1/spreadsheets
```

### Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Spreadsheet name |
| `description` | string | No | Spreadsheet description |
| `columns` | integer | No | Number of columns (default: 26) |
| `rows` | integer | No | Number of rows (default: 1000) |
| `timezone` | string | No | Timezone (default: UTC) |

### Example

```bash
curl -X POST https://api.spreadsheetmoment.com/v1/spreadsheets \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sales Data",
    "description": "Monthly sales figures",
    "columns": 26,
    "rows": 1000
  }'
```

### Response

```json
{
  "data": {
    "id": "spr_12345",
    "name": "Sales Data",
    "description": "Monthly sales figures",
    "columns": 26,
    "rows": 1000,
    "createdAt": "2024-01-01T00:00:00Z",
    "owner": {
      "id": "usr_12345",
      "name": "John Doe"
    }
  }
}
```

## Get Spreadsheet

Retrieve a specific spreadsheet.

### Request

```http
GET /v1/spreadsheets/:id
```

### Example

```bash
curl https://api.spreadsheetmoment.com/v1/spreadsheets/spr_12345 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Response

```json
{
  "data": {
    "id": "spr_12345",
    "name": "Sales Data",
    "description": "Monthly sales figures",
    "columns": 26,
    "rows": 1000,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z",
    "settings": {
      "timezone": "UTC",
      "locale": "en-US"
    },
    "owner": {
      "id": "usr_12345",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "collaborators": [
      {
        "id": "usr_67890",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "editor",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

## Update Spreadsheet

Update spreadsheet metadata.

### Request

```http
PATCH /v1/spreadsheets/:id
```

### Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | New name |
| `description` | string | No | New description |
| `settings` | object | No | Spreadsheet settings |

### Example

```bash
curl -X PATCH https://api.spreadsheetmoment.com/v1/spreadsheets/spr_12345 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Sales Data",
    "description": "Updated description"
  }'
```

### Response

```json
{
  "data": {
    "id": "spr_12345",
    "name": "Updated Sales Data",
    "description": "Updated description",
    "updatedAt": "2024-01-03T00:00:00Z"
  }
}
```

## Delete Spreadsheet

Delete a spreadsheet.

### Request

```http
DELETE /v1/spreadsheets/:id
```

### Example

```bash
curl -X DELETE https://api.spreadsheetmoment.com/v1/spreadsheets/spr_12345 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Response

```json
{
  "data": {
    "id": "spr_12345",
    "deleted": true
  }
}
```

## Duplicate Spreadsheet

Create a copy of a spreadsheet.

### Request

```http
POST /v1/spreadsheets/:id/duplicate
```

### Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Name for the duplicate |
| `includeData` | boolean | No | Include cell data (default: true) |

### Example

```bash
curl -X POST https://api.spreadsheetmoment.com/v1/spreadsheets/spr_12345/duplicate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sales Data - Copy",
    "includeData": true
  }'
```

### Response

```json
{
  "data": {
    "id": "spr_67890",
    "name": "Sales Data - Copy",
    "sourceId": "spr_12345",
    "createdAt": "2024-01-03T00:00:00Z"
  }
}
```

## SDK Examples

### JavaScript

```typescript
// List spreadsheets
const spreadsheets = await client.spreadsheets.list({
  page: 1,
  perPage: 20,
  search: 'sales'
})

// Create spreadsheet
const spreadsheet = await client.spreadsheets.create({
  name: 'New Spreadsheet',
  columns: 26,
  rows: 1000
})

// Get spreadsheet
const data = await client.spreadsheets.get('spr_12345')

// Update spreadsheet
await client.spreadsheets.update('spr_12345', {
  name: 'Updated Name'
})

// Delete spreadsheet
await client.spreadsheets.delete('spr_12345')
```

### Python

```python
# List spreadsheets
spreadsheets = client.spreadsheets.list(
    page=1,
    per_page=20,
    search='sales'
)

# Create spreadsheet
spreadsheet = client.spreadsheets.create(
    name='New Spreadsheet',
    columns=26,
    rows=1000
)

# Get spreadsheet
data = client.spreadsheets.get('spr_12345')

# Update spreadsheet
client.spreadsheets.update(
    'spr_12345',
    name='Updated Name'
)

# Delete spreadsheet
client.spreadsheets.delete('spr_12345')
```

## Next Steps

- [Cells API](./cells.md)
- [Webhooks API](./webhooks.md)
- [API Playground](./explorer/playground.md)
