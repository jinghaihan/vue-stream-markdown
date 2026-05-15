import type { HtmlPluginOptions } from './types'
import sanitizeHtmlLib from 'sanitize-html'
import { normalizeSelfClosingTags } from './parse'

const DEFAULT_SANITIZE_OPTIONS = {
  allowedAttributes: {},
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesAppliedToAttributes: ['href', 'src', 'cite', 'action'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  enforceHtmlBoundary: false,
  parseStyleAttributes: false,
} satisfies sanitizeHtmlLib.IOptions

export function sanitizeHtml(raw: string, options: HtmlPluginOptions = {}): string {
  const allowedTags = resolveAllowedTags(options)

  return sanitizeHtmlLib(normalizeSelfClosingTags(raw, resolveComponentTags(options)), {
    ...DEFAULT_SANITIZE_OPTIONS,
    ...options.sanitizeOptions,
    allowedTags,
    allowedAttributes: resolveAllowedAttributes(
      allowedTags,
      options.allowedAttributes ?? options.sanitizeOptions?.allowedAttributes,
    ),
  })
}

export function resolveAllowedTags(options: HtmlPluginOptions = {}): string[] {
  const allowedTags = options.allowedTags
    ?? options.sanitizeOptions?.allowedTags
    ?? sanitizeHtmlLib.defaults.allowedTags
  return normalizeAllowedTags([
    ...resolveTagList(allowedTags),
    ...resolveComponentTags(options),
  ])
}

export function resolveComponentTags(options: HtmlPluginOptions = {}): string[] {
  return normalizeAllowedTags(options.componentTags)
}

function resolveTagList(tags: readonly string[] | false | undefined): readonly string[] {
  if (!tags)
    return []
  return tags
}

function normalizeAllowedTags(tags: readonly string[] | undefined): string[] {
  if (!tags)
    return []
  return Array.from(new Set(tags.map(tag => tag.toLowerCase())))
}

function resolveAllowedAttributes(
  allowedTags: readonly string[],
  allowedAttributes: HtmlPluginOptions['allowedAttributes'] | sanitizeHtmlLib.IOptions['allowedAttributes'],
): sanitizeHtmlLib.IOptions['allowedAttributes'] {
  if (allowedAttributes === false)
    return false

  if (!allowedAttributes)
    return normalizeAllowedAttributes(sanitizeHtmlLib.defaults.allowedAttributes)

  if (isAllowedAttributeArray(allowedAttributes)) {
    return Object.fromEntries(
      allowedTags.map(tag => [tag, [...allowedAttributes]]),
    )
  }

  return {
    ...normalizeAllowedAttributes(sanitizeHtmlLib.defaults.allowedAttributes),
    ...normalizeAllowedAttributes(allowedAttributes),
  }
}

function isAllowedAttributeArray(
  value: HtmlPluginOptions['allowedAttributes'] | sanitizeHtmlLib.IOptions['allowedAttributes'],
): value is readonly sanitizeHtmlLib.AllowedAttribute[] {
  return Array.isArray(value)
}

function normalizeAllowedAttributes(
  allowedAttributes: Record<string, readonly sanitizeHtmlLib.AllowedAttribute[]>,
): Record<string, sanitizeHtmlLib.AllowedAttribute[]> {
  return Object.fromEntries(
    Object.entries(allowedAttributes).map(([tag, attrs]) => [
      tag.toLowerCase(),
      [...attrs],
    ]),
  )
}
