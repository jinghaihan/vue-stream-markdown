import type { ComarkPlugin, Node } from 'comark'

interface LiteralTagContentProcessor {
  flatten: (nodes: Node[]) => void
  plugin: ComarkPlugin
}

const LITERAL_MARKDOWN_CHARACTER_PATTERN = /([`*_~[\]|])/g
const LITERAL_PARAGRAPH_BREAK_PATTERN = /\n\n/g
const REGEXP_CHARACTER_PATTERN = /[.*+?^${}()|[\]\\]/g

export function createLiteralTagContentProcessor(
  tags: string[] | undefined,
): LiteralTagContentProcessor | undefined {
  const tagNames = [...new Set(tags
    ?.map(tag => tag.trim().toLowerCase())
    .filter(Boolean))]

  if (!tagNames.length)
    return undefined

  const tagSet = new Set(tagNames)
  const patterns = tagNames.map((tag) => {
    const escapedTag = tag.replace(REGEXP_CHARACTER_PATTERN, '\\$&')
    return new RegExp(
      `(<${escapedTag}(?=[\\s>/])[^>]*>)([\\s\\S]*?)(</${escapedTag}\\s*>)`,
      'gi',
    )
  })

  return {
    flatten: nodes => flattenLiteralTagContent(nodes, tagSet),
    plugin: {
      name: 'literal-tag-content',
      pre(state) {
        let markdown = state.markdown
        for (const pattern of patterns) {
          markdown = markdown.replace(pattern, (_match, open: string, content: string, close: string) => {
            const escapedContent = content
              .replace(LITERAL_MARKDOWN_CHARACTER_PATTERN, '\\$1')
              .replace(LITERAL_PARAGRAPH_BREAK_PATTERN, '&#10;&#10;')
            return `${open}${escapedContent}${close}`
          })
        }
        state.markdown = markdown
      },
    },
  }
}

function flattenLiteralTagContent(nodes: Node[], tags: Set<string>): void {
  for (const node of nodes) {
    if (typeof node === 'string' || node[0] === null)
      continue

    const [tag] = node
    if (tags.has(tag.toLowerCase())) {
      const text = collectText(node)
      node.splice(2, node.length - 2, ...(text ? [text] : []))
      continue
    }

    flattenLiteralTagContent(node.slice(2) as Node[], tags)
  }
}

function collectText(node: Node): string {
  if (typeof node === 'string')
    return node
  if (node[0] === null)
    return ''

  let text = ''
  for (let index = 2; index < node.length; index++)
    text += collectText(node[index] as Node)
  return text
}
