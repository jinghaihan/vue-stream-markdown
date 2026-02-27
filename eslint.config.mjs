import { defineConfig } from '@octohash/eslint-config'
import nuxt from './playground/.nuxt/eslint.config.mjs'

export default defineConfig({
  unocss: true,
  formatters: true,
  ignores: [
    '**/__fixtures__/**',
    'playground/app/markdown/**/landing-page.md',
    'playground/app/markdown/**/code-blocks.md',
  ],
  rules: {
    'pnpm/json-enforce-catalog': 'off',
    'markdown/require-alt-text': 'off',
    'markdown/fenced-code-language': 'off',
    'markdown/no-multiple-h1': 'off',
  },
}).append(nuxt())
