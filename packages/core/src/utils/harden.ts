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

  if (typeof url === 'string' && url.startsWith('#') && !isImage) {
    try {
      const testUrl = new URL(url, 'http://example.com')
      if (testUrl.hash === url)
        return url
    }
    catch {
      // noop
    }
  }

  if (typeof url === 'string' && url.startsWith('data:')) {
    if (isImage && allowDataImages && url.startsWith('data:image/'))
      return url

    return null
  }

  if (typeof url === 'string' && url.startsWith('blob:')) {
    try {
      const blobUrl = new URL(url)
      if (blobUrl.protocol === 'blob:' && url.length > 5) {
        const afterProtocol = url.substring(5)
        if (afterProtocol && afterProtocol.length > 0 && afterProtocol !== 'invalid')
          return url
      }
    }
    catch {
      return null
    }

    return null
  }

  const parsedUrl = parseUrl(url, defaultOrigin)
  if (!parsedUrl)
    return null

  if (blockedProtocols.has(parsedUrl.protocol))
    return null

  const isProtocolAllowed
    = safeProtocols.has(parsedUrl.protocol)
      || allowedProtocols.includes(parsedUrl.protocol)
      || allowedProtocols.includes('*')

  if (!isProtocolAllowed)
    return null

  if (parsedUrl.protocol === 'mailto:' || !HTTP_PROTOCOL_PATTERN.test(parsedUrl.protocol))
    return parsedUrl.href

  const inputWasRelative = isPathRelativeUrl(url)

  if (
    allowedPrefixes.some((prefix) => {
      const parsedPrefix = parseUrl(prefix, defaultOrigin)
      if (!parsedPrefix)
        return false

      if (parsedPrefix.origin !== parsedUrl.origin)
        return false

      return parsedUrl.href.startsWith(parsedPrefix.href)
    })
  ) {
    if (inputWasRelative)
      return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash

    return parsedUrl.href
  }

  if (allowedPrefixes.includes('*')) {
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:')
      return null

    if (inputWasRelative)
      return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash

    return parsedUrl.href
  }

  return null
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
