import { resolve } from 'node:path'
import Vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vitest/config'
import { alias } from './shared'

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
      shiki: resolve(__dirname, './packages/vue/node_modules/shiki'),
    },
  },
  test: {
    coverage: {
      include: [
        'packages/markmend/core/src/preprocess/*.ts',
        'packages/markmend/core/src/processor.ts',
        'packages/markmend/ast/src/parser.ts',
      ],
    },
  },
})
