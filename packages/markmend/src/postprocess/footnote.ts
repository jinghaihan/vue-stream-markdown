import type { SyntaxTree } from '../types'
import { treeFilter, treeFlatFilter } from 'treechop'

export function postFixFootnote(data: SyntaxTree): SyntaxTree {
  const footnoteDefinitions = treeFlatFilter(data.children, node => node.type === 'footnoteDefinition')
  const filtered = treeFilter(data.children, node => node.type !== 'footnoteDefinition')
  return {
    ...data,
    children: [
      ...filtered,
      ...footnoteDefinitions,
    ],
  }
}
