import type { LinkOptions } from '../types'

export function resolveLinkFaviconUrl(
  url: string,
  favicon: LinkOptions['favicon'] = true,
): Promise<string | undefined> | string | undefined {
  if (favicon === false || !url)
    return undefined

  if (typeof favicon === 'function')
    return favicon(url)

  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:')
      return undefined
    return `${parsedUrl.origin}/favicon.ico`
  }
  catch {
    return undefined
  }
}
