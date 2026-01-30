import type { CdnOptions } from '../../types'
import { SHIKI_VERSION } from '../../constants'
import { removeTrailingSlash } from '../../utils'
import { dynamicImport, isModuleEnabled } from './_utils'

let shikiModule: typeof import('shiki') | null = null

export interface UseShikiCdnOptions {
  cdnOptions?: CdnOptions
}

export function useShikiCdn(options?: UseShikiCdnOptions) {
  const { cdnOptions } = options ?? {}

  const enabled = isModuleEnabled(cdnOptions?.shiki)
  const baseUrl = cdnOptions?.baseUrl
    ? removeTrailingSlash(cdnOptions.baseUrl)
    : ''
  const customGetter = !!cdnOptions?.getUrl

  function getCdnUrl(): string | undefined {
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
