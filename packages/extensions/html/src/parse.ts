import type { HtmlAstNode } from '@stream-markdown/core'
import type { DefaultTreeAdapterMap } from 'parse5'
import type { HtmlParseOptions } from './types'
import { parseFragment } from 'parse5'

type Parse5ChildNode = DefaultTreeAdapterMap['childNode']
type Parse5Element = DefaultTreeAdapterMap['element']
type Parse5ParentNode = DefaultTreeAdapterMap['parentNode']
type Parse5TextNode = DefaultTreeAdapterMap['textNode']

export function parseHtml(html: string, options: HtmlParseOptions = {}): HtmlAstNode[] {
  const fragment = parseFragment(normalizeSelfClosingTags(html, options.selfClosingTags))
  return normalizeChildren(fragment.childNodes)
}

export function normalizeSelfClosingTags(html: string, tags?: readonly string[]): string {
  if (!tags?.length)
    return html

  const tagPattern = Array.from(new Set(tags.map(tag => tag.toLowerCase())))
    .map(escapeRegExp)
    .join('|')
  if (!tagPattern)
    return html

  return html.replace(
    new RegExp(`<(${tagPattern})(\\s[^<>]*?)?\\s/>`, 'gi'),
    (_, tag: string, attrs = '') => `<${tag}${attrs}></${tag}>`,
  )
}

function normalizeChildren(nodes: readonly Parse5ChildNode[]): HtmlAstNode[] {
  return nodes.flatMap(node => normalizeNode(node))
}

function normalizeNode(node: Parse5ChildNode): HtmlAstNode[] {
  if (isTextNode(node)) {
    if (!node.value)
      return []
    return [{
      type: 'text',
      value: node.value,
    }]
  }

  if (!isElementNode(node))
    return []

  return [{
    type: 'element',
    tag: node.tagName,
    attrs: Object.fromEntries(node.attrs.map(attr => [attr.name, attr.value])),
    children: normalizeChildren(node.childNodes),
  }]
}

function isTextNode(node: Parse5ChildNode): node is Parse5TextNode {
  return node.nodeName === '#text'
}

function isElementNode(node: Parse5ChildNode): node is Parse5Element & Parse5ParentNode {
  return 'tagName' in node && Array.isArray((node as Parse5ParentNode).childNodes)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
