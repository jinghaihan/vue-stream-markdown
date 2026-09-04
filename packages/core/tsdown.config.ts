import { defineConfig } from 'tsdown'
import ApiSnapshot from 'tsnapi/rolldown'

export default defineConfig({
  entry: ['./src/index.ts'],
  exports: true,
  dts: {
    tsgo: {},
  },
  deps: {
    onlyBundle: false,
  },
  plugins: [ApiSnapshot()],
})
