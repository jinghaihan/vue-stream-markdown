import DefaultTheme from 'vitepress/theme'
import SiteLayout from './components/site-layout.vue'
import StreamMarkdown from './components/stream-markdown.vue'
import './custom.css'
import './markdown.css'
import '@shared/assets/theme.css'
import 'uno.css'

export default {
  extends: DefaultTheme,
  Layout: SiteLayout,
  enhanceApp({ app }) {
    app.component('StreamMarkdown', StreamMarkdown)
  },
}
