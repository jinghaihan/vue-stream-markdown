import { defineConfig } from 'tsdown'
import ApiSnapshot from 'tsnapi/rolldown'

export default defineConfig({
  entry: ['./src/index.ts'],
  exports: true,
  dts: {
    generator: 'tsc',
  },
  deps: {
    onlyBundle: false,
    neverBundle: ['beautiful-mermaid'],
  },
  plugins: [ApiSnapshot()],
})
