import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import LandingPage from './components/landing-page.vue'
import SiteLayout from './components/site-layout.vue'
import StreamMarkdown from './components/stream-markdown.vue'
import './theme.css'
import './markdown.css'
import '@shared/assets/theme.css'
import 'uno.css'
import 'vue-stream-markdown/style.css'

export default {
  extends: DefaultTheme,
  Layout: SiteLayout,
  enhanceApp({ app }) {
    app.component('LandingPage', LandingPage)
    app.component('StreamMarkdown', StreamMarkdown)
  },
} satisfies Theme
