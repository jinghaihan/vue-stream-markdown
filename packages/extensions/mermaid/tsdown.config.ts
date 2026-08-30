import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  exports: true,
  dts: {
    tsgo: true,
  },
  deps: {
    alwaysBundle: ['@antfu/utils'],
    onlyBundle: false,
    neverBundle: [
      'mermaid',
    ],
  },
})
