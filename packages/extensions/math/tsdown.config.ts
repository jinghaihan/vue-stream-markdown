import { defineConfig } from 'tsdown'
import ApiSnapshot from 'tsnapi/rolldown'

export default defineConfig({
  entry: ['./src/index.ts'],
  exports: true,
  dts: {
    generator: 'tsgo',
    tsgo: {},
  },
  deps: {
    onlyBundle: false,
    neverBundle: ['katex'],
  },
  plugins: [ApiSnapshot()],
})
