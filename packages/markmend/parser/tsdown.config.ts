import { defineConfig } from 'tsdown'

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
        /^markdown-it-cjk-friendly(?:\/|$)/,
      ],
    },
    neverBundle: ['@markmend/core'],
    onlyBundle: false,
  },
})
