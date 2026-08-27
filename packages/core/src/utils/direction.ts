import type { ParsedNode } from '@markmend/ast'
import type { TextDirection, TextDirectionConfig } from '../types'

const RTL_PATTERN = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/
const LETTER_PATTERN = /\p{L}/u
const NON_DIRECTIONAL_NODE_TYPES = new Set([
  'code',
  'inlineCode',
  'inlineMath',
  'math',
  'yaml',
])

/** Detect direction from the majority of strong Unicode letters. */
export function detectTextDirection(text: string): TextDirection {
  let firstStrong: TextDirection | undefined
  let ltrCount = 0
  let rtlCount = 0

  for (const char of text) {
    if (RTL_PATTERN.test(char)) {
      firstStrong ??= 'rtl'
      rtlCount += 1
      continue
    }

    if (LETTER_PATTERN.test(char)) {
      firstStrong ??= 'ltr'
      ltrCount += 1
    }
  }

  if (rtlCount > ltrCount)
    return 'rtl'
  if (ltrCount > rtlCount)
    return 'ltr'
  return firstStrong ?? 'ltr'
}

/** Extract visible prose from an AST node without letting code or math affect direction. */
export function getDirectionalText(node: ParsedNode | undefined): string {
  if (!node || NON_DIRECTIONAL_NODE_TYPES.has(node.type))
    return ''

  if ('children' in node && Array.isArray(node.children))
    return node.children.map(child => getDirectionalText(child as ParsedNode)).join('')

  if ('value' in node && typeof node.value === 'string')
    return node.value

  if ('alt' in node && typeof node.alt === 'string')
    return node.alt

  return ''
}

export function resolveNodeTextDirection(
  node: ParsedNode | undefined,
  direction: TextDirectionConfig | undefined,
): TextDirection | undefined {
  return resolveTextDirection(getDirectionalText(node), direction)
}

export function resolveTextDirection(
  text: string,
  direction: TextDirectionConfig | undefined,
): TextDirection | undefined {
  if (!direction)
    return undefined
  if (direction !== 'auto')
    return direction
  return detectTextDirection(text)
}
