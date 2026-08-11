# Developer Portal Deployment Guide

Complete guide to building and deploying the Spreadsheet Moment developer portal.

## Overview

The developer portal is built with VitePress and includes:

- **Interactive API Explorer**: Vue.js component for live API testing
- **Comprehensive Documentation**: SDK guides, tutorials, examples, and reference
- **Responsive Design**: Mobile-friendly navigation and layouts
- **Search Functionality**: Built-in search with Algolia integration
- **Code Examples**: Syntax-highlighted code blocks with copy buttons

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Git repository
- Hosting platform (Vercel, Netlify, or GitHub Pages)

## Local Development

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

### Development Server

The development server runs at `http://localhost:5173` with:

- Hot module replacement
- Fast refresh for Vue components
- Instant page updates

## Project Structure

```
docs/
├── .vitepress/
│   ├── config.ts           # VitePress configuration
│   └── theme/
│       ├── index.ts        # Theme customization
│       ├── custom.css      # Custom styles
│       └── components/
│           └── ApiExplorer.vue  # Interactive API explorer
├── developer/
│   ├── index.md            # Developer portal home
│   ├── quick-start.md      # Quick start guide
│   ├── authentication.md   # Authentication & testing
│   ├── explorer/           # API Explorer
│   ├── sdk/                # SDK documentation
│   ├── tutorials/          # Tutorials
│   ├── examples/           # Code examples
│   └── reference/          # API reference
├── api/                    # Existing API docs
├── getting-started/        # Existing guides
└── index.md                # Site home
```

## Configuration

### VitePress Config

Located at `docs/.vitepress/config.ts`:

```typescript
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Spreadsheet Moment Developer Portal',
  description: 'Build powerful integrations with Spreadsheet Moment APIs',

  themeConfig: {
    nav: [
      { text: 'Developer Portal', link: '/developer/' },
      { text: 'API Explorer', link: '/developer/explorer/' },
      { text: 'SDKs', link: '/developer/sdk/' },
      { text: 'Tutorials', link: '/developer/tutorials/' }
    ],

    sidebar: {
      '/developer/': [
        // Navigation structure
      ]
    }
  }
})
```

### Custom Theme

The custom theme extends VitePress default theme with:

- **ApiExplorer Component**: Interactive API testing tool
- **Custom Styles**: Enhanced styling for code blocks and tables
- **Global Components**: Reusable Vue components

## Building for Production

### Build Command

```bash
npm run docs:build
```

This generates static files in `docs/.vitepress/dist/`.

### Build Options

Customize build behavior:

```typescript
// .vitepress/config.ts
export default defineConfig({
  vite: {
    build: {
      chunkSizeWarningLimit: 1000
    }
  }
})
```

## Deployment

### Vercel Deployment

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Deploy**

   ```bash
   vercel --prod
   ```

3. **Configuration** (vercel.json)

   ```json
   {
     "buildCommand": "npm run docs:build",
     "outputDirectory": "docs/.vitepress/dist",
     "framework": "vitepress"
   }
   ```

### Netlify Deployment

1. **Configuration** (netlify.toml)

   ```toml
   [build]
     command = "npm run docs:build"
     publish = "docs/.vitepress/dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**

   ```bash
   netlify deploy --prod
   ```

### GitHub Pages Deployment

1. **Configure Base URL**

   ```typescript
   // .vitepress/config.ts
   export default defineConfig({
     base: '/your-repo-name/'
   })
   ```

2. **Deploy Script**

   ```bash
   # package.json
   {
     "scripts": {
       "docs:deploy": "npm run docs:build && gh-pages -d docs/.vitepress/dist"
     }
   }
   ```

3. **Deploy**

   ```bash
   npm run docs:deploy
   ```

## Search Integration

### Algolia Setup

1. **Crawler Configuration**

   Create `algolia.config.json`:

   ```json
   {
     "index_name": "spreadsheet-moment",
     "start_urls": ["https://docs.spreadsheetmoment.com/"],
     "selectors": {
       "lvl0": ".VPDoc h1",
       "lvl1": ".VPDoc h2",
       "lvl2": ".VPDoc h3",
       "content": ".VPDoc p, .VPDoc li"
     }
   }
   ```

2. **Update Config**

   ```typescript
   // .vitepress/config.ts
   export default defineConfig({
     themeConfig: {
       search: {
         provider: 'algolia',
         options: {
           appId: 'YOUR_APP_ID',
           apiKey: 'YOUR_SEARCH_API_KEY',
           indexName: 'spreadsheet-moment'
         }
       }
     }
   })
   ```

## Performance Optimization

### Image Optimization

```bash
# Install sharp for image optimization
npm install sharp

# Configure image processing
```

### Code Splitting

VitePress automatically splits code for optimal loading:

- Page chunks are loaded on-demand
- Shared dependencies are cached
- Vue components are lazy-loaded

### Caching Strategy

```typescript
// .vitepress/config.ts
export default defineConfig({
   vite: {
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             'api-explorer': ['./theme/components/ApiExplorer.vue']
           }
         }
       }
     }
   }
})
```

## Analytics Integration

### Google Analytics

```html
<!-- .vitepress/theme/index.ts -->
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // Initialize Google Analytics
  window.dataLayer = window.dataLayer || []
  function gtag(){dataLayer.push(arguments)}
  gtag('js', new Date())
  gtag('config', 'GA_MEASUREMENT_ID')
})
</script>
```

### Plausible Analytics

```html
<head>
  <script defer data-domain="docs.spreadsheetmoment.com" src="https://plausible.io/js/script.js"></script>
</head>
```

## Monitoring & Logging

### Error Tracking (Sentry)

```javascript
// .vitepress/theme/index.ts
import * as Sentry from "@sentry/vue"

if (typeof window !== 'undefined') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV
  })
}
```

### Performance Monitoring

```javascript
// Track page load times
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0]
  console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart)
})
```

## Maintenance

### Content Updates

1. **Edit Markdown Files**

   Update content in `docs/developer/` directory

2. **Test Locally**

   ```bash
   npm run docs:dev
   ```

3. **Build & Deploy**

   ```bash
   npm run docs:build
   npm run docs:deploy
   ```

### Version Management

Document different API versions:

```
docs/
├── v1/
│   └── api/
└── v2/
    └── api/
```

### Broken Link Checking

```bash
# Install link checker
npm install -g markdown-link-check

# Check for broken links
markdown-link-check docs/**/*.md
```

## Best Practices

### Documentation Structure

- **Progressive Disclosure**: Start simple, add complexity gradually
- **Code Examples**: Every concept should have working examples
- **Clear Navigation**: Logical hierarchy with breadcrumbs
- **Searchable**: Descriptive headings and content

### Content Guidelines

- **Write for Developers**: Technical depth with clear explanations
- **Keep Current**: Regular updates for API changes
- **Multiple Formats**: Text, code, diagrams, and videos
- **Feedback Loops**: User feedback collection and iteration

### Performance Guidelines

- **Optimize Images**: WebP format, lazy loading
- **Minify CSS/JS**: Automatic in production builds
- **CDN Delivery**: Use CDN for static assets
- **Caching Headers**: Proper cache-control settings

## Troubleshooting

### Build Errors

```bash
# Clear cache
rm -rf node_modules/.vite
rm -rf docs/.vitepress/cache

# Rebuild
npm run docs:build
```

### Component Issues

```bash
# Check Vue component syntax
npm run lint

# Type checking
npm run type-check
```

### Deployment Issues

- Check build logs for errors
- Verify environment variables
- Test production build locally first
- Check hosting platform documentation

## Support Resources

- **VitePress Docs**: https://vitepress.dev/
- **Vue Docs**: https://vuejs.org/
- **Community**: Join our Discord
- **Issues**: Report on GitHub

## Future Enhancements

### Planned Features

- **Interactive Tutorials**: Step-by-step guided exercises
- **Video Integration**: Embedded video tutorials
- **Community Contributions**: User-generated content
- **API Version Selector**: Switch between API versions
- **Dark Mode**: Theme toggle support
- **Offline Support**: PWA functionality
- **Multi-Language**: Internationalization

### Improvements

- **Performance**: Core Web Vitals optimization
- **Accessibility**: WCAG 2.1 AA compliance
- **SEO**: Enhanced search engine optimization
- **Analytics**: User behavior tracking
- **A/B Testing**: Content optimization

## Quick Reference

### Common Commands

```bash
# Development
npm run docs:dev              # Start dev server
npm run docs:build            # Build for production
npm run docs:preview          # Preview production build

# Deployment
npm run docs:deploy           # Deploy to hosting
npm run docs:lighthouse       # Run Lighthouse audit

# Maintenance
npm run docs:lint             # Lint documentation
npm run docs:check-links      # Check for broken links
npm run docs:optimize         # Optimize images and assets
```

### File Locations

```
Config:          docs/.vitepress/config.ts
Theme:           docs/.vitepress/theme/
Components:      docs/.vitepress/theme/components/
Home Page:       docs/developer/index.md
API Explorer:    docs/developer/explorer/index.md
SDK Docs:        docs/developer/sdk/index.md
```

---

**Last Updated**: 2024-01-20
**Maintained By**: Spreadsheet Moment Developer Experience Team
