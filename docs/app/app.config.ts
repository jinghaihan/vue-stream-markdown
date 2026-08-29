export default defineAppConfig({
  seo: {
    siteName: 'Vue Stream Markdown',
  },

  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'neutral',
    },
  },

  header: {
    title: 'Vue Stream Markdown',
    nav: [
      { label: 'Guide', sections: ['guide'] },
      { label: 'Features', sections: ['feature'] },
      { label: 'Config', sections: ['config'] },
      { label: 'Playground', sections: [], to: 'https://play-vue-stream-markdown.netlify.app/' },
    ],
    links: [
      {
        'icon': 'i-simple-icons-github',
        'to': 'https://github.com/jinghaihan/vue-stream-markdown',
        'target': '_blank',
        'aria-label': 'GitHub',
      },
    ],
  },

  footer: {
    owner: 'Vue Stream Markdown',
    links: [
      {
        'icon': 'i-simple-icons-github',
        'to': 'https://github.com/jinghaihan/vue-stream-markdown',
        'target': '_blank',
        'aria-label': 'GitHub',
      },
    ],
  },

  docs: {
    llms: {
      description: 'Use Vue Stream Markdown to render incrementally changing Markdown in Vue applications, including LLM output.',
      links: [
        {
          title: 'Playground',
          description: 'Try streaming Markdown rendering in the browser.',
          href: 'https://play-vue-stream-markdown.netlify.app/',
        },
      ],
    },
    schemaOrg: {
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      softwareVersion: '1.1.0',
    },
  },
})
