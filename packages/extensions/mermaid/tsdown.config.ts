import process from 'node:process'
import { defineConfig } from 'tsdown'
import ApiSnapshot from 'tsnapi/rolldown'

export default defineConfig({
  entry: ['./src/index.ts'],
  exports: true,
  dts: {
    tsgo: {},
  },
  deps: {
    alwaysBundle: ['@antfu/utils'],
    onlyBundle: false,
    neverBundle: [
      'mermaid',
    ],
  },
  plugins: process.env.CI ? [] : [ApiSnapshot()],
})
