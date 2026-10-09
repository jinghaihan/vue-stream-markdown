import type { SelectOption } from 'vue-stream-markdown'
import { virtualCode } from './virtual-code'

export const markdownGlob = import.meta.glob('./*.md', {
  import: 'default',
  query: '?raw',
})

export const DEFAULT_MARKDOWN_PATH = './landing-page.md'
export const VIRTUAL_CODE_PATH = './virtual-code'

/** / keep-sorted */
export const MARKDOWN_NAME: Record<string, string> = {
  'CJK Language Support': './cjk-support.md',
  'Code Blocks': './code-blocks.md',
  'Custom Rendering': './custom-rendering.md',
  'Footnote': './footnote.md',
  'GitHub Flavored Markdown': './gfm.md',
  'Landing Page': './landing-page.md',
  'Mathematics': './mathematics.md',
  'Mermaid Diagrams': './mermaid.md',
  'Typography': './typography.md',
  'Virtual Code Scrolling': VIRTUAL_CODE_PATH,
}

export function getPresetOptions(): SelectOption[] {
  return Object.keys(MARKDOWN_NAME).map((name) => {
    const path = MARKDOWN_NAME[name]!
    return {
      label: name || 'Unknown',
      value: path,
    }
  })
}

export async function getPresetContent(path: string): Promise<string> {
  if (path === VIRTUAL_CODE_PATH)
    return virtualCode
  if (!markdownGlob[path])
    return ''
  return markdownGlob[path]()
}
