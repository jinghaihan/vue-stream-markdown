import { version } from '../package.json'

export default defineNuxtConfig({
  extends: ['comark-docs'],

  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      ],
      meta: [
        { name: 'vue-stream-markdown-version', content: version },
      ],
    },
  },

  css: [
    'katex/dist/katex.min.css',
    'vue-stream-markdown/index.css',
    'vue-stream-markdown/theme.css',
    '~/assets/css/docs.css',
  ],

  site: {
    url: 'https://docs-vue-stream-markdown.netlify.app',
    name: 'Vue Stream Markdown',
    description: 'A Vue renderer for complete and streaming Markdown.',
  },

  comarkDocs: {
    contentDir: 'docs/content',
  },

  llms: {
    domain: 'https://docs-vue-stream-markdown.netlify.app',
    full: {
      title: 'Vue Stream Markdown documentation',
      description: 'Complete Vue Stream Markdown documentation in one file.',
    },
  },
})
