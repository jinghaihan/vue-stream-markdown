import { description } from '../package.json'
import { alias } from '../shared'

export default defineNuxtConfig({
  modules: [
    'unplugin-icons/nuxt',
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/eslint',
  ],
  app: {
    head: {
      viewport: 'width=device-width,initial-scale=1',
      title: 'Vue Stream Markdown',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: description },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
    },
  },
  css: [
    '../src/style.css',
    './app/assets/reset.css',
    './app/assets/main.css',
    './app/assets/theme.css',
    // './app/assets/theme-hsl.css',
    // './app/assets/theme-tailwind-v3.css',
  ],
  alias,
  future: { compatibilityVersion: 4 },
  compatibilityDate: 'latest',
  typescript: {
    tsConfig: {
      compilerOptions: {
        paths: {
          'vue-stream-markdown': ['../src/'],
        },
      },
      include: [
        '../../shims.d.ts',
      ],
    },
  },
  eslint: {
    config: {
      standalone: false,
      nuxt: {
        sortConfigKeys: true,
      },
    },
  },
})
