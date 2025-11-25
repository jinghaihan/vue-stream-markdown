import { defineConfig, mergeCatalogRules } from 'pncat'

export default defineConfig({
  catalogRules: mergeCatalogRules([
    {
      name: 'docs',
      match: [/vitepress/],
      priority: 0,
    },
    {
      name: 'markdown',
      match: [/remend/],
    },
    {
      name: 'frontend',
      match: [/medium-zoom/],
    },
  ]),
  postRun: 'eslint --fix "**/package.json" "**/pnpm-workspace.yaml"',
})
