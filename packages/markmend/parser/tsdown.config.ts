import { defineConfig } from 'tsdown'
import ApiSnapshot from 'tsnapi/rolldown'

export default defineConfig({
  entry: ['./src/index.ts'],
  exports: true,
  dts: {
    tsgo: true,
  },
  deps: {
    alwaysBundle: [
      /^comark(?:\/|$)/,
      /^markdown-it-cjk-friendly(?:\/|$)/,
    ],
    dts: {
      neverBundle: [
        '@markmend/core',
        /^comark(?:\/|$)/,
      ],
    },
    neverBundle: ['@markmend/core'],
    onlyBundle: false,
  },
  plugins: [ApiSnapshot()],
})
