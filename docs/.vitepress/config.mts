import type { DefaultTheme, Plugin } from 'vitepress'
import { defineConfig } from 'vitepress'
import { version } from '../../package.json'
import { alias, getPlugins } from '../../shared'

const Guides: DefaultTheme.NavItemWithLink[] = [
  { text: 'Getting Started', link: '/guide/' },
  { text: 'Usage', link: '/guide/usage' },
  { text: 'Theming', link: '/guide/theming' },
  { text: 'Performance', link: '/guide/performance' },
  { text: 'Architecture', link: '/guide/architecture' },
  { text: 'Contributing', link: '/guide/contributing' },
]

const Features: DefaultTheme.NavItemWithLink[] = [
  { text: 'Carets', link: '/feature/carets' },
  { text: 'CJK Language Support', link: '/feature/cjk-language-support' },
  { text: 'Code Blocks', link: '/feature/code-blocks' },
  { text: 'Github Flavored Markdown', link: '/feature/gfm' },
  { text: 'HTML Node Rendering', link: '/feature/html-rendering' },
  { text: 'Mathematics', link: '/feature/mathematics' },
  { text: 'Mermaid Diagrams', link: '/feature/mermaid' },
  { text: 'Security', link: '/feature/security' },
  { text: 'Unterminated Block Parsing', link: '/feature/termination' },
  { text: 'Typography', link: '/feature/typography' },
  { text: 'Static mode', link: '/feature/static' },
]

const Configs: DefaultTheme.NavItemWithLink[] = [
  { text: 'Overview', link: '/config/' },
  { text: 'Parser', link: '/config/parser' },
  { text: 'Display Options', link: '/config/display-options' },
  { text: 'Controls', link: '/config/controls' },
  { text: 'Previewers', link: '/config/previewers' },
  { text: 'Security', link: '/config/security' },
  { text: 'Custom Renderers', link: '/config/node-renderers' },
  { text: 'External Options', link: '/config/external-options' },
  { text: 'Internationalization', link: '/config/i18n' },
]

const Nav: DefaultTheme.NavItem[] = [
  {
    text: 'Guide',
    items: [
      {
        text: 'Guide',
        items: Guides,
      },
    ],
    activeMatch: '^/guide/',
  },
  {
    text: 'Features',
    items: [
      {
        text: 'Features',
        items: Features,
      },
    ],
    activeMatch: '^/feature/',
  },
  {
    text: 'Config',
    items: [
      {
        text: 'Concepts',
        items: Configs,
      },
    ],
    activeMatch: '^/config/',
  },
  {
    text: 'Playground',
    link: 'https://play-vue-stream-markdown.netlify.app/',
  },
  {
    text: `v${version}`,
    items: [
      {
        text: 'Release Notes',
        link: 'https://github.com/jinghaihan/vue-stream-markdown/releases',
      },
    ],
  },
]

const SidebarGuide: DefaultTheme.SidebarItem[] = [
  {
    text: 'Guides',
    items: Guides,
  },
  {
    text: 'Features',
    items: Features,
  },
  {
    text: 'Config',
    link: '/config/',
  },
]

const SidebarFeature: DefaultTheme.SidebarItem[] = [
  {
    text: 'Guides',
    items: Guides,
  },
  {
    text: 'Features',
    items: Features,
  },
  {
    text: 'Config',
    link: '/config/',
  },
]

const SidebarConfig: DefaultTheme.SidebarItem[] = [
  {
    text: 'Config',
    collapsed: false,
    items: Configs,
  },
]

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Vue Stream Markdown',
  description: 'Streaming markdown output, Useful for text streams like LLM outputs.',
  outDir: './dist',
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
  ],
  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    nav: Nav,
    search: {
      provider: 'local',
    },
    sidebar: {
      '/guide/': SidebarGuide,
      '/feature/': SidebarFeature,
      '/config/': SidebarConfig,
    },
    outline: {
      level: [2, 4],
    },
    editLink: {
      pattern: 'https://github.com/jinghaihan/vue-stream-markdown/edit/main/docs/:path',
      text: 'Suggest changes to this page',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/jinghaihan/vue-stream-markdown' },
    ],
  },

  markdown: {
    theme: {
      light: 'kanagawa-lotus',
      dark: 'kanagawa-dragon',
    },
  },

  vite: {
    plugins: [...getPlugins<Plugin>()],
    resolve: { alias },
  },
})
