import { resolve } from 'node:path'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [Vue()],
  resolve: {
    alias: {
      '@markmend': resolve(__dirname, './packages/markmend/src'),
    },
  },
  test: {
    coverage: {
      include: [
        'packages/markmend/src/preprocess/*.ts',
        'packages/markmend/src/parser.ts',
      ],
    },
  },
})
