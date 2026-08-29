import { resolve } from 'node:path'
import Vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vitest/config'
import { alias } from './shared.ts'

export default defineConfig({
  plugins: [
    Vue(),
    Icons({ compiler: 'vue3' }),
  ],
  optimizeDeps: {
    exclude: ['shiki'],
  },
  resolve: {
    alias: {
      ...alias,
      shiki: resolve(import.meta.dirname, './packages/extensions/code/node_modules/shiki'),
    },
  },
  test: {
    coverage: {
      include: [
        'packages/markmend/core/src/completion/*.ts',
        'packages/markmend/parser/src/*.ts',
      ],
    },
  },
})
