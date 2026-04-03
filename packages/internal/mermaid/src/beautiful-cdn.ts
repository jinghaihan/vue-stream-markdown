import type { SharedCdnOptions } from '@stream-markdown/shared'
import type { MaybeGetter } from './types'
import {
  dynamicImport,
  getModuleFromImport,
  getModuleStrategy,
  isModuleEnabled,
  isSupportESM,
  removeTrailingSlash,
  resolveGetter,
} from '@stream-markdown/shared'
import { BEAUTIFUL_MERMAID_VERSION } from './constants'

let beautifulMermaidModule: typeof import('beautiful-mermaid') | null = null

export interface BeautifulMermaidCdnLoaderOptions {
  cdnOptions?: MaybeGetter<SharedCdnOptions | undefined>
}

export function createBeautifulMermaidCdnLoader(options?: BeautifulMermaidCdnLoaderOptions) {
  function getCdnUrl(): string | undefined {
    const cdnOptions = resolveGetter(options?.cdnOptions)
    const enabled = isModuleEnabled(cdnOptions?.beautifulMermaid)
    const strategy = getModuleStrategy(cdnOptions?.beautifulMermaid)
    const baseUrl = cdnOptions?.baseUrl
      ? removeTrailingSlash(cdnOptions.baseUrl)
      : ''
    const customGetter = !!cdnOptions?.getUrl

    if (!enabled)
      return undefined
    if (!baseUrl && !customGetter)
      return undefined

    if (customGetter) {
      const url = cdnOptions?.getUrl?.('beautiful-mermaid', BEAUTIFUL_MERMAID_VERSION)
      if (url)
        return url
    }

    const umd = `${baseUrl}/beautiful-mermaid@${BEAUTIFUL_MERMAID_VERSION}/dist/beautiful-mermaid.browser.global.min.js`
    if (strategy === 'umd')
      return umd

    return isSupportESM()
      ? `${baseUrl}/beautiful-mermaid@${BEAUTIFUL_MERMAID_VERSION}/+esm`
      : umd
  }

  async function loadCdn(): Promise<typeof import('beautiful-mermaid') | undefined> {
    if (beautifulMermaidModule)
      return beautifulMermaidModule

    const url = getCdnUrl()
    if (!url)
      return undefined

    const module = await dynamicImport<typeof import('beautiful-mermaid')>(url)
    beautifulMermaidModule = getModuleFromImport(module, 'beautifulMermaid')
    return beautifulMermaidModule ?? module
  }

  return {
    getCdnUrl,
    loadCdn,
  }
}
