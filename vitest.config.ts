import { resolve } from 'node:path'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [Vue()],
  resolve: {
    alias: {
      'markmend-ast': resolve(__dirname, './packages/markmend-ast/src/index.ts'),
      'markmend': resolve(__dirname, './packages/markmend/src/index.ts'),
      '@markmend': resolve(__dirname, './packages/markmend/src'),
      '@vue-stream-markdown': resolve(__dirname, './packages/vue-stream-markdown/src'),
      'shiki': resolve(__dirname, './packages/vue-stream-markdown/node_modules/shiki'),
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
