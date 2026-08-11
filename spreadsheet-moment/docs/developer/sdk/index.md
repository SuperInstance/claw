# SDK Documentation

Official SDKs for Spreadsheet Moment API in multiple programming languages. These SDKs provide type-safe interfaces, automatic authentication, error handling, and convenient methods for common operations.

## Available SDKs

| Language | Package | Version | License |
|----------|---------|---------|---------|
| **JavaScript/TypeScript** | `@spreadsheetmoment/sdk` | ![npm version](https://badge.fury.io/js/%40spreadsheetmoment%2Fsdk.svg) | MIT |
| **Python** | `spreadsheetmoment` | ![PyPI version](https://badge.fury.io/py/spreadsheetmoment.svg) | MIT |
| **Go** | `github.com/spreadsheetmoment/go-sdk` | ![Go Report Card](https://goreportcard.com/badge/github.com/spreadsheetmoment/go-sdk) | MIT |
| **Java** | `com.spreadsheetmoment:sdk` | ![Maven Central](https://img.shields.io/maven-central/v/com.spreadsheetmoment/sdk) | Apache 2.0 |

## Quick Links

- **[JavaScript/TypeScript SDK](#javascripttypescript-sdk)** - For Node.js, browsers, React, Vue, Angular
- **[Python SDK](#python-sdk)** - For Django, Flask, FastAPI, scripts
- **[Go SDK](#go-sdk)** - For Go services and microservices
- **[Java SDK](#java-sdk)** - For Spring Boot, Java applications

## Common Features

All official SDKs include:

- **Type Safety**: Full TypeScript types for JavaScript SDK, type hints for Python
- **Authentication**: Automatic API key management and token refresh
- **Error Handling**: Structured error objects with retry logic
- **Real-Time Updates**: WebSocket support for live collaboration
- **Streaming**: Batch operations and streaming for large datasets
- **Logging**: Built-in logging with configurable levels
- **Testing**: Mocking support for unit testing

---

## JavaScript/TypeScript SDK

The JavaScript SDK works in Node.js, browsers, and modern frameworks like React, Vue, and Angular.

### Installation

```bash
npm install @spreadsheetmoment/sdk
# or
yarn add @spreadsheetmoment/sdk
# or
pnpm add @spreadsheetmoment/sdk
```

### Setup

```typescript
import { SpreadsheetMomentClient } from '@spreadsheetmoment/sdk'

const client = new SpreadsheetMomentClient({
  apiKey: process.env.SPREADSHEET_MOMENT_API_KEY,
  environment: 'production', // or 'development'
  timeout: 30000, // 30 seconds
  maxRetries: 3
})
```

### Basic Usage

#### Create a Spreadsheet

```typescript
const spreadsheet = await client.spreadsheets.create({
  name: 'Sales Data 2024',
  rows: 100,
  columns: 10,
  description: 'Monthly sales tracking'
})

console.log('Created spreadsheet:', spreadsheet.id)
```

#### Update Cells

```typescript
// Single cell update
await spreadsheet.cells.update({
  A1: 'Product',
  B1: 'Price',
  C1: 'Quantity'
})

// Batch update
await spreadsheet.cells.batchUpdate([
  { cellId: 'A2', value: 'Widget' },
  { cellId: 'B2', value: 29.99 },
  { cellId: 'C2', value: 100 }
])
```

#### Read Cells

```typescript
// Get single cell
const cell = await spreadsheet.cells.get('A1')
console.log(cell.value) // 'Product'

// Get range
const range = await spreadsheet.cells.getRange('A1:C10')
console.log(range.cells)
```

#### Formulas

```typescript
// Set formula
await spreadsheet.cells.update({
  D1: '=SUM(B2:B100)'
})

// Calculate formula
const result = await spreadsheet.cells.calculate('=SUM(A1:A10)')
console.log(result.value) // Calculation result
```

#### Real-Time Updates

```typescript
// Subscribe to changes
spreadsheet.on('cellChanged', (event) => {
  console.log(`Cell ${event.cellId} changed:`, event.value)
})

spreadsheet.on('rowAdded', (event) => {
  console.log(`Row ${event.rowIndex} added`)
})

spreadsheet.on('collaboratorJoined', (event) => {
  console.log(`User ${event.userName} joined`)
})

// Unsubscribe
spreadsheet.off('cellChanged')
```

#### Webhooks

```typescript
// Create webhook
const webhook = await client.webhooks.create({
  url: 'https://your-app.com/webhooks/spreadsheet',
  events: ['cell.changed', 'row.added'],
  spreadsheetId: spreadsheet.id,
  secret: 'webhook_secret'
})

// List webhooks
const webhooks = await client.webhooks.list()

// Delete webhook
await webhook.delete()
```

### React Integration

```typescript
import { useSpreadsheet } from '@spreadsheetmoment/sdk/react'

function SalesDashboard() {
  const { spreadsheet, loading, error } = useSpreadsheet('sheet_abc123')

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>{spreadsheet.name}</h1>
      <CellGrid spreadsheet={spreadsheet} />
    </div>
  )
}
```

### Vue Integration

```typescript
import { useSpreadsheet } from '@spreadsheetmoment/sdk/vue'

<script setup lang="ts">
const { spreadsheet, loading, error } = useSpreadsheet('sheet_abc123')
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <h1>{{ spreadsheet.name }}</h1>
    <!-- Your spreadsheet UI -->
  </div>
</template>
```

### Advanced Features

#### Batch Operations

```typescript
const batch = spreadsheet.cells.createBatch()

// Queue multiple operations
batch.update('A1', 'Value 1')
batch.update('A2', 'Value 2')
batch.update('A3', 'Value 3')

// Execute all at once
await batch.execute()
```

#### Conditional Formatting

```typescript
await spreadsheet.conditionalFormatting.create({
  range: 'B1:B100',
  condition: {
    type: 'greaterThan',
    value: 1000
  },
  format: {
    backgroundColor: '#4CAF50',
    color: 'white',
    bold: true
  }
})
```

#### Charts

```typescript
const chart = await spreadsheet.charts.create({
  type: 'line',
  title: 'Sales Trend',
  dataRange: 'A1:B100',
  xAxisRange: 'A1:A100',
  yAxisRange: 'B1:B100'
})
```

---

## Python SDK

The Python SDK provides a Pythonic interface to the Spreadsheet Moment API.

### Installation

```bash
pip install spreadsheetmoment
# or
pipenv install spreadsheetmoment
# or
poetry add spreadsheetmoment
```

### Setup

```python
import os
from spreadsheetmoment import SpreadsheetMomentClient

client = SpreadsheetMomentClient(
    api_key=os.environ.get('SPREADSHEET_MOMENT_API_KEY'),
    environment='production',
    timeout=30,
    max_retries=3
)
```

### Basic Usage

#### Create a Spreadsheet

```python
spreadsheet = client.spreadsheets.create(
    name='Sales Data 2024',
    rows=100,
    columns=10,
    description='Monthly sales tracking'
)

print(f'Created spreadsheet: {spreadsheet.id}')
```

#### Update Cells

```python
# Single cell update
spreadsheet.cells.update({
    'A1': 'Product',
    'B1': 'Price',
    'C1': 'Quantity'
})

# Batch update
spreadsheet.cells.batch_update([
    {'cellId': 'A2', 'value': 'Widget'},
    {'cellId': 'B2', 'value': 29.99},
    {'cellId': 'C2', 'value': 100}
])
```

#### Read Cells

```python
# Get single cell
cell = spreadsheet.cells.get('A1')
print(cell.value)  # 'Product'

# Get range
range_data = spreadsheet.cells.get_range('A1:C10')
for cell in range_data.cells:
    print(f'{cell.id}: {cell.value}')
```

#### Formulas

```python
# Set formula
spreadsheet.cells.update({
    'D1': '=SUM(B2:B100)'
})

# Calculate formula
result = spreadsheet.cells.calculate('=SUM(A1:A10)')
print(result.value)  # Calculation result
```

#### Real-Time Updates

```python
# Subscribe to changes
def on_cell_changed(event):
    print(f'Cell {event.cell_id} changed: {event.value}')

spreadsheet.on('cellChanged', on_cell_changed)

# Unsubscribe
spreadsheet.off('cellChanged', on_cell_changed)
```

#### Pandas Integration

```python
import pandas as pd

# Convert spreadsheet to DataFrame
df = spreadsheet.to_dataframe()

# Update spreadsheet from DataFrame
spreadsheet.from_dataframe(df)
```

#### Async Support

```python
import asyncio
from spreadsheetmoment import AsyncSpreadsheetMomentClient

async def main():
    client = AsyncSpreadsheetMomentClient(api_key='your_api_key')

    spreadsheet = await client.spreadsheets.create(
        name='Async Spreadsheet',
        rows=100,
        columns=10
    )

    await spreadsheet.cells.update({'A1': 'Async Value'})

asyncio.run(main())
```

### Django Integration

```python
# views.py
from django.http import JsonResponse
from spreadsheetmoment import SpreadsheetMomentClient

def spreadsheet_view(request, spreadsheet_id):
    client = SpreadsheetMomentClient(api_key=request.user.api_key)
    spreadsheet = client.spreadsheets.get(spreadsheet_id)

    return JsonResponse({
        'id': spreadsheet.id,
        'name': spreadsheet.name,
        'cells': [cell.to_dict() for cell in spreadsheet.cells.all()]
    })
```

### FastAPI Integration

```python
from fastapi import FastAPI, Depends
from spreadsheetmoment import SpreadsheetMomentClient

app = FastAPI()

def get_client():
    return SpreadsheetMomentClient(api_key='your_api_key')

@app.get('/spreadsheets/{spreadsheet_id}')
async def get_spreadsheet(spreadsheet_id: str, client: SpreadsheetMomentClient = Depends(get_client)):
    spreadsheet = client.spreadsheets.get(spreadsheet_id)
    return spreadsheet.to_dict()
```

---

## Go SDK

The Go SDK provides a Go idiomatic interface for Go applications and microservices.

### Installation

```bash
go get github.com/spreadsheetmoment/go-sdk
```

### Setup

```go
package main

import (
    "os"
    "github.com/spreadsheetmoment/go-sdk"
)

func main() {
    client := spreadsheetmoment.NewClient(
        spreadsheetmoment.WithAPIKey(os.Getenv("SPREADSHEET_MOMENT_API_KEY")),
        spreadsheetmoment.WithEnvironment("production"),
        spreadsheetmoment.WithTimeout(30*time.Second),
        spreadsheetmoment.WithMaxRetries(3),
    )
}
```

### Basic Usage

#### Create a Spreadsheet

```go
spreadsheet, err := client.Spreadsheets.Create(context.Background(), &spreadsheetmoment.CreateSpreadsheetInput{
    Name:        "Sales Data 2024",
    Rows:        100,
    Columns:     10,
    Description: "Monthly sales tracking",
})

if err != nil {
    log.Fatal(err)
}

fmt.Printf("Created spreadsheet: %s\n", spreadsheet.ID)
```

#### Update Cells

```go
// Single cell update
err := spreadsheet.Cells.Update(context.Background(), map[string]string{
    "A1": "Product",
    "B1": "Price",
    "C1": "Quantity",
})

// Batch update
err = spreadsheet.Cells.BatchUpdate(context.Background(), []*spreadsheetmoment.CellUpdate{
    {CellID: "A2", Value: "Widget"},
    {CellID: "B2", Value: 29.99},
    {CellID: "C2", Value: 100},
})
```

#### Read Cells

```go
// Get single cell
cell, err := spreadsheet.Cells.Get(context.Background(), "A1")
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Cell A1: %s\n", cell.Value)

// Get range
range, err := spreadsheet.Cells.GetRange(context.Background(), "A1", "C10")
if err != nil {
    log.Fatal(err)
}

for _, cell := range range.Cells {
    fmt.Printf("%s: %s\n", cell.ID, cell.Value)
}
```

#### Real-Time Updates

```go
// Subscribe to changes
ctx, cancel := context.WithCancel(context.Background())
defer cancel()

events := make(chan *spreadsheetmoment.CellChangedEvent)

go func() {
    for event := range events {
        fmt.Printf("Cell %s changed: %s\n", event.CellID, event.Value)
    }
}()

err = spreadsheet.Subscribe(ctx, events)
```

### HTTP Handler Integration

```go
func spreadsheetHandler(w http.ResponseWriter, r *http.Request) {
    client := spreadsheetmoment.NewClient(
        spreadsheetmoment.WithAPIKey(r.Header.Get("X-API-Key")),
    )

    vars := mux.Vars(r)
    spreadsheet, err := client.Spreadsheets.Get(r.Context(), vars["id"])

    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(spreadsheet)
}
```

---

## Java SDK

The Java SDK provides a Java interface for Spring Boot and other Java applications.

### Installation (Maven)

```xml
<dependency>
    <groupId>com.spreadsheetmoment</groupId>
    <artifactId>sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Installation (Gradle)

```gradle
implementation 'com.spreadsheetmoment:sdk:1.0.0'
```

### Setup

```java
import com.spreadsheetmoment.sdk.*;
import com.spreadsheetmoment.sdk.auth.*;

public class Main {
    public static void main(String[] args) {
        SpreadsheetMomentClient client = SpreadsheetMomentClient.builder()
            .apiKey(System.getenv("SPREADSHEET_MOMENT_API_KEY"))
            .environment(Environment.PRODUCTION)
            .timeout(Duration.ofSeconds(30))
            .maxRetries(3)
            .build();
    }
}
```

### Basic Usage

#### Create a Spreadsheet

```java
Spreadsheet spreadsheet = client.spreadsheets().create(CreateSpreadsheetRequest.builder()
    .name("Sales Data 2024")
    .rows(100)
    .columns(10)
    .description("Monthly sales tracking")
    .build());

System.out.println("Created spreadsheet: " + spreadsheet.getId());
```

#### Update Cells

```java
// Single cell update
Map<String, String> updates = new HashMap<>();
updates.put("A1", "Product");
updates.put("B1", "Price");
updates.put("C1", "Quantity");

spreadsheet.cells().update(updates);

// Batch update
List<CellUpdate> batchUpdates = Arrays.asList(
    CellUpdate.builder().cellId("A2").value("Widget").build(),
    CellUpdate.builder().cellId("B2").value("29.99").build(),
    CellUpdate.builder().cellId("C2").value("100").build()
);

spreadsheet.cells().batchUpdate(batchUpdates);
```

#### Read Cells

```java
// Get single cell
Cell cell = spreadsheet.cells().get("A1");
System.out.println("Cell A1: " + cell.getValue());

// Get range
CellRange range = spreadsheet.cells().getRange("A1", "C10");
for (Cell c : range.getCells()) {
    System.out.println(c.getId() + ": " + c.getValue());
}
```

### Spring Boot Integration

```java
@RestController
@RequestMapping("/api/spreadsheets")
public class SpreadsheetController {

    private final SpreadsheetMomentClient client;

    public SpreadsheetController(SpreadsheetMomentClient client) {
        this.client = client;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Spreadsheet> getSpreadsheet(@PathVariable String id) {
        Spreadsheet spreadsheet = client.spreadsheets().get(id);
        return ResponseEntity.ok(spreadsheet);
    }

    @PostMapping("/{id}/cells")
    public ResponseEntity<Cell> updateCell(
        @PathVariable String id,
        @RequestBody UpdateCellRequest request
    ) {
        Spreadsheet spreadsheet = client.spreadsheets().get(id);
        Cell cell = spreadsheet.cells().update(request.getCellId(), request.getValue());
        return ResponseEntity.ok(cell);
    }
}
```

---

## Best Practices

### Error Handling

```typescript
try {
  const spreadsheet = await client.spreadsheets.create({ name: 'Test' })
} catch (error) {
  if (error instanceof SpreadsheetMomentError) {
    if (error.statusCode === 429) {
      // Rate limit exceeded
      console.error('Rate limited. Retry after:', error.retryAfter)
    } else if (error.statusCode === 401) {
      // Authentication failed
      console.error('Invalid API key')
    }
  }
}
```

### Retry Logic

All SDKs include automatic retry logic for transient failures:

```typescript
const client = new SpreadsheetMomentClient({
  apiKey: 'your_api_key',
  maxRetries: 3,
  retryDelay: 1000, // Initial delay in ms
  retryMultiplier: 2, // Exponential backoff
  maxRetryDelay: 10000 // Max delay in ms
})
```

### Logging

```typescript
const client = new SpreadsheetMomentClient({
  apiKey: 'your_api_key',
  logger: {
    level: 'debug',
    handler: (message) => console.log(`[SpreadsheetMoment] ${message}`)
  }
})
```

### Testing

Mock the SDK for testing:

```typescript
import { mockSpreadsheetClient } from '@spreadsheetmoment/sdk/testing'

const mockClient = mockSpreadsheetClient({
  spreadsheets: {
    create: () => ({ id: 'test_123', name: 'Test' })
  }
})

await mockClient.spreadsheets.create({ name: 'Test' })
```

## Next Steps

- **[API Reference](/api/overview)**: Complete API documentation
- **[Examples](/developer/examples/)**: Sample code and integrations
- **[Tutorials](/developer/tutorials/)**: Step-by-step guides
- **[API Explorer](/developer/explorer/)**: Interactive testing

## Support

- **Documentation**: [Full SDK docs](https://docs.spreadsheetmoment.com/sdk)
- **GitHub Issues**: [Report bugs](https://github.com/spreadsheetmoment/sdk/issues)
- **Community**: [Join our Discord](https://discord.gg/spreadsheetmoment)
- **Support**: [Contact support](https://spreadsheetmoment.com/support)
