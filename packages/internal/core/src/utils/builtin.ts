import type { PlainTextNodeTypes } from '../types'
import { PLAIN_TEXT_NODES } from '../constants'

export function isPlainTextNodeType(type: string): type is PlainTextNodeTypes {
  return (PLAIN_TEXT_NODES as readonly string[]).includes(type)
}
