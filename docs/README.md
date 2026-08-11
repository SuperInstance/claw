# Spreadsheet Moment Documentation

Welcome to the Spreadsheet Moment documentation site. This site is built with [VitePress](https://vitepress.dev/).

## Quick Start

### Installation

```bash
npm install
```

### Development Server

```bash
npm run docs:dev
```

Visit `http://localhost:5173` to view the documentation.

### Build

```bash
npm run docs:build
```

The built files will be in `docs/.vitepress/dist`.

### Preview Production Build

```bash
npm run docs:preview
```

## Project Structure

```
docs/
├── .vitepress/              # VitePress configuration
│   ├── config.ts           # Site configuration
│   └── theme/              # Custom theme
│       ├── index.ts
│       └── custom.css
├── getting-started/         # Getting started guides
├── api/                     # API documentation
├── guides/                  # In-depth guides
├── plugins/                 # Plugin development
├── sdk/                     # SDK documentation
├── tutorials/               # Tutorials
├── community/               # Community resources
├── index.md                 # Homepage
└── package.json            # Dependencies
```

## Adding Content

### New Page

1. Create markdown file in appropriate directory
2. Add frontmatter (optional):

```markdown
---
title: Page Title
description: Page description
---
```

3. Add to sidebar in `.vitepress/config.ts`

### New Section

1. Create new directory under `docs/`
2. Add `index.md` file
3. Update sidebar in config

## Customization

### Styling

Edit `.vitepress/theme/custom.css` to customize styles.

### Theme

Extend the default theme in `.vitepress/theme/index.ts`.

### Configuration

Modify `.vitepress/config.ts` for site settings.

## Features

- **Search**: Algolia integration
- **Dark Mode**: Automatic theme switching
- **Responsive**: Mobile-friendly design
- **Syntax Highlighting**: Code highlighting for 100+ languages
- **Mermaid Diagrams**: Flowcharts and sequence diagrams
- **Interactive Components**: Vue.js components in markdown

## Deployment

### Vercel

1. Connect repository
2. Set build command: `npm run docs:build`
3. Set output directory: `docs/.vitepress/dist`
4. Deploy!

### Netlify

1. Connect repository
2. Set build command: `npm run docs:build`
3. Set publish directory: `docs/.vitepress/dist`
4. Deploy!

### GitHub Pages

1. Build documentation
2. Push `dist` folder to `gh-pages` branch
3. Enable GitHub Pages

## Contributing

Please read [CONTRIBUTING.md](../CONTRIBUTING.md) before contributing.

## License

MIT
