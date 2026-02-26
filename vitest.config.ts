import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [Vue()],
  test: {
    coverage: {
      include: ['src/preprocess/*.ts', 'src/markdown-parser.ts'],
    },
  },
})
