# Integrate API

Learn to integrate the Spreadsheet Moment API into your applications.

## Overview

This tutorial shows you how to:
- Set up authentication
- Create and manage spreadsheets
- Read and write data
- Handle real-time updates

## Prerequisites

- Spreadsheet Moment account
- API key
- Node.js 18+

## Step 1: Install SDK

```bash
npm install @spreadsheetmoment/sdk
```

## Step 2: Initialize Client

```typescript
import { SpreadsheetMoment } from '@spreadsheetmoment/sdk'

const client = new SpreadsheetMoment({
  apiKey: process.env.SPREADSHEET_MOMENT_API_KEY
})
```

## Step 3: Create Spreadsheet

```typescript
async function createSpreadsheet() {
  const spreadsheet = await client.spreadsheets.create({
    name: 'API Integration Demo',
    columns: 26,
    rows: 1000
  })
  
  console.log('Created:', spreadsheet.id)
  return spreadsheet
}
```

## Step 4: Add Data

```typescript
async function populateData(spreadsheetId: string) {
  const spreadsheet = await client.spreadsheets.get(spreadsheetId)
  
  // Add headers
  await spreadsheet.setCells({
    'A1': 'Product',
    'B1': 'Quantity',
    'C1': 'Price',
    'D1': 'Total'
  })
  
  // Add data
  const products = [
    ['Widget A', 10, 29.99],
    ['Widget B', 5, 49.99],
    ['Widget C', 20, 19.99]
  ]
  
  let row = 2
  for (const [product, qty, price] of products) {
    await spreadsheet.setCells({
      [`A${row}`]: product,
      [`B${row}`]: qty,
      [`C${row}`]: price,
      [`D${row}`]: `=B${row}*C${row}`
    })
    row++
  }
  
  // Add total
  await spreadsheet.setCell(`D${row}`, `=SUM(D2:D${row-1})`)
}
```

## Step 5: Read Data

```typescript
async function readData(spreadsheetId: string) {
  const spreadsheet = await client.spreadsheets.get(spreadsheetId)
  
  // Get single cell
  const total = await spreadsheet.getCell('D5')
  console.log('Total:', total.value)
  
  // Get range
  const range = await spreadsheet.getRange('A1:D5')
  console.log('Data:', range.values)
}
```

## Step 6: Real-time Updates

```typescript
async function watchChanges(spreadsheetId: string) {
  const spreadsheet = await client.spreadsheets.get(spreadsheetId)
  
  // Listen for changes
  spreadsheet.on('cellChanged', (event) => {
    console.log(`Cell ${event.cellId} changed:`, event.value)
  })
  
  // Listen for errors
  spreadsheet.on('error', (error) => {
    console.error('Error:', error)
  })
}
```

## Complete Example

Here's a complete example building a simple inventory management system:

```typescript
import { SpreadsheetMoment } from '@spreadsheetmoment/sdk'

class InventoryManager {
  private client: SpreadsheetMoment
  private spreadsheetId: string
  
  constructor(apiKey: string) {
    this.client = new SpreadsheetMoment({ apiKey })
  }
  
  async initialize() {
    const spreadsheet = await this.client.spreadsheets.create({
      name: 'Inventory Management',
      columns: 26,
      rows: 1000
    })
    
    this.spreadsheetId = spreadsheet.id
    
    // Setup headers
    await this.setupHeaders()
    
    return spreadsheet
  }
  
  private async setupHeaders() {
    const spreadsheet = await this.client.spreadsheets.get(this.spreadsheetId)
    
    await spreadsheet.setCells({
      'A1': 'SKU',
      'B1': 'Product Name',
      'C1': 'Quantity',
      'D1': 'Price',
      'E1': 'Value',
      'F1': 'Status'
    })
  }
  
  async addProduct(sku: string, name: string, quantity: number, price: number) {
    const spreadsheet = await this.client.spreadsheets.get(this.spreadsheetId)
    
    // Find next empty row
    const existing = await spreadsheet.getRange('A:A')
    const row = existing.values.length + 1
    
    // Add product
    await spreadsheet.setCells({
      [`A${row}`]: sku,
      [`B${row}`]: name,
      [`C${row}`]: quantity,
      [`D${row}`]: price,
      [`E${row}`]: `=C${row}*D${row}`,
      [`F${row}`]: `=IF(C${row}<10, "Low Stock", "OK")`
    })
  }
  
  async updateQuantity(sku: string, quantity: number) {
    const spreadsheet = await this.client.spreadsheets.get(this.spreadsheetId)
    
    // Find row by SKU
    const skus = await spreadsheet.getRange('A:A')
    const row = skus.values.findIndex(([s]) => s === sku) + 1
    
    if (row === 0) {
      throw new Error(`Product ${sku} not found`)
    }
    
    // Update quantity
    await spreadsheet.setCell(`C${row}`, quantity)
  }
  
  async getLowStock() {
    const spreadsheet = await this.client.spreadsheets.get(this.spreadsheetId)
    
    const data = await spreadsheet.getRange('A2:F1000')
    const products = data.values.filter(row => row[5] === 'Low Stock')
    
    return products.map(([sku, name, qty]) => ({
      sku,
      name,
      quantity: qty
    }))
  }
  
  onProductChange(callback: (product: any) => void) {
    const spreadsheet = await this.client.spreadsheets.get(this.spreadsheetId)
    
    spreadsheet.on('cellChanged', (event) => {
      if (event.cellId.match(/^[A-F]2+$/)) {
        callback(event)
      }
    })
  }
}

// Usage
async function main() {
  const manager = new InventoryManager(process.env.API_KEY!)
  
  await manager.initialize()
  
  // Add products
  await manager.addProduct('SKU001', 'Widget A', 5, 29.99)
  await manager.addProduct('SKU002', 'Widget B', 15, 49.99)
  
  // Get low stock
  const lowStock = await manager.getLowStock()
  console.log('Low Stock:', lowStock)
  
  // Listen for changes
  manager.onProductChange((product) => {
    console.log('Product changed:', product)
  })
}

main().catch(console.error)
```

## Next Steps

- [API Reference](../api/overview.md)
- [Webhooks](../api/webhooks.md)
- [Best Practices](../guides/automation/api-integration.md)
