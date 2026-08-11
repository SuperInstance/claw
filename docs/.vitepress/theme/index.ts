import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './custom.css'
import ApiExplorer from './components/ApiExplorer.vue'
import OpenApiExplorer from './components/OpenApiExplorer.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // Register global components
    app.component('ApiExplorer', ApiExplorer)
    app.component('OpenApiExplorer', OpenApiExplorer)
  }
} satisfies Theme
