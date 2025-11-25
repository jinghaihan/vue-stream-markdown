export const markdownGlob = import.meta.glob('./*.md', { query: '?raw' })

export const DEFAULT_MARKDOWN_PATH = './landing-page.md'

/// keep-sorted
export const MARKDOWN_NAME: Record<string, string> = {
  './cjk-support.md': 'CJK Language Support',
  './code-blocks.md': 'Code Blocks',
  './gfm.md': 'GitHub Flavored Markdown',
  './landing-page.md': 'Landing Page',
  './mathematics.md': 'Mathematics',
  './mermaid.md': 'Mermaid Diagrams',
  './typography.md': 'Typography',
}

export function getPresetOptions() {
  const paths = Object.keys(markdownGlob)
  return paths.map((path) => {
    return {
      label: MARKDOWN_NAME[path] || path.split('/').pop()?.split('.').shift() || 'Unknown',
      value: path,
    }
  })
}

export async function getPresetContent(path: string): Promise<string> {
  if (!markdownGlob[path])
    return ''
  const data = await markdownGlob[path]() as { default: string }
  return data.default
}
