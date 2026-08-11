import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Spreadsheet Moment',
  description: 'Real-time collaborative spreadsheets with modern features',
  lang: 'en-US',
  base: '/',
  ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c8772' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js' }]
  ],

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started/installation' },
      { text: 'Developer Portal', link: '/developer/' },
      { text: 'API Reference', link: '/api/overview' },
      { text: 'API Explorer', link: '/developer/explorer/' },
      { text: 'Guides', link: '/guides/formulas/introduction' },
      { text: 'Tutorials', link: '/tutorials/build-a-plugin' },
      { text: 'Community', link: '/community/contribute' }
    ],

    sidebar: {
      '/getting-started/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Installation', link: '/getting-started/installation' },
            { text: 'Your First Spreadsheet', link: '/getting-started/first-spreadsheet' },
            { text: 'Basic Formulas', link: '/getting-started/basic-formulas' },
            { text: 'Collaboration', link: '/getting-started/collaboration' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/overview' },
            { text: 'Authentication', link: '/api/authentication' },
            { text: 'Spreadsheets', link: '/api/spreadsheets' },
            { text: 'Cells', link: '/api/cells' },
            { text: 'Webhooks', link: '/api/webhooks' },
            { text: 'API Playground', link: '/api/explorer/playground' }
          ]
        }
      ],
      '/guides/': [
        {
          text: 'Guides',
          items: [
            { text: 'Formulas', link: '/guides/formulas/introduction' },
            { text: 'Collaboration', link: '/guides/collaboration/real-time-editing' },
            { text: 'Automation', link: '/guides/automation/plugins' },
            { text: 'Deployment', link: '/guides/deployment/self-hosted' }
          ]
        }
      ],
      '/tutorials/': [
        {
          text: 'Tutorials',
          items: [
            { text: 'Build a Plugin', link: '/tutorials/build-a-plugin' },
            { text: 'Integrate API', link: '/tutorials/integrate-api' },
            { text: 'Create Dashboard', link: '/tutorials/create-dashboard' }
          ]
        }
      ],
      '/community/': [
        {
          text: 'Community',
          items: [
            { text: 'Contribute', link: '/community/contribute' },
            { text: 'Guidelines', link: '/community/guidelines' },
            { text: 'Examples', link: '/community/examples' }
          ]
        }
      ],
      '/developer/': [
        {
          text: 'Developer Portal',
          items: [
            { text: 'Welcome', link: '/developer/' },
            { text: 'Quick Start', link: '/developer/quick-start' },
            { text: 'OpenAPI Explorer', link: '/developer/explorer/openapi' },
            { text: 'Sandbox Environment', link: '/developer/sandbox-environment' },
            { text: 'SuperInstance Integration', link: '/developer/examples/superinstance-integration' },
            { text: 'API Reference', link: '/developer/reference/api-reference' },
            { text: 'SDKs', link: '/developer/sdk/' },
            { text: 'Tutorials', link: '/developer/tutorials/' },
            { text: 'Examples', link: '/developer/examples/' }
          ]
        }
      ],
      '/': [
        { text: 'Introduction', items: [
          { text: 'What is Spreadsheet Moment?', link: '/' },
          { text: 'Quick Start', link: '/getting-started/installation' }
        ]}
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/spreadsheetmoment/spreadsheet-moment' }
    ],

    footer: {
      message: 'MIT License',
      copyright: '© 2024 Spreadsheet Moment'
    },

    search: {
      provider: 'algolia',
      options: {
        appId: 'YOUR_APP_ID',
        apiKey: 'YOUR_API_KEY',
        indexName: 'spreadsheet-moment'
      }
    }
  },

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    }
  }
})
