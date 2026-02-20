import { defineConfig } from '@octohash/eslint-config'
import nuxt from './playground/.nuxt/eslint.config.mjs'

export default defineConfig({
  unocss: true,
  formatters: true,
  ignores: [
    '**/__fixtures__/**',
    'playground/app/markdown/**/code-blocks.md',
  ],
  rules: {
    'pnpm/json-enforce-catalog': 'off',
  },
}).append(nuxt())
