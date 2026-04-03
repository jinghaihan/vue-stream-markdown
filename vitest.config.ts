import { resolve } from 'node:path'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import { alias } from './shared'

export default defineConfig({
  plugins: [Vue()],
  optimizeDeps: {
    exclude: ['shiki'],
  },
  resolve: {
    alias: {
      ...alias,
      shiki: resolve(__dirname, './packages/vue-stream-markdown/node_modules/shiki'),
    },
  },
  test: {
    coverage: {
      include: [
        'packages/markmend/src/preprocess/*.ts',
        'packages/markmend/src/processor.ts',
        'packages/markmend-ast/src/parser.ts',
      ],
    },
  },
})
