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
    dts: {
      neverBundle: [
        '@markmend/core',
        /^comark(?:\/|$)/,
      ],
    },
    neverBundle: ['@markmend/core'],
    onlyBundle: false,
  },
  plugins: process.env.CI ? [] : [ApiSnapshot()],
})
