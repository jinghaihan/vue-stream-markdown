import type { CdnOptions } from '../../types'
import { BEAUTIFUL_MERMAID_VERSION } from '../../constants'
import { isSupportESM, removeTrailingSlash } from '../../utils'
import { dynamicImport, getModuleFromImport, getModuleStrategy, isModuleEnabled } from './_utils'

let beautifulMermaidModule: typeof import('beautiful-mermaid') | null = null

export interface UseBeautifulMermaidCdnOptions {
  cdnOptions?: CdnOptions
}

export function useBeautifulMermaidCdn(options?: UseBeautifulMermaidCdnOptions) {
  const { cdnOptions } = options ?? {}

  const enabled = isModuleEnabled(cdnOptions?.beautifulMermaid)
  const strategy = getModuleStrategy(cdnOptions?.beautifulMermaid)
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

    return module
  }

  return {
    getCdnUrl,
    loadCdn,
  }
}
