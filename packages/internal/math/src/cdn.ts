import type { SharedCdnOptions } from '@stream-markdown/shared'
import type { MaybeGetter } from './types'
import {
  dynamicImport,
  getModuleFromImport,
  getModuleStrategy,
  isModuleEnabled,
  removeTrailingSlash,
  resolveGetter,
} from '@stream-markdown/shared'
import { KATEX_VERSION } from './constants'

let katexModule: typeof import('katex') | null = null
let katexCssLoaded = false

export interface KatexCdnLoaderOptions {
  cdnOptions?: MaybeGetter<SharedCdnOptions | undefined>
}

export function createKatexCdnLoader(options?: KatexCdnLoaderOptions) {
  function getCdnUrl(): string | undefined {
    const cdnOptions = resolveGetter(options?.cdnOptions)
    const enabled = isModuleEnabled(cdnOptions?.katex)
    const strategy = getModuleStrategy(cdnOptions?.katex)
    const baseUrl = cdnOptions?.baseUrl
      ? removeTrailingSlash(cdnOptions.baseUrl)
      : ''
    const customGetter = !!cdnOptions?.getUrl

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
    return katexModule ?? module
  }

  function getCdnCssUrl(): string | undefined {
    const cdnOptions = resolveGetter(options?.cdnOptions)
    const enabled = isModuleEnabled(cdnOptions?.katex)
    const baseUrl = cdnOptions?.baseUrl
      ? removeTrailingSlash(cdnOptions.baseUrl)
      : ''
    const customGetter = !!cdnOptions?.getUrl

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

  function loadCss() {
    if (katexCssLoaded || typeof document === 'undefined')
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
