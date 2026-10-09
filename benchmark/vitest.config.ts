import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Compare built packages on both sides, without source-module getter overhead.
    alias: {
      '@markmend/core': resolve(import.meta.dirname, '../packages/markmend/core/dist/index.mjs'),
      '@markmend/parser': resolve(import.meta.dirname, '../packages/markmend/parser/dist/index.mjs'),
      '@stream-markdown/core': resolve(import.meta.dirname, '../packages/core/dist/index.mjs'),
      '@stream-markdown/code': resolve(import.meta.dirname, '../packages/extensions/code/dist/index.mjs'),
      'vue-stream-markdown': resolve(import.meta.dirname, '../packages/vue/dist/index.js'),
    },
  },
  test: {
    testTimeout: 120_000,
  },
})
