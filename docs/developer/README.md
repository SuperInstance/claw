# Spreadsheet Moment Developer Portal

Comprehensive developer portal with interactive API explorer, SDK documentation, tutorials, and examples for building powerful integrations with Spreadsheet Moment.

## Features

### Interactive API Explorer
- **Live API Testing**: Test endpoints directly in your browser
- **Authentication Helper**: Secure API key management
- **Request Builder**: Build complex requests with parameters
- **Response Viewer**: View and analyze API responses
- **Code Generation**: Generate code in JavaScript, Python, Go, and cURL
- **WebSocket Testing**: Test real-time collaboration features
- **GraphQL Playground**: Interactive GraphQL query editor

### Comprehensive Documentation
- **Quick Start Guide**: Get started in 5 minutes
- **SDK Documentation**: JavaScript, Python, Go, and Java SDKs
- **API Reference**: Complete REST, GraphQL, and WebSocket docs
- **Authentication Guide**: API keys, OAuth 2.0, and JWT
- **Testing Guide**: Unit testing, integration testing, and mocking
- **Best Practices**: Security, performance, and error handling

### Interactive Tutorials
- **Hello World**: Make your first API call
- **CRUD Operations**: Create, read, update, and delete
- **Real-Time Updates**: WebSocket-based collaboration
- **Formulas**: Advanced formula calculations
- **Webhooks**: Event-driven integrations
- **Batch Operations**: Optimize performance

### Code Examples
- **Sales Dashboard**: Real-time dashboard with charts
- **Inventory Management**: Stock tracking and alerts
- **Project Planning**: Collaborative task management
- **Invoice Generator**: Automated invoice creation
- **React Integration**: Frontend integration examples
- **Python Analysis**: Data analysis with Pandas

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm
- Modern web browser

### Installation

```bash
# Clone repository
git clone https://github.com/spreadsheetmoment/docs.git
cd docs

# Install dependencies
npm install

# Start development server
npm run docs:dev
```

### Build for Production

```bash
# Build static site
npm run docs:build

# Preview production build
npm run docs:preview
```

## Project Structure

```
docs/
├── .vitepress/
│   ├── config.ts                    # VitePress configuration
│   └── theme/
│       ├── index.ts                 # Theme customization
│       ├── custom.css               # Custom styles
│       └── components/
│           └── ApiExplorer.vue      # Interactive API explorer
├── developer/
│   ├── index.md                     # Developer portal home
│   ├── quick-start.md               # Quick start guide
│   ├── authentication.md            # Authentication & testing
│   ├── DEPLOYMENT_GUIDE.md          # Deployment guide
│   ├── explorer/
│   │   └── index.md                 # API Explorer docs
│   ├── sdk/
│   │   └── index.md                 # SDK documentation
│   ├── tutorials/
│   │   └── index.md                 # Tutorials index
│   ├── examples/
│   │   └── index.md                 # Code examples
│   └── reference/
│       └── index.md                 # API reference
├── api/                             # Existing API docs
├── getting-started/                 # Existing guides
└── index.md                         # Site home page
```

## Key Components

### ApiExplorer.vue
Interactive Vue.js component that provides:
- Endpoint selection and categorization
- Request building with headers and body
- Live API execution
- Response display and formatting
- Multi-language code generation
- Authentication management

### Configuration
VitePress config includes:
- Navigation structure
- Sidebar organization
- Search integration
- Social links
- Footer configuration

### Theme Customization
Custom theme extends VitePress with:
- ApiExplorer global component
- Custom CSS styles
- Responsive design
- Dark mode support

## Deployment

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### GitHub Pages
```bash
# Deploy to GitHub Pages
npm run docs:deploy
```

## Features in Detail

### API Explorer
The API Explorer provides a complete testing environment:
- **Authentication**: Secure API key input and storage
- **Endpoint Browser**: Browse all available endpoints
- **Request Builder**: Add parameters, headers, and body
- **Live Testing**: Execute requests and see responses
- **Code Generator**: Get ready-to-use code snippets
- **WebSocket Support**: Test real-time features
- **Response Analysis**: View status, time, and data

### SDK Documentation
Comprehensive guides for:
- **JavaScript/TypeScript**: Node.js, browser, React, Vue
- **Python**: Django, Flask, FastAPI, scripts
- **Go**: Microservices and CLI tools
- **Java**: Spring Boot and enterprise apps

### Tutorial System
Structured learning paths:
- **Beginner**: Quick start and basic concepts
- **Intermediate**: Real-time and automation
- **Advanced**: Performance and optimization
- **Integration**: Framework-specific guides

### Code Examples
Production-ready examples:
- **Sample Applications**: Complete working apps
- **Integration Patterns**: Common use cases
- **Best Practices**: Security and performance
- **Language Examples**: All supported languages

## Development

### Adding New Content

1. **Create Markdown File**
   ```bash
   touch docs/developer/new-page.md
   ```

2. **Add Content**
   ```markdown
   ---
   title: New Page
   ---

   # New Page

   Content here...
   ```

3. **Update Navigation**
   ```typescript
   // .vitepress/config.ts
   sidebar: {
     '/developer/': [
       { text: 'New Page', link: '/developer/new-page' }
     ]
   }
   ```

### Customizing API Explorer

Edit `docs/.vitepress/theme/components/ApiExplorer.vue`:
- Add new endpoints
- Customize request handling
- Modify UI components
- Add new features

### Styling

Edit `docs/.vitepress/theme/custom.css`:
- Override VitePress styles
- Add custom components
- Implement responsive design
- Support dark mode

## Performance Optimization

### Build Optimization
- Code splitting for faster loading
- Tree shaking to remove unused code
- Image optimization and lazy loading
- CSS minification and purging

### Runtime Optimization
- Client-side caching
- API request batching
- Debouncing and throttling
- Efficient rendering

### Monitoring
- Google Analytics integration
- Performance tracking
- Error monitoring with Sentry
- User behavior analysis

## Best Practices

### Documentation
- **Clear Structure**: Logical organization and navigation
- **Code Examples**: Working, tested examples
- **Progressive Disclosure**: Start simple, add complexity
- **Multiple Formats**: Text, code, diagrams, videos

### Development
- **Type Safety**: TypeScript for better DX
- **Testing**: Unit and integration tests
- **Linting**: Code quality enforcement
- **Version Control**: Git workflow

### Deployment
- **CI/CD**: Automated builds and deployments
- **Environment Management**: Dev, staging, production
- **Monitoring**: Error tracking and analytics
- **Rollback**: Quick rollback capability

## Contributing

We welcome contributions! Please see our [Contributing Guide](/community/contribute) for details.

### Contribution Areas
- Documentation improvements
- Code examples
- Bug fixes
- Feature requests
- Translation

## Support

### Resources
- **Documentation**: [Full docs](https://docs.spreadsheetmoment.com)
- **API Reference**: [Complete API docs](/developer/reference/)
- **Examples**: [Code examples](/developer/examples/)
- **Tutorials**: [Step-by-step guides](/developer/tutorials/)

### Community
- **Discord**: [Join our Discord](https://discord.gg/spreadsheetmoment)
- **GitHub**: [Report issues](https://github.com/spreadsheetmoment/docs/issues)
- **Email**: [Contact support](mailto:support@spreadsheetmoment.com)

### Status
- **API Status**: [status.spreadsheetmoment.com](https://status.spreadsheetmoment.com)
- **Incident History**: [ incidents.spreadsheetmoment.com](https://incidents.spreadsheetmoment.com)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

Built with:
- [VitePress](https://vitepress.dev/) - Static site generator
- [Vue.js](https://vuejs.org/) - Interactive components
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Marked](https://marked.js.org/) - Markdown parsing

---

**Last Updated**: 2024-01-20
**Version**: 1.0.0
**Maintained By**: Spreadsheet Moment Developer Experience Team
