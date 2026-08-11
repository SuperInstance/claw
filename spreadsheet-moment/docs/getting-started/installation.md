# Installation

Get started with Spreadsheet Moment in minutes.

## Prerequisites

- Node.js 18+ or Python 3.8+
- A Spreadsheet Moment account ([sign up](https://spreadsheetmoment.com/signup))

## Install the SDK

### JavaScript/TypeScript

::: code-group

```bash [npm]
npm install @spreadsheetmoment/sdk
```

```bash [yarn]
yarn add @spreadsheetmoment/sdk
```

```bash [pnpm]
pnpm add @spreadsheetmoment/sdk
```

:::

### Python

::: code-group

```bash [pip]
pip install spreadsheetmoment
```

```bash [poetry]
poetry add spreadsheetmoment
```

:::

## Get Your API Key

1. Log in to [Spreadsheet Moment](https://spreadsheetmoment.com)
2. Navigate to Settings → API Keys
3. Click "Generate New Key"
4. Copy and store securely

## Configure Authentication

### JavaScript

```typescript
import { SpreadsheetMoment } from '@spreadsheetmoment/sdk'

const client = new SpreadsheetMoment({
  apiKey: process.env.SPREADSHEET_MOMENT_API_KEY
})
```

### Python

```python
from spreadsheetmoment import SpreadsheetMoment

client = SpreadsheetMoment(
    api_key=os.getenv('SPREADSHEET_MOMENT_API_KEY')
)
```

## Next Steps

- [Your First Spreadsheet](./first-spreadsheet.md)
- [Basic Formulas](./basic-formulas.md)
- [Collaboration](./collaboration.md)
