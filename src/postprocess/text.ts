import type { SyntaxTree } from '../types'
import { findLastLeafNode } from '../utils'

export function postFixText(data: SyntaxTree): SyntaxTree {
  const node = findLastLeafNode(data.children)
  if (!node || node.type !== 'text')
    return data

  // trim trailing $ and $$ to fix preprocess math breaking
  const lastIndex = node.value.lastIndexOf('$')
  if (lastIndex === -1)
    return data
  if (node.value[lastIndex - 1] === '$')
    node.value = node.value.slice(0, lastIndex - 1)
  else
    node.value = node.value.slice(0, lastIndex)

  return data
}
