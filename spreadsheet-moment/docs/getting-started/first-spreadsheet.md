# Your First Spreadsheet

Learn to create and interact with spreadsheets programmatically.

## Create a Spreadsheet

### JavaScript

```typescript
const spreadsheet = await client.spreadsheets.create({
  name: 'My First Spreadsheet',
  columns: 26,
  rows: 1000
})

console.log('Created:', spreadsheet.id)
```

### Python

```python
spreadsheet = client.spreadsheets.create(
    name='My First Spreadsheet',
    columns=26,
    rows=1000
)

print(f'Created: {spreadsheet.id}')
```

## Add Data

### Setting Cells

```typescript
// Single cell
await spreadsheet.setCell('A1', 'Hello')
await spreadsheet.setCell('A2', 'World')

// Multiple cells
await spreadsheet.setCells({
  'A1': 'Product',
  'B1': 'Quantity',
  'C1': 'Price',
  'A2': 'Widget',
  'B2': 100,
  'C2': 19.99
})
```

### Getting Cells

```typescript
const cell = await spreadsheet.getCell('A1')
console.log(cell.value) // 'Hello'

const range = await spreadsheet.getRange('A1:C2')
console.log(range.values)
```

## Use Formulas

```typescript
await spreadsheet.setCell('D2', '=B2*C2') // Calculate total
await spreadsheet.setCell('D1', 'Total')

// The formula result is automatically calculated
const total = await spreadsheet.getCell('D2')
console.log(total.value) // 1999
```

## Complete Example

Here's a complete example creating a simple invoice:

```typescript
async function createInvoice() {
  const spreadsheet = await client.spreadsheets.create({
    name: 'Invoice Template'
  })

  // Headers
  await spreadsheet.setCells({
    'A1': 'Item',
    'B1': 'Quantity',
    'C1': 'Unit Price',
    'D1': 'Total'
  })

  // Data
  const items = [
    ['Widget A', 5, 29.99],
    ['Widget B', 3, 49.99],
    ['Widget C', 2, 19.99]
  ]

  let row = 2
  for (const [item, qty, price] of items) {
    await spreadsheet.setCells({
      [`A${row}`]: item,
      [`B${row}`]: qty,
      [`C${row}`]: price,
      [`D${row}`]: `=B${row}*C${row}`
    })
    row++
  }

  // Grand total
  await spreadsheet.setCell(`D${row}`, `=SUM(D2:D${row-1})`)
  await spreadsheet.setCell(`C${row}`, 'Grand Total:')

  return spreadsheet
}

const invoice = await createInvoice()
console.log('Invoice created:', invoice.id)
```

## Next Steps

- [Basic Formulas](./basic-formulas.md)
- [API Reference](../api/overview.md)
- [Tutorials](../tutorials/build-a-plugin.md)
