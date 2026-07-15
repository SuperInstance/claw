# Build a Plugin

Learn to create custom plugins for Spreadsheet Moment.

## What is a Plugin?

Plugins extend Spreadsheet Moment with:
- Custom functions
- Data sources
- UI components
- Automation workflows

## Prerequisites

- Node.js 18+
- TypeScript knowledge
- Spreadsheet Moment account

## Quick Start

### 1. Initialize Plugin

```bash
npx @spreadsheetmoment/plugin init my-plugin
cd my-plugin
npm install
```

### 2. Plugin Structure

```
my-plugin/
├── manifest.json
├── src/
│   ├── index.ts
│   ├── functions/
│   │   └── custom-sum.ts
│   └── ui/
│       └── MyComponent.tsx
├── package.json
└── tsconfig.json
```

### 3. manifest.json

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My first plugin",
  "author": "Your Name",
  "permissions": ["read:cells", "write:cells"],
  "functions": ["CUSTOM_SUM"],
  "entry": "dist/index.js"
}
```

## Custom Functions

### Create a Function

```typescript
// src/functions/custom-sum.ts
import { defineFunction } from '@spreadsheetmoment/plugin'

export default defineFunction({
  name: 'CUSTOM_SUM',
  description: 'Sum only positive numbers',
  parameters: [
    {
      name: 'range',
      type: 'range',
      required: true,
      description: 'Range of cells to sum'
    }
  ],
  execute: async (context, args) => {
    const { range } = args
    const cells = await context.getRange(range)
    
    return cells.values
      .flat()
      .filter(v => typeof v === 'number' && v > 0)
      .reduce((sum, val) => sum + val, 0)
  }
})
```

### Register Function

```typescript
// src/index.ts
import customSum from './functions/custom-sum'

export default {
  functions: {
    CUSTOM_SUM: customSum
  }
}
```

### Use Function

```excel
=CUSTOM_SUM(A1:A10)
```

## Data Sources

### Create Data Source

```typescript
// src/data-sources/weather.ts
import { defineDataSource } from '@spreadsheetmoment/plugin'

export default defineDataSource({
  name: 'weather',
  description: 'Get weather data',
  parameters: [
    {
      name: 'city',
      type: 'string',
      required: true
    }
  ],
  fetch: async (context, args) => {
    const response = await fetch(
      `https://api.weather.com/${args.city}`
    )
    const data = await response.json()
    
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      condition: data.weather[0].main
    }
  }
})
```

### Use Data Source

```excel
=weather.temperature("New York")
=weather.humidity("London")
```

## UI Extensions

### Create Component

```typescript
// src/ui/WeatherWidget.tsx
import React from 'react'

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = React.useState(null)
  
  React.useEffect(() => {
    // Fetch weather data
  }, [])
  
  return (
    <div className="weather-widget">
      <h3>Weather</h3>
      {weather && (
        <div>
          <p>Temperature: {weather.temperature}°C</p>
          <p>Humidity: {weather.humidity}%</p>
        </div>
      )}
    </div>
  )
}
```

### Register Component

```typescript
// src/index.ts
import { WeatherWidget } from './ui/WeatherWidget'

export default {
  components: {
    'weather-widget': WeatherWidget
  }
}
```

## Development

### Run in Dev Mode

```bash
npm run dev
```

### Test Locally

```bash
npm run test
```

## Build

```bash
npm run build
```

## Publish

### 1. Build Plugin

```bash
npm run build
```

### 2. Upload to Spreadsheet Moment

```bash
npx @spreadsheetmoment/plugin publish
```

### 3. Share Plugin

Share your plugin with the community or keep it private.

## Example Plugins

### Currency Converter

```typescript
export default defineFunction({
  name: 'CONVERT_CURRENCY',
  parameters: [
    { name: 'amount', type: 'number' },
    { name: 'from', type: 'string' },
    { name: 'to', type: 'string' }
  ],
  execute: async (context, { amount, from, to }) => {
    const response = await fetch(
      `https://api.exchangerate.host/latest?base=${from}&symbols=${to}`
    )
    const data = await response.json()
    return amount * data.rates[to]
  }
})
```

### Data Validation

```typescript
export default defineFunction({
  name: 'VALIDATE_EMAIL',
  parameters: [
    { name: 'email', type: 'string' }
  ],
  execute: async (context, { email }) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }
})
```

## Best Practices

### 1. Error Handling

```typescript
execute: async (context, args) => {
  try {
    // Your code
  } catch (error) {
    throw new Error(`Failed: ${error.message}`)
  }
}
```

### 2. Caching

```typescript
const cache = new Map()

execute: async (context, args) => {
  const cacheKey = JSON.stringify(args)
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }
  
  const result = await expensiveOperation(args)
  cache.set(cacheKey, result)
  return result
}
```

### 3. Type Safety

```typescript
interface WeatherData {
  temperature: number
  humidity: number
  condition: string
}

execute: async (context, args): Promise<WeatherData> => {
  // Your code
}
```

## Next Steps

- [Plugin API Reference](../plugins/api-reference.md)
- [More Examples](../plugins/examples/)
- [Publishing](../plugins/publishing.md)
