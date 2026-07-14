import { defineConfig } from '@octohash/eslint-config'
import nuxt from './playground/nuxt/.nuxt/eslint.config.mjs'

export default defineConfig({
  unocss: true,
  formatters: true,
  markdown: false,
  ignores: [
    '**/__fixtures__/**',
    'playground/nuxt/app/markdown/**/landing-page.md',
    'playground/nuxt/app/markdown/**/code-blocks.md',
  ],
  rules: {
    'pnpm/json-enforce-catalog': 'off',
    'markdown/require-alt-text': 'off',
    'markdown/no-multiple-h1': 'off',
  },
}).append(nuxt())
