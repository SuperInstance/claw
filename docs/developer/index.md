---
layout: home

hero:
  name: "Developer Portal"
  text: "Build powerful integrations with Spreadsheet Moment"
  tagline: "Real-time collaborative spreadsheets with modern APIs, SDKs, and comprehensive documentation"
  image:
    src: /logo.png
    alt: Spreadsheet Moment Developer Portal
  actions:
    - theme: brand
      text: Quick Start
      link: /developer/quick-start
    - theme: alt
      text: API Explorer
      link: /developer/explorer/
    - theme: alt
      text: SDK Documentation
      link: /developer/sdk/

features:
  - icon: ⚡
    title: Real-Time Collaboration
    details: Build apps that sync instantly across all clients with WebSocket support and CRDT-based conflict resolution.
  - icon: 🔌
    title: RESTful & GraphQL APIs
    details: Comprehensive APIs for spreadsheets, cells, formulas, and user management with full TypeScript support.
  - icon: 📦
    title: Multi-Language SDKs
    details: Official SDKs for JavaScript/TypeScript, Python, Go, and Java with comprehensive examples and documentation.
  - icon: 🔒
    title: Enterprise Security
    details: OAuth 2.0, API keys, webhooks signature verification, and end-to-end encryption support.
  - icon: 🎯
    title: Interactive API Explorer
    details: Test APIs directly from your browser with authentication, request building, and code generation.
  - icon: 📚
    title: Comprehensive Documentation
    details: From quick start guides to advanced patterns, everything you need to build production integrations.

---

## Welcome to Spreadsheet Moment Developer Portal

Spreadsheet Moment provides powerful APIs and SDKs for building real-time collaborative spreadsheet applications. Whether you're creating simple integrations or complex workflow automation, our developer tools have you covered.

### What You Can Build

- **Real-Time Dashboards**: Live-updating dashboards connected to spreadsheet data
- **Workflow Automation**: Automate business processes with webhooks and triggers
- **Data Analysis Tools**: Process and analyze spreadsheet data with Python/R
- **Custom Integrations**: Connect spreadsheets to your existing tools and services
- **Collaborative Apps**: Build multi-user applications with real-time sync
- **Enterprise Solutions**: Secure, scalable integrations for enterprise workflows

### Developer Resources

<div class="grid-container">

**🚀 Getting Started**
New to Spreadsheet Moment? Start with our quick start guide to make your first API call in under 5 minutes.

[Get Started →](/developer/quick-start)

**🔌 API Reference**
Complete API documentation for REST, GraphQL, and WebSocket endpoints with examples.

[Explore APIs →](/api/overview)

**📦 SDKs & Libraries**
Official SDKs for JavaScript, Python, Go, and Java with community libraries for more languages.

[View SDKs →](/developer/sdk/)

**🧪 API Explorer**
Interactive testing environment for all API endpoints with authentication and code generation.

[Try Explorer →](/developer/explorer/)

**📚 Tutorials**
Step-by-step guides for common integration patterns and best practices.

[Start Learning →](/developer/tutorials/)

**💡 Examples**
Sample applications and code snippets to jumpstart your development.

[See Examples →](/developer/examples/)

</div>

### Key Features

#### Real-Time Updates
```javascript
// Subscribe to real-time changes
const spreadsheet = await sdk.spreadsheets.get('sheet_123');

spreadsheet.on('cellChanged', (event) => {
  console.log(`Cell ${event.cellId} changed to ${event.value}`);
});
```

#### Powerful Formulas
```python
# Execute formulas with Python SDK
result = sdk.spreadsheets.cells.calculate(
    spreadsheet_id='sheet_123',
    formula='=SUM(A1:A10)'
)
```

#### Webhook Integrations
```go
// Handle webhook events in Go
func handleWebhook(w http.ResponseWriter, r *http.Request) {
    event := spreadsheetmoment.ParseWebhook(r)
    processEvent(event)
}
```

### Platform Capabilities

| Feature | Description |
|---------|-------------|
| **Real-Time Sync** | Sub-100ms sync latency with CRDT conflict resolution |
| **Formula Engine** | 300+ built-in functions with custom formula support |
| **Data Validation** | Cell-level validation rules and constraints |
| **Conditional Formatting** | Dynamic formatting based on cell values |
| **Charts & Visualizations** | Embedded charts with real-time updates |
| **Import/Export** | Excel, CSV, Google Sheets integration |
| **Version History** | Complete audit trail with rollback capabilities |
| **Access Control** | Fine-grained permissions at spreadsheet/cell level |
| **Webhooks** | Event-driven notifications for all changes |
| **Automation** | Custom triggers and workflow automation |

### Developer Support

- **Documentation**: Comprehensive guides and API reference
- **Examples**: Sample code and starter templates
- **Community**: Join our Discord for community support
- **Support**: Enterprise support available for paid plans
- **Status**: Real-time API status and uptime monitoring

### Ready to Build?

[Start Building →](/developer/quick-start)

<style>
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.grid-container > div {
  padding: 1.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.grid-container > div:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
