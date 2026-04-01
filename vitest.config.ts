import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [Vue()],
  test: {
    coverage: {
      include: [
        'packages/markmend/src/preprocess/*.ts',
        'packages/markmend/src/parser.ts',
      ],
    },
  },
})
