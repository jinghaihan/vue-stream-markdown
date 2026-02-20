import { defineConfig, mergeCatalogRules } from 'pncat'

export default defineConfig({
  exclude: [
    'shiki',
    'mermaid',
    'beautiful-mermaid',
    'katex',
  ],
  catalogRules: mergeCatalogRules([
    {
      name: 'parser',
      match: [/marked/, /mdast/, /micromark/],
      priority: 0,
    },
    {
      name: 'inlined',
      match: ['@antfu/utils', /quick-lru/, /treechop/],
      priority: 0,
    },
    {
      name: 'frontend',
      match: [/floating-ui/],
    },
  ]),
  postRun: 'eslint --fix "**/package.json" "**/pnpm-workspace.yaml"',
})
