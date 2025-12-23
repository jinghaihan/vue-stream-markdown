import { defineConfig, mergeCatalogRules } from 'pncat'

export default defineConfig({
  catalogRules: mergeCatalogRules([
    {
      name: 'docs',
      match: [/vitepress/],
      priority: 0,
    },
    {
      name: 'inline',
      match: ['@antfu/utils', /quick-lru/, /treechop/],
      priority: 0,
    },
  ]),
  postRun: 'eslint --fix "**/package.json" "**/pnpm-workspace.yaml"',
})
