import type { MarkdownDocument } from 'comark'
import { visit } from 'comark/utils'

/** Hide unresolved display nodes without deleting references from the source. */
export function hidePendingFootnoteReferences(document: MarkdownDocument): void {
  visit(document, (node) => {
    return Array.isArray(node)
      && node[0] === 'span'
      && node.length === 3
      && typeof node[2] === 'string'
      && /^\^\S+$/u.test(node[2])
      && Object.keys(node[1]).every(key => key === '$')
      && !node[1].$?.html
  }, (node) => {
    if (Array.isArray(node))
      node[1] = { ...node[1], hidden: true }
  })
}
