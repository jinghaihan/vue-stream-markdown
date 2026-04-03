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
import { MERMAID_VERSION } from './constants'

let mermaidModule: typeof import('mermaid') | null = null

export interface MermaidCdnLoaderOptions {
  cdnOptions?: MaybeGetter<SharedCdnOptions | undefined>
}

export function createMermaidCdnLoader(options?: MermaidCdnLoaderOptions) {
  function getCdnUrl(): string | undefined {
    const cdnOptions = resolveGetter(options?.cdnOptions)
    const enabled = isModuleEnabled(cdnOptions?.mermaid)
    const strategy = getModuleStrategy(cdnOptions?.mermaid)
    const baseUrl = cdnOptions?.baseUrl
      ? removeTrailingSlash(cdnOptions.baseUrl)
      : ''
    const customGetter = !!cdnOptions?.getUrl

    if (!enabled)
      return undefined
    if (!baseUrl && !customGetter)
      return undefined

    if (customGetter) {
      const url = cdnOptions?.getUrl?.('mermaid', MERMAID_VERSION)
      if (url)
        return url
    }

    const umd = `${baseUrl}/mermaid@${MERMAID_VERSION}/dist/mermaid.min.js`
    if (strategy === 'umd')
      return umd

    return isSupportESM()
      ? `${baseUrl}/mermaid@${MERMAID_VERSION}/+esm`
      : umd
  }

  async function loadCdn(): Promise<typeof import('mermaid') | undefined> {
    if (mermaidModule)
      return mermaidModule

    const url = getCdnUrl()
    if (!url)
      return undefined

    const module = await dynamicImport<typeof import('mermaid')>(url)
    mermaidModule = getModuleFromImport(module, 'mermaid')
    return mermaidModule ?? module
  }

  return {
    getCdnUrl,
    loadCdn,
  }
}
