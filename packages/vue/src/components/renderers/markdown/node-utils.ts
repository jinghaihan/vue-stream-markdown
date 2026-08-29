import type { ElementNode, Node } from '@markmend/parser'
import { resolveTextDirection } from '@stream-markdown/core'

const DIRECTIONAL_TAGS = new Set([
  'blockquote',
  'figcaption',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'li',
  'p',
  'td',
  'th',
])

export function findLastRenderableIndex(nodes: Node[]): number {
  for (let index = nodes.length - 1; index >= 0; index--) {
    const node = nodes[index]!
    if (typeof node === 'string' || node[0] !== null)
      return index
  }
  return -1
}

export function resolveNodeDirection(
  tag: string,
  node: Node,
  direction: 'auto' | 'ltr' | 'rtl' | undefined,
) {
  if (!DIRECTIONAL_TAGS.has(tag))
    return undefined
  return resolveTextDirection(getNodeText(node), direction)
}

export function resolveAttributes(attrs: ElementNode[1]): Record<string, unknown> {
  const resolved: Record<string, unknown> = {}
  for (const [rawName, rawValue] of Object.entries(attrs)) {
    if (rawName === '$')
      continue

    const name = rawName.startsWith(':') ? rawName.slice(1) : rawName
    resolved[name] = rawName.startsWith(':') ? resolveBoundValue(rawValue) : rawValue
  }
  return resolved
}

export function resolveDataAttribute(tag: string): string {
  if (/^h[1-6]$/.test(tag))
    return `heading-${tag.slice(1)}`
  if (tag === 'em')
    return 'emphasis'
  if (tag === 'del')
    return 'delete'
  if (tag === 'hr')
    return 'thematic-break'
  if (tag === 'a')
    return 'link'
  return tag
}

function getNodeText(node: Node): string {
  if (typeof node === 'string')
    return node

  let text = ''
  for (let index = 2; index < node.length; index++) {
    const child = node[index]
    if (typeof child === 'string')
      text += child
    else if (Array.isArray(child))
      text += getNodeText(child as Node)
  }
  return text
}

function resolveBoundValue(value: unknown): unknown {
  if (value === 'true')
    return true
  if (value === 'false')
    return false
  if (value === 'null')
    return null
  if (typeof value === 'string' && /^-?\d+(?:\.\d+)?$/.test(value))
    return Number(value)
  return value
}
