# Quick Start Guide

Get started with Spreadsheet Moment APIs in under 5 minutes. This guide will walk you through making your first API call and setting up your development environment.

## Prerequisites

Before you begin, make sure you have:

- A Spreadsheet Moment account ([sign up free](https://spreadsheetmoment.com/signup))
- An API key from the [developer dashboard](https://dashboard.spreadsheetmoment.com/api-keys)
- Basic familiarity with REST APIs or GraphQL
- Your preferred programming language (JavaScript, Python, Go, or Java)

## Step 1: Get Your API Key

1. Log in to your [Spreadsheet Moment dashboard](https://dashboard.spreadsheetmoment.com)
2. Navigate to **Settings** → **API Keys**
3. Click **Generate New API Key**
4. Copy your API key and store it securely

::: warning API Key Security
Never expose your API key in client-side code or public repositories. Use environment variables or secret management.
:::

## Step 2: Make Your First API Call

### Using cURL

```bash
curl -X GET "https://api.spreadsheetmoment.com/v1/spreadsheets" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### Using JavaScript

```javascript
const apiKey = process.env.SPREADSHEET_MOMENT_API_KEY;

const response = await fetch('https://api.spreadsheetmoment.com/v1/spreadsheets', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
});

const spreadsheets = await response.json();
console.log(spreadsheets);
```

### Using Python

```python
import os
import requests

api_key = os.environ.get('SPREADSHEET_MOMENT_API_KEY')

response = requests.get(
    'https://api.spreadsheetmoment.com/v1/spreadsheets',
    headers={
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
)

spreadsheets = response.json()
print(spreadsheets)
```

### Using Go

```go
package main

import (
    "fmt"
    "net/http"
    "os"
)

func main() {
    apiKey := os.Getenv("SPREADSHEET_MOMENT_API_KEY")

    req, _ := http.NewRequest("GET", "https://api.spreadsheetmoment.com/v1/spreadsheets", nil)
    req.Header.Set("Authorization", "Bearer "+apiKey)
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    fmt.Println(resp.Status)
}
```

## Step 3: Create a Spreadsheet

Now let's create a new spreadsheet programmatically:

```javascript
const response = await fetch('https://api.spreadsheetmoment.com/v1/spreadsheets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My First API Spreadsheet',
    rows: 10,
    columns: 5
  })
});

const spreadsheet = await response.json();
console.log('Created spreadsheet:', spreadsheet.id);
```

## Step 4: Add Data to Cells

```javascript
const spreadsheetId = 'spreadsheet_abc123';

// Add data to multiple cells
const response = await fetch(
  `https://api.spreadsheetmoment.com/v1/spreadsheets/${spreadsheetId}/cells/batch`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      updates: [
        { cellId: 'A1', value: 'Product' },
        { cellId: 'B1', value: 'Price' },
        { cellId: 'A2', value: 'Widget' },
        { cellId: 'B2', value: '29.99' }
      ]
    })
  }
);

const result = await response.json();
console.log('Updated cells:', result.updated);
```

## Step 5: Read Cell Values

```javascript
const response = await fetch(
  `https://api.spreadsheetmoment.com/v1/spreadsheets/${spreadsheetId}/cells?range=A1:B2`,
  {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  }
);

const data = await response.json();
console.log('Cell data:', data.cells);
```

## Using the SDKs

For a better developer experience, we recommend using our official SDKs:

### JavaScript/TypeScript SDK

```bash
npm install @spreadsheetmoment/sdk
```

```javascript
import { SpreadsheetMomentClient } from '@spreadsheetmoment/sdk';

const client = new SpreadsheetMomentClient({
  apiKey: process.env.SPREADSHEET_MOMENT_API_KEY
});

const spreadsheet = await client.spreadsheets.create({
  name: 'My First SDK Spreadsheet',
  rows: 10,
  columns: 5
});

await spreadsheet.cells.update({
  A1: 'Hello',
  B1: 'World'
});

const value = await spreadsheet.cells.get('A1');
console.log(value); // 'Hello'
```

### Python SDK

```bash
pip install spreadsheetmoment
```

```python
from spreadsheetmoment import SpreadsheetMomentClient

client = SpreadsheetMomentClient(
    api_key=os.environ.get('SPREADSHEET_MOMENT_API_KEY')
)

spreadsheet = client.spreadsheets.create(
    name='My First Python Spreadsheet',
    rows=10,
    columns=5
)

spreadsheet.cells.update({
    'A1': 'Hello',
    'B1': 'World'
})

value = spreadsheet.cells.get('A1')
print(value)  # 'Hello'
```

## Next Steps

Now that you've made your first API calls, explore more features:

- **[API Explorer](/developer/explorer/)**: Test APIs interactively in your browser
- **[SDK Documentation](/developer/sdk/)**: Learn more about our official SDKs
- **[Tutorials](/developer/tutorials/)**: Step-by-step guides for common patterns
- **[API Reference](/api/overview)**: Complete API documentation

## Common Use Cases

### Real-Time Collaboration

```javascript
// Subscribe to real-time updates
const spreadsheet = await client.spreadsheets.get(spreadsheetId);

spreadsheet.on('cellChanged', (event) => {
  console.log(`Cell ${event.cellId} changed:`, event.value);
});

spreadsheet.on('userJoined', (event) => {
  console.log(`User ${event.userId} joined the session`);
});
```

### Formulas and Calculations

```javascript
// Set formulas
await spreadsheet.cells.update({
  A1: 10,
  A2: 20,
  A3: '=SUM(A1:A2)'  // Will automatically calculate to 30
});

const result = await spreadsheet.cells.get('A3');
console.log(result.value); // 30
```

### Webhook Integration

```javascript
// Set up webhook for change notifications
await client.webhooks.create({
  url: 'https://your-app.com/webhooks/spreadsheet',
  events: ['cell.changed', 'row.added'],
  spreadsheetId: spreadsheetId
});
```

## Getting Help

- **Documentation**: [Full API reference](/api/overview)
- **Examples**: [Code examples](/developer/examples/)
- **Community**: [Join our Discord](https://discord.gg/spreadsheetmoment)
- **Support**: [Contact support](https://spreadsheetmoment.com/support)

## Rate Limits

Be aware of our rate limits:

| Plan | Requests/Minute | Requests/Hour |
|------|----------------|---------------|
| Free | 60 | 1,000 |
| Pro | 300 | 10,000 |
| Enterprise | Custom | Custom |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 299
X-RateLimit-Reset: 1640995200
```

## Best Practices

### 1. Use Environment Variables

```bash
# .env file
SPREADSHEET_MOMENT_API_KEY=your_api_key_here
```

### 2. Handle Errors Gracefully

```javascript
try {
  const spreadsheet = await client.spreadsheets.create({ name: 'Test' });
} catch (error) {
  if (error.status === 429) {
    // Rate limit exceeded - implement retry logic
    await retryWithBackoff(() => client.spreadsheets.create({ name: 'Test' }));
  } else {
    console.error('Error:', error.message);
  }
}
```

### 3. Use Batch Operations

```javascript
// Good: Batch updates
await spreadsheet.cells.batchUpdate([
  { cellId: 'A1', value: 'Data 1' },
  { cellId: 'A2', value: 'Data 2' },
  { cellId: 'A3', value: 'Data 3' }
]);

// Avoid: Multiple individual updates
await spreadsheet.cells.update('A1', 'Data 1');
await spreadsheet.cells.update('A2', 'Data 2');
await spreadsheet.cells.update('A3', 'Data 3');
```

### 4. Implement Caching

```javascript
// Cache spreadsheet metadata
const cache = new Map();

async function getSpreadsheet(id) {
  if (cache.has(id)) {
    return cache.get(id);
  }

  const spreadsheet = await client.spreadsheets.get(id);
  cache.set(id, spreadsheet);

  // Invalidate cache after 5 minutes
  setTimeout(() => cache.delete(id), 5 * 60 * 1000);

  return spreadsheet;
}
```

## What's Next?

You're now ready to build powerful integrations with Spreadsheet Moment! Explore our comprehensive documentation for more advanced features and patterns.

[Continue to API Explorer →](/developer/explorer/)
