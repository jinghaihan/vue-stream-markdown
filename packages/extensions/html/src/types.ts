import type {
  HtmlAstElementNode,
  HtmlAstNode,
  HtmlAstTextNode,
} from '@stream-markdown/core'
import type sanitizeHtml from 'sanitize-html'

export type {
  HtmlAstElementNode,
  HtmlAstNode,
  HtmlAstTextNode,
}

export type HtmlAllowedAttribute = sanitizeHtml.AllowedAttribute

export type HtmlAllowedAttributes
  = | false
    | readonly HtmlAllowedAttribute[]
    | Record<string, readonly HtmlAllowedAttribute[]>

export interface HtmlPluginOptions {
  /**
   * Allowed native HTML tags. Defaults to sanitize-html's safe tag allowlist.
   * When provided, this replaces that default native tag allowlist.
   */
  allowedTags?: readonly string[]
  /**
   * Additional custom component tags to preserve while sanitizing. Component
   * names are normalized to lower case because HTML parsing is case-insensitive.
   */
  componentTags?: readonly string[]
  /**
   * Allowed attributes. When an array is provided, the same attributes are
   * applied to every allowed tag.
   */
  allowedAttributes?: HtmlAllowedAttributes
  /**
   * Advanced sanitize-html options. Top-level allowedTags and allowedAttributes
   * still take precedence when provided.
   */
  sanitizeOptions?: sanitizeHtml.IOptions
}

export interface HtmlPlugin {
  sanitize: (raw: string) => string
  parse: (html: string) => HtmlAstNode[]
  transform: (raw: string) => HtmlAstNode[]
}

export interface HtmlParseOptions {
  /**
   * Tags that should treat `<tag />` as `<tag></tag>` before HTML parsing.
   * This is useful for custom component tags because HTML parsers do not treat
   * arbitrary custom elements as void elements.
   */
  selfClosingTags?: readonly string[]
}
