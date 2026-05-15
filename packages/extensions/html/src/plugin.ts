import type { HtmlAstNode } from '@stream-markdown/core'
import type { HtmlPlugin, HtmlPluginOptions } from './types'
import { parseHtml } from './parse'
import { resolveComponentTags, sanitizeHtml } from './sanitize'

export function transformHtml(raw: string, options: HtmlPluginOptions = {}): HtmlAstNode[] {
  return parseHtml(sanitizeHtml(raw, options), {
    selfClosingTags: resolveComponentTags(options),
  })
}

export function createHtmlPlugin(options: HtmlPluginOptions = {}): HtmlPlugin {
  const selfClosingTags = resolveComponentTags(options)

  return {
    sanitize: raw => sanitizeHtml(raw, options),
    parse: html => parseHtml(html, { selfClosingTags }),
    transform: raw => transformHtml(raw, options),
  }
}
