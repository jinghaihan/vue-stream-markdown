import { defineConfig, mergeCatalogRules } from 'pncat'
import { dependencies } from './playground/nuxt/package.json'

const RUNTIME_DEPS = ['vue', '@vueuse/core', '@floating-ui/dom']

export default defineConfig({
  excludeDepFields: [
    'overrides',
    'pnpm.overrides',
    'resolutions',
  ],
  exclude: [
    'shiki',
    'mermaid',
    'beautiful-mermaid',
    'katex',
  ],
  catalogRules: mergeCatalogRules([
    {
      name: 'benchmark',
      match: [
        '@streamdown/code',
        '@types/react',
        '@types/react-dom',
        'jsdom',
        'react',
        'react-dom',
        'remark-gfm',
        'remark-parse',
        'remend',
        'streamdown',
        'unified',
      ],
      priority: -10,
    },
    {
      name: 'parser',
      match: ['comark', /marked/, /mdast-/, /micromark-/, 'parse5', 'sanitize-html'],
      priority: 0,
    },
    {
      name: 'inlined',
      match: ['@antfu/utils', /quick-lru/, /treechop/],
      priority: 0,
    },
    {
      name: 'playground',
      match: Object.keys(dependencies).filter(i => !RUNTIME_DEPS.includes(i)),
      priority: 20,
    },
    {
      name: 'frontend',
      match: [/floating-ui/],
      priority: 30,
    },
  ]),
  postRun: 'eslint --fix "**/package.json" "**/pnpm-workspace.yaml"',
})
