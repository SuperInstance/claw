# Code Examples

Real-world code examples and sample integrations to help you build with Spreadsheet Moment APIs and SDKs.

## Featured Examples

### Sales Dashboard
**Technologies:** React, TypeScript, WebSocket

A complete real-time sales dashboard with live data updates, charts, and team collaboration.

[View Example →](sales-dashboard)

**Features:**
- Real-time sales data updates
- Interactive charts and visualizations
- Team collaboration and comments
- Data filtering and search
- Export to PDF/Excel

### Inventory Management System
**Technologies:** Python, Flask, PostgreSQL

Track inventory levels, set up alerts, and generate reports automatically.

[View Example →](inventory-management)

**Features:**
- Real-time stock tracking
- Low stock alerts
- Supplier management
- Barcode scanning integration
- Purchase order generation

### Project Planning Tool
**Technologies:** Vue.js, Node.js, MongoDB

Collaborative project planning with task management, timelines, and team coordination.

[View Example →](project-planner)

**Features:**
- Gantt chart visualization
- Task assignments and dependencies
- Progress tracking
- Team workload management
- Milestone notifications

### Invoice Generator
**Technologies:** JavaScript, Express, PDF.js

Automatically generate professional invoices from spreadsheet data.

[View Example →](invoice-generator)

**Features:**
- Automatic calculations
- Custom templates
- PDF generation
- Email integration
- Payment tracking

## Quick Examples

### Create a Spreadsheet

#### JavaScript
```javascript
import { SpreadsheetMomentClient } from '@spreadsheetmoment/sdk'

const client = new SpreadsheetMomentClient({
  apiKey: process.env.API_KEY
})

const spreadsheet = await client.spreadsheets.create({
  name: 'Monthly Budget',
  rows: 50,
  columns: 10
})

console.log('Created:', spreadsheet.id)
```

#### Python
```python
from spreadsheetmoment import SpreadsheetMomentClient

client = SpreadsheetMomentClient(api_key='your_api_key')

spreadsheet = client.spreadsheets.create(
    name='Monthly Budget',
    rows=50,
    columns=10
)

print(f'Created: {spreadsheet.id}')
```

#### Go
```go
client := spreadsheetmoment.NewClient(
    spreadsheetmoment.WithAPIKey("your_api_key"),
)

spreadsheet, err := client.Spreadsheets.Create(context.Background(), &spreadsheetmoment.CreateSpreadsheetInput{
    Name:    "Monthly Budget",
    Rows:    50,
    Columns: 10,
})

fmt.Printf("Created: %s\n", spreadsheet.ID)
```

### Update Cells with Formatting

#### JavaScript
```javascript
await spreadsheet.cells.update({
  A1: {
    value: 'Revenue',
    format: {
      bold: true,
      color: '#2ecc71',
      fontSize: 14
    }
  },
  B1: {
    value: 'Q1 2024',
    format: {
      bold: true,
      backgroundColor: '#3498db',
      color: 'white'
    }
  }
})
```

#### Python
```python
await spreadsheet.cells.update({
    'A1': {
        'value': 'Revenue',
        'format': {
            'bold': True,
            'color': '#2ecc71',
            'font_size': 14
        }
    },
    'B1': {
        'value': 'Q1 2024',
        'format': {
            'bold': True,
            'background_color': '#3498db',
            'color': 'white'
        }
    }
})
```

### Real-Time Collaboration

#### JavaScript
```javascript
// Subscribe to changes
spreadsheet.on('cellChanged', (event) => {
  console.log(`${event.user.name} changed ${event.cellId} to ${event.value}`)

  // Update UI
  updateCellInUI(event.cellId, event.value)
})

spreadsheet.on('userJoined', (event) => {
  console.log(`${event.user.name} joined the session`)
  showUserCursor(event.user)
})

spreadsheet.on('userLeft', (event) => {
  console.log(`${event.user.name} left the session`)
  removeUserCursor(event.user)
})
```

#### Python
```python
def on_cell_changed(event):
    print(f"{event.user.name} changed {event.cell_id} to {event.value}")
    # Update UI
    update_cell_in_ui(event.cell_id, event.value)

def on_user_joined(event):
    print(f"{event.user.name} joined the session")
    show_user_cursor(event.user)

spreadsheet.on('cellChanged', on_cell_changed)
spreadsheet.on('userJoined', on_user_joined)
```

### Formula Calculations

#### JavaScript
```javascript
// Set up data
await spreadsheet.cells.update({
  A1: 'Product',
  B1: 'Quantity',
  C1: 'Price',
  D1: 'Total'
})

await spreadsheet.cells.batchUpdate([
  { cellId: 'A2', value: 'Widget' },
  { cellId: 'B2', value: 10 },
  { cellId: 'C2', value: 29.99 },
  { cellId: 'D2', value: '=B2*C2' } // Auto-calculated
])

// Get calculated value
const total = await spreadsheet.cells.get('D2')
console.log('Total:', total.value) // 299.90
```

#### Python
```python
# Set up data
await spreadsheet.cells.update({
    'A1': 'Product',
    'B1': 'Quantity',
    'C1': 'Price',
    'D1': 'Total'
})

await spreadsheet.cells.batch_update([
    {'cellId': 'A2', 'value': 'Widget'},
    {'cellId': 'B2', 'value': 10},
    {'cellId': 'C2', 'value': 29.99},
    {'cellId': 'D2', 'value': '=B2*C2'}  # Auto-calculated
])

# Get calculated value
total = await spreadsheet.cells.get('D2')
print(f'Total: {total.value}')  # 299.90
```

### Conditional Formatting

#### JavaScript
```javascript
// Highlight high values
await spreadsheet.conditionalFormatting.create({
  range: 'B2:B100',
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

// Highlight low values
await spreadsheet.conditionalFormatting.create({
  range: 'B2:B100',
  condition: {
    type: 'lessThan',
    value: 100
  },
  format: {
    backgroundColor: '#f44336',
    color: 'white'
  }
})
```

#### Python
```python
# Highlight high values
await spreadsheet.conditionalFormatting.create(
    range='B2:B100',
    condition={
        'type': 'greaterThan',
        'value': 1000
    },
    format={
        'background_color': '#4CAF50',
        'color': 'white',
        'bold': True
    }
)

# Highlight low values
await spreadsheet.conditionalFormatting.create(
    range='B2:B100',
    condition={
        'type': 'lessThan',
        'value': 100
    },
    format={
        'background_color': '#f44336',
        'color': 'white'
    }
)
```

### Data Validation

#### JavaScript
```javascript
// Dropdown list
await spreadsheet.dataValidation.create({
  range: 'A2:A100',
  validation: {
    type: 'list',
    values: ['Active', 'Inactive', 'Pending']
  }
})

// Number range
await spreadsheet.dataValidation.create({
  range: 'B2:B100',
  validation: {
    type: 'number',
    min: 0,
    max: 100
  },
  error: 'Value must be between 0 and 100'
})

// Custom formula
await spreadsheet.dataValidation.create({
  range: 'C2:C100',
  validation: {
    type: 'custom',
    formula: '=C2>=B2' // C2 must be >= B2
  },
  error: 'Value cannot be less than column B'
})
```

#### Python
```python
# Dropdown list
await spreadsheet.dataValidation.create(
    range='A2:A100',
    validation={
        'type': 'list',
        'values': ['Active', 'Inactive', 'Pending']
    }
)

# Number range
await spreadsheet.dataValidation.create(
    range='B2:B100',
    validation={
        'type': 'number',
        'min': 0,
        'max': 100
    },
    error='Value must be between 0 and 100'
)

# Custom formula
await spreadsheet.dataValidation.create(
    range='C2:C100',
    validation={
        'type': 'custom',
        'formula': '=C2>=B2'  # C2 must be >= B2
    },
    error='Value cannot be less than column B'
)
```

### Charts and Visualizations

#### JavaScript
```javascript
// Create a chart
const chart = await spreadsheet.charts.create({
  type: 'line',
  title: 'Revenue Trend',
  position: {
    row: 2,
    column: 12
  },
  size: {
    width: 600,
    height: 400
  },
  dataSource: {
    range: 'A1:B12',
    xAxis: 'A1:A12',
    yAxis: 'B1:B12',
    series: [
      {
        name: 'Revenue',
        color: '#3498db'
      }
    ]
  },
  options: {
    showLegend: true,
    showGridlines: true,
    animation: true
  }
})
```

#### Python
```python
# Create a chart
chart = await spreadsheet.charts.create(
    type='line',
    title='Revenue Trend',
    position={
        'row': 2,
        'column': 12
    },
    size={
        'width': 600,
        'height': 400
    },
    dataSource={
        'range': 'A1:B12',
        'xAxis': 'A1:A12',
        'yAxis': 'B1:B12',
        'series': [
            {
                'name': 'Revenue',
                'color': '#3498db'
            }
        ]
    },
    options={
        'showLegend': True,
        'showGridlines': True,
        'animation': True
    }
)
```

### Webhook Integration

#### JavaScript (Express)
```javascript
import express from 'express'
import crypto from 'crypto'

const app = express()

// Verify webhook signature
app.post('/webhooks/spreadsheet', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-webhook-signature']
  const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET)
  hmac.update(req.body)
  const digest = hmac.digest('hex')

  if (signature !== `sha256=${digest}`) {
    return res.status(401).send('Invalid signature')
  }

  const event = JSON.parse(req.body)

  // Handle different event types
  switch (event.type) {
    case 'cell.changed':
      await handleCellChange(event.data)
      break
    case 'row.added':
      await handleRowAdded(event.data)
      break
    case 'collaborator.joined':
      await handleCollaboratorJoined(event.data)
      break
  }

  res.status(200).send('OK')
})

async function handleCellChange(data) {
  console.log(`Cell ${data.cellId} changed to ${data.value}`)
  // Your business logic here
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000')
})
```

#### Python (Flask)
```python
from flask import Flask, request, jsonify
import hmac
import hashlib

app = Flask(__name__)

@app.route('/webhooks/spreadsheet', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Webhook-Signature')
    payload = request.get_data()

    # Verify webhook signature
    hmac_obj = hmac.new(
        app.config['WEBHOOK_SECRET'].encode(),
        payload,
        hashlib.sha256
    )
    digest = hmac_obj.hexdigest()

    if signature != f'sha256={digest}':
        return 'Invalid signature', 401

    event = request.get_json()

    # Handle different event types
    if event['type'] == 'cell.changed':
        handle_cell_change(event['data'])
    elif event['type'] == 'row.added':
        handle_row_added(event['data'])
    elif event['type'] == 'collaborator.joined':
        handle_collaborator_joined(event['data'])

    return 'OK', 200

def handle_cell_change(data):
    print(f"Cell {data['cell_id']} changed to {data['value']}")
    # Your business logic here

if __name__ == '__main__':
    app.run(port=3000)
```

### Batch Operations

#### JavaScript
```javascript
// Create a batch for efficient updates
const batch = spreadsheet.cells.createBatch()

// Queue multiple operations
for (let i = 2; i <= 100; i++) {
  batch.update(`A${i}`, `Product ${i}`)
  batch.update(`B${i}`, Math.floor(Math.random() * 1000))
  batch.update(`C${i}`, (Math.random() * 100).toFixed(2))
}

// Execute all at once (much faster than individual calls)
await batch.execute()

console.log('Updated 300 cells in a single batch operation')
```

#### Python
```python
# Create a batch for efficient updates
batch = spreadsheet.cells.create_batch()

# Queue multiple operations
for i in range(2, 101):
    batch.update(f'A{i}', f'Product {i}')
    batch.update(f'B{i}', random.randint(1, 1000))
    batch.update(f'C{i}', round(random.uniform(1, 100), 2))

# Execute all at once (much faster than individual calls)
await batch.execute()

print('Updated 300 cells in a single batch operation')
```

### Error Handling

#### JavaScript
```javascript
try {
  const spreadsheet = await client.spreadsheets.create({
    name: 'Test Spreadsheet',
    rows: 100,
    columns: 10
  })
} catch (error) {
  if (error instanceof SpreadsheetMomentAPIError) {
    switch (error.statusCode) {
      case 401:
        console.error('Authentication failed. Check your API key.')
        break
      case 429:
        console.error('Rate limit exceeded. Retry after:', error.retryAfter)
        // Implement retry logic
        break
      case 400:
        console.error('Bad request:', error.message)
        break
      default:
        console.error('Unexpected error:', error.message)
    }
  }
}
```

#### Python
```python
try:
    spreadsheet = await client.spreadsheets.create(
        name='Test Spreadsheet',
        rows=100,
        columns=10
    )
except SpreadsheetMomentAPIError as error:
    if error.status_code == 401:
        print('Authentication failed. Check your API key.')
    elif error.status_code == 429:
        print(f'Rate limit exceeded. Retry after: {error.retry_after}')
        # Implement retry logic
    elif error.status_code == 400:
        print(f'Bad request: {error.message}')
    else:
        print(f'Unexpected error: {error.message}')
```

## Integration Examples

### React Dashboard

```jsx
import React, { useState, useEffect } from 'react'
import { useSpreadsheet } from '@spreadsheetmoment/sdk/react'
import { Line } from 'react-chartjs-2'

function SalesDashboard() {
  const { spreadsheet, loading, error } = useSpreadsheet('sheet_abc123')
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    if (spreadsheet) {
      loadChartData()
    }
  }, [spreadsheet])

  async function loadChartData() {
    const range = await spreadsheet.cells.getRange('A1:B12')
    const labels = range.cells.filter(c => c.id.startsWith('A')).map(c => c.value)
    const data = range.cells.filter(c => c.id.startsWith('B')).map(c => c.value)

    setChartData({
      labels,
      datasets: [{
        label: 'Revenue',
        data,
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)'
      }]
    })
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>{spreadsheet.name}</h1>
      {chartData && <Line data={chartData} />}
    </div>
  )
}
```

### Python Data Analysis

```python
import pandas as pd
from spreadsheetmoment import SpreadsheetMomentClient

async def analyze_sales_data():
    client = SpreadsheetMomentClient(api_key='your_api_key')
    spreadsheet = client.spreadsheets.get('sheet_abc123')

    # Convert to DataFrame
    df = await spreadsheet.to_dataframe()

    # Perform analysis
    summary = df.describe()
    print(summary)

    # Calculate totals by category
    category_totals = df.groupby('Category')['Amount'].sum()
    print(category_totals)

    # Find top 10 products
    top_products = df.nlargest(10, 'Amount')
    print(top_products)

    # Create visualization
    import matplotlib.pyplot as plt
    df.plot(kind='bar', x='Product', y='Amount')
    plt.savefig('sales_analysis.png')

    # Update spreadsheet with results
    await spreadsheet.cells.update({
        'E1': 'Analysis Complete',
        'E2': f'Total Revenue: {df["Amount"].sum():.2f}'
    })
```

## More Examples

Explore more examples in our GitHub repository:

[View All Examples →](https://github.com/spreadsheetmoment/examples)

## Contribute Examples

Have you built something cool? Share it with the community!

[Submit Your Example →](/community/contribute)

## Need Help?

- **Documentation**: [Full API reference](../reference/)
- **Tutorials**: [Step-by-step guides](../tutorials/)
- **Community**: [Join our Discord](https://discord.gg/spreadsheetmoment)
- **Support**: [Contact support](https://spreadsheetmoment.com/support)
