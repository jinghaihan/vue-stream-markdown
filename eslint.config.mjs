import antfu from '@antfu/eslint-config'

export default antfu({
  pnpm: false,
  unocss: true,
  formatters: {
    html: true,
    css: true,
  },
  ignores: [
    'playground/src/markdown/**/code-blocks.md',
  ],
})
