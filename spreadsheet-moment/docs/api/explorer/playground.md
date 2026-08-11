# API Playground

Interactive API explorer for testing Spreadsheet Moment API endpoints.

## Overview

The API Playground allows you to:
- Test API endpoints without writing code
- Explore request/response formats
- Generate code snippets
- Save and share requests

## Authentication

First, authenticate with your API key:

<script setup>
import { ref } from 'vue'

const apiKey = ref('')

function setApiKey() {
  localStorage.setItem('spreadsheet-moment-api-key', apiKey.value)
  alert('API key saved!')
}
</script>

<div class="api-playground">
  <div class="auth-section">
    <h3>Authentication</h3>
    <input 
      v-model="apiKey" 
      type="password" 
      placeholder="Enter your API key"
      class="api-input"
    />
    <button @click="setApiKey" class="api-button">Save API Key</button>
  </div>
</div>

## Create Spreadsheet

Try creating your first spreadsheet:

<div class="api-playground">
  <h4>POST /v1/spreadsheets</h4>
  <pre class="request-body">{
  "name": "My Test Spreadsheet",
  "columns": 26,
  "rows": 1000
}</pre>
  <button class="api-button">Send Request</button>
</div>

**Response:**

```json
{
  "data": {
    "id": "spr_test123",
    "name": "My Test Spreadsheet",
    "columns": 26,
    "rows": 1000,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## Set Cell Value

Try setting a cell value:

<div class="api-playground">
  <h4>PUT /v1/spreadsheets/{id}/cells/{cellId}</h4>
  <pre class="request-body">{
  "value": "Hello from the API!"
}</pre>
  <button class="api-button">Send Request</button>
</div>

## Get Range

Retrieve a range of cells:

<div class="api-playground">
  <h4>GET /v1/spreadsheets/{id}/ranges/{range}</h4>
  <input 
    type="text" 
    placeholder="A1:C10" 
    class="api-input"
    value="A1:C10"
  />
  <button class="api-button">Send Request</button>
</div>

## Code Snippets

Generate code snippets for any language:

### JavaScript

```typescript
import { SpreadsheetMoment } from '@spreadsheetmoment/sdk'

const client = new SpreadsheetMoment({
  apiKey: 'your-api-key'
})

const spreadsheet = await client.spreadsheets.create({
  name: 'My Test Spreadsheet'
})

await spreadsheet.setCell('A1', 'Hello from the API!')
```

### Python

```python
from spreadsheetmoment import SpreadsheetMoment

client = SpreadsheetMoment(api_key='your-api-key')

spreadsheet = client.spreadsheets.create(
    name='My Test Spreadsheet'
)

spreadsheet.set_cell('A1', 'Hello from the API!')
```

### cURL

```bash
curl -X POST https://api.spreadsheetmoment.com/v1/spreadsheets \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Test Spreadsheet"
  }'
```

## Next Steps

- [API Overview](../overview.md)
- [Authentication](../authentication.md)
- [Schema Viewer](./schema.md)
