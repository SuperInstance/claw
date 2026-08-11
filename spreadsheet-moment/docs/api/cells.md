# Cells API

Complete reference for the Cells API.

## Get Cell

Retrieve a single cell value.

### Request

```http
GET /v1/spreadsheets/:id/cells/:cellId
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Spreadsheet ID |
| `cellId` | string | Cell ID (e.g., "A1", "B42") |

### Example

```bash
curl https://api.spreadsheetmoment.com/v1/spreadsheets/spr_12345/cells/A1 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Response

```json
{
  "data": {
    "cellId": "A1",
    "value": "Hello, World!",
    "formula": null,
    "type": "string",
    "format": {
      "bold": false,
      "italic": false,
      "backgroundColor": null
    },
    "updatedAt": "2024-01-01T00:00:00Z",
    "updatedBy": {
      "id": "usr_12345",
      "name": "John Doe"
    }
  }
}
```

## Set Cell

Update a single cell value.

### Request

```http
PUT /v1/spreadsheets/:id/cells/:cellId
```

### Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | any | Yes | Cell value (string, number, boolean) |
| `formula` | string | No | Formula (starts with =) |
| `format` | object | No | Cell formatting |

### Example

```bash
curl -X PUT https://api.spreadsheetmoment.com/v1/spreadsheets/spr_12345/cells/A1 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "Hello, World!",
    "format": {
      "bold": true,
      "backgroundColor": "#FF0000"
    }
  }'
```

### Response

```json
{
  "data": {
    "cellId": "A1",
    "value": "Hello, World!",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

## Batch Set Cells

Update multiple cells in one request.

### Request

```http
POST /v1/spreadsheets/:id/cells/batch
```

### Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cells` | object | Yes | Map of cellId to value |
| `format` | object | No | Default formatting |

### Example

```bash
curl -X POST https://api.spreadsheetmoment.com/v1/spreadsheets/spr_12345/cells/batch \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "cells": {
      "A1": "Name",
      "B1": "Quantity",
      "C1": "Price",
      "A2": "Widget",
      "B2": 100,
      "C2": 19.99
    }
  }'
```

### Response

```json
{
  "data": {
    "updated": 6,
    "cells": ["A1", "B1", "C1", "A2", "B2", "C2"]
  }
}
```

## Get Range

Retrieve a range of cells.

### Request

```http
GET /v1/spreadsheets/:id/ranges/:range
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Spreadsheet ID |
| `range` | string | Range (e.g., "A1:C10", "A:A", "1:1") |

### Example

```bash
curl https://api.spreadsheetmoment.com/v1/spreadsheets/spr_12345/ranges/A1:C10 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Response

```json
{
  "data": {
    "range": "A1:C10",
    "values": [
      ["Name", "Quantity", "Price"],
      ["Widget", 100, 19.99],
      ["Gadget", 50, 29.99]
    ],
    "formulas": [],
    "formats": []
  }
}
```

## Clear Cells

Clear cell values and formatting.

### Request

```http
DELETE /v1/spreadsheets/:id/cells/:cellId
```

### Example

```bash
curl -X DELETE https://api.spreadsheetmoment.com/v1/spreadsheets/spr_12345/cells/A1 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Response

```json
{
  "data": {
    "cellId": "A1",
    "cleared": true
  }
}
```

## Copy/Paste

Copy cells to a new location.

### Request

```http
POST /v1/spreadsheets/:id/cells/copy
```

### Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `source` | string | Yes | Source range |
| `destination` | string | Yes | Destination range |

### Example

```bash
curl -X POST https://api.spreadsheetmoment.com/v1/spreadsheets/spr_12345/cells/copy \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "A1:C10",
    "destination": "A11:C20"
  }'
```

## Cell Types

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text value | "Hello" |
| `number` | Numeric value | 42, 3.14 |
| `boolean` | True/false | true, false |
| `date` | Date/time | ISO 8601 string |
| `formula` | Formula expression | "=SUM(A1:A10)" |
| `error` | Error value | "#DIV/0!" |

## Cell Formatting

### Text Formatting

```json
{
  "bold": true,
  "italic": false,
  "underline": false,
  "strikethrough": false,
  "fontFamily": "Arial",
  "fontSize": 12,
  "color": "#000000"
}
```

### Cell Formatting

```json
{
  "backgroundColor": "#FFFFFF",
  "horizontalAlignment": "left",
  "verticalAlignment": "middle",
  "wrapText": false
}
```

### Number Formatting

```json
{
  "numberFormat": {
    "type": "currency",
    "pattern": "$#,##0.00"
  }
}
```

## SDK Examples

### JavaScript

```typescript
// Get cell
const cell = await spreadsheet.getCell('A1')

// Set cell
await spreadsheet.setCell('A1', 'Hello')

// Set with format
await spreadsheet.setCell('A1', 'Hello', {
  format: { bold: true, color: '#FF0000' }
})

// Batch set
await spreadsheet.setCells({
  'A1': 'Name',
  'B1': 'Quantity',
  'C1': 'Price'
})

// Get range
const range = await spreadsheet.getRange('A1:C10')

// Clear cell
await spreadsheet.clearCell('A1')
```

### Python

```python
# Get cell
cell = spreadsheet.get_cell('A1')

# Set cell
spreadsheet.set_cell('A1', 'Hello')

# Set with format
spreadsheet.set_cell('A1', 'Hello', format={
    'bold': True,
    'color': '#FF0000'
})

# Batch set
spreadsheet.set_cells({
    'A1': 'Name',
    'B1': 'Quantity',
    'C1': 'Price'
})

# Get range
range_data = spreadsheet.get_range('A1:C10')

# Clear cell
spreadsheet.clear_cell('A1')
```

## Next Steps

- [Spreadsheets API](./spreadsheets.md)
- [Formulas Reference](../guides/formulas/reference.md)
- [API Playground](./explorer/playground.md)
