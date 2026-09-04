import { defineConfig } from 'tsdown'
import ApiSnapshot from 'tsnapi/rolldown'

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
  plugins: [ApiSnapshot()],
})
