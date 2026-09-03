import type { HardenOptions } from '../types'
import { DEFAULT_HARDEN_OPTIONS } from '../constants'

// ported from https://github.com/vercel-labs/markdown-sanitizers/blob/main/rehype-harden/src/index.ts

function parseUrl(url: unknown, defaultOrigin: string): URL | null {
  if (typeof url !== 'string')
    return null

  try {
    return new URL(url)
  }
  catch {
    if (defaultOrigin) {
      try {
        return new URL(url, defaultOrigin)
      }
      catch {
        return null
      }
    }

    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      try {
        return new URL(url, 'http://example.com')
      }
      catch {
        return null
      }
    }

    return null
  }
}

function isPathRelativeUrl(url: unknown): boolean {
  if (typeof url !== 'string')
    return false

  return url.startsWith('/') || url.startsWith('./') || url.startsWith('../')
}

const safeProtocols = new Set([
  'https:',
  'http:',
  'irc:',
  'ircs:',
  'mailto:',
  'xmpp:',
  'blob:',
])

const blockedProtocols = new Set([
  'javascript:',
  'data:',
  'file:',
  'vbscript:',
])

const HTTP_PROTOCOL_PATTERN = /^https?:$/

function transformDataUrl(url: string, isImage: boolean, allowDataImages: boolean): string | null {
  return isImage && allowDataImages && url.startsWith('data:image/') ? url : null
}

function transformBlobUrl(url: string): string | null {
  try {
    const blobUrl = new URL(url)
    if (blobUrl.protocol !== 'blob:' || url.length <= 5)
      return null

    const afterProtocol = url.substring(5)
    return afterProtocol && afterProtocol !== 'invalid' ? url : null
  }
  catch {
    return null
  }
}

function isAllowedProtocol(protocol: string, allowedProtocols: string[]): boolean {
  return safeProtocols.has(protocol)
    || allowedProtocols.includes(protocol)
    || allowedProtocols.includes('*')
}

function isAllowedHttpPrefix(
  url: URL,
  prefix: string,
  defaultOrigin: string,
): boolean {
  const parsedPrefix = parseUrl(prefix, defaultOrigin)
  return parsedPrefix !== null
    && parsedPrefix.origin === url.origin
    && url.href.startsWith(parsedPrefix.href)
}

function normalizeHttpUrl(url: URL, inputWasRelative: boolean): string {
  return inputWasRelative ? url.pathname + url.search + url.hash : url.href
}

function transformHttpUrl(
  url: URL,
  input: unknown,
  allowedPrefixes: string[],
  defaultOrigin: string,
): string | null {
  const inputWasRelative = isPathRelativeUrl(input)
  const hasAllowedPrefix = allowedPrefixes.some(prefix => isAllowedHttpPrefix(url, prefix, defaultOrigin))
  const hasWildcard = allowedPrefixes.includes('*')

  if (!hasAllowedPrefix && !hasWildcard)
    return null

  if (hasWildcard && url.protocol !== 'https:' && url.protocol !== 'http:')
    return null

  return normalizeHttpUrl(url, inputWasRelative)
}

export function transformUrl(
  url: unknown,
  allowedPrefixes: string[],
  defaultOrigin: string,
  allowDataImages: boolean = false,
  isImage: boolean = false,
  allowedProtocols: string[] = [],
): string | null {
  if (!url)
    return null

  if (typeof url === 'string' && url.startsWith('#') && !isImage && isValidHashUrl(url))
    return url

  if (typeof url === 'string' && url.startsWith('data:')) {
    return transformDataUrl(url, isImage, allowDataImages)
  }

  if (typeof url === 'string' && url.startsWith('blob:'))
    return transformBlobUrl(url)

  const parsedUrl = parseUrl(url, defaultOrigin)
  if (!parsedUrl)
    return null

  if (blockedProtocols.has(parsedUrl.protocol))
    return null

  if (!isAllowedProtocol(parsedUrl.protocol, allowedProtocols))
    return null

  if (parsedUrl.protocol === 'mailto:' || !HTTP_PROTOCOL_PATTERN.test(parsedUrl.protocol))
    return parsedUrl.href

  return transformHttpUrl(parsedUrl, url, allowedPrefixes, defaultOrigin)
}

function isValidHashUrl(url: string): boolean {
  try {
    return new URL(url, 'http://example.com').hash === url
  }
  catch {
    return false
  }
}

export function transformHardenedUrl<TComponent = unknown>(
  url: string | undefined,
  hardenOptions?: HardenOptions<TComponent>,
  options: {
    defaults?: HardenOptions<TComponent>
    isImage?: boolean
    loading?: boolean
  } = {},
): string | null {
  if (!url || options.loading)
    return url ?? null

  const resolvedOptions = {
    ...DEFAULT_HARDEN_OPTIONS,
    ...options.defaults,
    ...hardenOptions,
  }

  return transformUrl(
    url,
    resolvedOptions[options.isImage ? 'allowedImagePrefixes' : 'allowedLinkPrefixes'] ?? ['*'],
    resolvedOptions.defaultOrigin ?? '',
    resolvedOptions.allowDataImages ?? true,
    options.isImage ?? false,
    resolvedOptions.allowedProtocols ?? ['*'],
  )
}
