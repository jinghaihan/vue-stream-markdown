import antfu from '@antfu/eslint-config'

export default antfu({
  unocss: true,
  formatters: {
    html: true,
    css: true,
  },
  ignores: [
    'playground/app/markdown/**/code-blocks.md',
  ],
  rules: {
    'pnpm/yaml-enforce-settings': 'off',
  },
})
