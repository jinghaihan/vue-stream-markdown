import type { CdnOptions } from '../../types'
import { KATEX_VERSION } from '../../constants'
import { removeTrailingSlash } from '../../utils'
import { dynamicImport, getModuleFromImport, getModuleStrategy, isModuleEnabled } from './_utils'

let katexModule: typeof import('katex') | null = null
let katexCssLoaded = false

export interface UseKatexCdnOptions {
  cdnOptions?: CdnOptions
}

export function useKatexCdn(options?: UseKatexCdnOptions) {
  const { cdnOptions } = options ?? {}

  const enabled = isModuleEnabled(cdnOptions?.katex)
  const strategy = getModuleStrategy(cdnOptions?.katex)
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
      const url = cdnOptions?.getUrl?.('katex', KATEX_VERSION)
      if (url)
        return url
    }

    const umd = `${baseUrl}/katex@${KATEX_VERSION}/dist/katex.min.js`
    if (strategy === 'umd')
      return umd

    return typeof window !== 'undefined' && 'supports' in HTMLScriptElement && HTMLScriptElement.supports?.('importmap')
      ? `${baseUrl}/katex@${KATEX_VERSION}/+esm`
      : umd
  }

  async function loadCdn(): Promise<typeof import('katex') | undefined> {
    if (katexModule)
      return katexModule

    const url = getCdnUrl()
    if (!url)
      return undefined

    const module = await dynamicImport<typeof import('katex')>(url)
    katexModule = getModuleFromImport(module, 'katex')

    return module
  }

  function getCdnCssUrl(): string | undefined {
    if (!enabled)
      return undefined
    if (!baseUrl && !customGetter)
      return undefined

    if (customGetter) {
      const url = cdnOptions?.getUrl?.('katex-css', KATEX_VERSION)
      if (url)
        return url
    }

    return `${baseUrl}/katex@${KATEX_VERSION}/dist/katex.min.css`
  }

  function loadCss(): void {
    if (katexCssLoaded)
      return

    const url = getCdnCssUrl()
    if (!url)
      return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    document.head.appendChild(link)

    katexCssLoaded = true
  }

  return {
    getCdnUrl,
    loadCdn,
    getCdnCssUrl,
    loadCss,
  }
}
