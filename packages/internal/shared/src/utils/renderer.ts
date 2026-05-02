import { STREAM_MARKDOWN_PREFIX } from '../constants'

export interface NodeKeySource {
  type: string
  identifier?: string | number
}

export function getNodeKey(
  node: NodeKeySource,
  index: number,
  baseKey: string = STREAM_MARKDOWN_PREFIX,
): string {
  const nodeKey = `${baseKey}-${node.type}`
  if (node.type === 'footnoteReference' || node.type === 'footnoteDefinition')
    return `${nodeKey}-${node.identifier}`
  return `${nodeKey}-${index}`
}
