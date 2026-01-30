import type { CdnOptions } from '../../types'
import { MERMAID_VERSION } from '../../constants'
import { isSupportESM, removeTrailingSlash } from '../../utils'
import { dynamicImport, getModuleFromImport, getModuleStrategy, isModuleEnabled } from './_utils'

let mermaidModule: typeof import('mermaid') | null = null

interface UseMermaidCdnOptions {
  cdnOptions?: CdnOptions
}

export function useMermaidCdn(options?: UseMermaidCdnOptions) {
  const { cdnOptions } = options ?? {}

  const enabled = isModuleEnabled(cdnOptions?.mermaid)
  const strategy = getModuleStrategy(cdnOptions?.mermaid)
  const baseUrl = cdnOptions?.baseUrl
    ? removeTrailingSlash(cdnOptions.baseUrl)
    : ''
  const customGetter = !!cdnOptions?.getUrl

  function getCdnUrl(): string | undefined {
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

    return module
  }

  return {
    getCdnUrl,
    loadCdn,
  }
}
