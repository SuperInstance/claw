---
layout: home

hero:
  name: Spreadsheet Moment
  text: Real-time collaborative spreadsheets
  tagline: Modern features, infinite possibilities
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started/installation
    - theme: alt
      text: View on GitHub
      link: https://github.com/spreadsheetmoment/spreadsheet-moment

features:
  - title: Real-time Collaboration
    details: Multiple users can edit simultaneously with conflict-free resolution
  - title: Powerful Formulas
    details: 500+ built-in functions with custom formula support
  - title: API & Plugins
    details: Extend functionality with our comprehensive API and plugin system
  - title: Self-hosted
    details: Deploy on your own infrastructure with Docker or Kubernetes
  - title: Modern UI
    details: Beautiful, responsive interface with dark mode support
  - title: Type-safe
    details: Built with TypeScript for reliable development experience
---

## Quick Start

Install the SDK:

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

Create your first spreadsheet:

```typescript
import { Spreadsheet } from '@spreadsheetmoment/sdk'

const spreadsheet = await Spreadsheet.create({
  name: 'My First Spreadsheet'
})

await spreadsheet.setCell('A1', 'Hello, World!')
console.log(spreadsheet.id)
```

## Why Spreadsheet Moment?

Spreadsheet Moment combines the familiarity of spreadsheets with modern web technologies:

- **Real-time sync**: CRDT-based collaboration with no conflicts
- **Scalable**: Handle millions of cells with efficient data structures
- **Extensible**: Build custom functions and data sources
- **Developer-friendly**: Comprehensive APIs for JavaScript, Python, and REST

## Community

Join our community to contribute, ask questions, and share your projects:

- GitHub: [SpreadsheetMoment](https://github.com/spreadsheetmoment/spreadsheet-moment)
- Discord: [Join our server](https://discord.gg/spreadsheetmoment)
- Twitter: [@spreadsheetmoment](https://twitter.com/spreadsheetmoment)

## License

MIT License - see [LICENSE](https://github.com/spreadsheetmoment/spreadsheet-moment/blob/main/LICENSE) for details.
