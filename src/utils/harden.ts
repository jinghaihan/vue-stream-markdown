const safeProtocols = new Set([
  'https:',
  'http:',
  'irc:',
  'ircs:',
  'mailto:',
  'xmpp:',
  'blob:',
])

// Protocols that should NEVER be allowed for security reasons
const blockedProtocols = new Set([
  'javascript:',
  'data:',
  'file:',
  'vbscript:',
])

function parseUrl(url: unknown, defaultOrigin: string): URL | null {
  if (typeof url !== 'string')
    return null
  try {
    // Try to parse as absolute URL first
    return new URL(url)
  }
  catch {
    // If that fails and we have a defaultOrigin, try with it
    if (defaultOrigin) {
      try {
        return new URL(url, defaultOrigin)
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
  return url.startsWith('/')
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

  // Allow hash-only (fragment-only) URLs - they navigate within the current page
  if (typeof url === 'string' && url.startsWith('#') && !isImage) {
    // Hash-only URLs don't need defaultOrigin validation
    // Just verify it's a valid fragment identifier
    try {
      // Use a dummy base to validate the hash format
      const testUrl = new URL(url, 'http://example.com')
      if (testUrl.hash === url) {
        return url
      }
    }
    catch {
      // Invalid hash format, fall through to normal validation
    }
  }

  // Handle data: URLs for images if allowDataImages is enabled
  if (typeof url === 'string' && url.startsWith('data:')) {
    // Only allow data: URLs for images when explicitly enabled
    if (isImage && allowDataImages && url.startsWith('data:image/')) {
      return url
    }
    return null
  }

  // Handle blob: URLs - these are browser-generated URLs for local objects
  if (typeof url === 'string' && url.startsWith('blob:')) {
    // blob: URLs are valid and safe - they reference in-memory objects
    // They can only reference content already loaded in the browser
    try {
      // Validate it's a properly formatted blob URL
      // blob: URLs should have the format: blob:<origin>/<uuid> or blob:null/<uuid>
      const blobUrl = new URL(url)
      if (blobUrl.protocol === 'blob:' && url.length > 5) {
        // Ensure there's actual content after "blob:"
        const afterProtocol = url.substring(5)
        if (afterProtocol && afterProtocol.length > 0 && afterProtocol !== 'invalid') {
          return url
        }
      }
    }
    catch {
      return null
    }
    // If we get here, the blob URL is malformed
    return null
  }

  const parsedUrl = parseUrl(url, defaultOrigin)
  if (!parsedUrl)
    return null

  // Block dangerous protocols - these should NEVER be allowed
  // Exception: data: is allowed for images if allowDataImages is true (handled above)
  if (blockedProtocols.has(parsedUrl.protocol)) {
    return null
  }

  // Check if protocol is allowed
  const isProtocolAllowed
    = safeProtocols.has(parsedUrl.protocol)
      || allowedProtocols.includes(parsedUrl.protocol)
      || allowedProtocols.includes('*')

  if (!isProtocolAllowed)
    return null

  // mailto: and other custom protocols can just return as-is
  if (parsedUrl.protocol === 'mailto:' || !parsedUrl.protocol.match(/^https?:$/)) {
    return parsedUrl.href
  }

  // If the input is path relative, we output a path relative URL as well,
  // however, we always run the same checks on an absolute URL and we
  // always reconstruct the output from the parsed URL to ensure that
  // the output is always a valid URL.
  const inputWasRelative = isPathRelativeUrl(url)
  if (
    parsedUrl
    && allowedPrefixes.some((prefix) => {
      const parsedPrefix = parseUrl(prefix, defaultOrigin)
      if (!parsedPrefix) {
        return false
      }
      if (parsedPrefix.origin !== parsedUrl.origin) {
        return false
      }
      return parsedUrl.href.startsWith(parsedPrefix.href)
    })
  ) {
    if (inputWasRelative) {
      return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash
    }
    return parsedUrl.href
  }

  // Check for wildcard - allow all URLs
  if (allowedPrefixes.includes('*')) {
    // Wildcard only allows http and https URLs
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      return null
    }
    if (inputWasRelative) {
      return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash
    }
    return parsedUrl.href
  }
  return null
}
