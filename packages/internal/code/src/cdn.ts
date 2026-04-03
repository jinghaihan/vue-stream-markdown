import type { SharedCdnOptions } from '@stream-markdown/shared'
import type { MaybeGetter } from './types'
import { dynamicImport, isModuleEnabled, removeTrailingSlash, resolveGetter } from '@stream-markdown/shared'
import { SHIKI_VERSION } from './constants'

let shikiModule: typeof import('shiki') | null = null

export interface ShikiCdnLoaderOptions {
  cdnOptions?: MaybeGetter<SharedCdnOptions | undefined>
}

export function createShikiCdnLoader(options?: ShikiCdnLoaderOptions) {
  function getCdnUrl(): string | undefined {
    const cdnOptions = resolveGetter(options?.cdnOptions)
    const enabled = isModuleEnabled(cdnOptions?.shiki)
    const baseUrl = cdnOptions?.baseUrl
      ? removeTrailingSlash(cdnOptions.baseUrl)
      : ''
    const customGetter = !!cdnOptions?.getUrl

    if (!enabled)
      return undefined
    if (!baseUrl && !customGetter)
      return undefined
    if (!import.meta.env.SSR && typeof window !== 'undefined') {
      if (!('supports' in HTMLScriptElement) || !(HTMLScriptElement.supports?.('importmap')))
        return undefined
    }

    if (customGetter) {
      const url = cdnOptions?.getUrl?.('shiki', SHIKI_VERSION)
      if (url)
        return url
    }

    return `${baseUrl}/shiki@${SHIKI_VERSION}/+esm`
  }

  async function loadCdn(): Promise<typeof import('shiki') | undefined> {
    if (shikiModule)
      return shikiModule

    const url = getCdnUrl()
    if (!url)
      return undefined

    const module = await dynamicImport<typeof import('shiki')>(url)
    shikiModule = module
    return module
  }

  return {
    getCdnUrl,
    loadCdn,
  }
}
