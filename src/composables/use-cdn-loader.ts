import type { CdnOptions } from '../types'
import { KATEX_VERSION, MERMAID_VERSION, SHIKI_VERSION } from '../constants'
import { isSupportESM, trailingSlash } from '../utils'

interface UseCdnLoaderOptions {
  cdnOptions?: CdnOptions
}

let katexCssLoaded = false
let shikiModule: typeof import('shiki') | null = null
let mermaidModule: typeof import('mermaid') | null = null
let katexModule: typeof import('katex') | null = null

function dynamicImport<T>(url: string): Promise<T> {
  // eslint-disable-next-line no-new-func
  return new Function('url', 'return import(url)')(url) as Promise<T>
}

export function useCdnLoader(options?: UseCdnLoaderOptions) {
  const { cdnOptions } = options ?? {}

  const baseUrl = cdnOptions?.baseUrl
    ? trailingSlash(cdnOptions.baseUrl)
    : ''
  const customGetter = !!cdnOptions?.getUrl

  const shikiEnabled = cdnOptions?.shiki !== false
  const mermaidEnabled = cdnOptions?.mermaid !== false
  const katexEnabled = cdnOptions?.katex !== false

  const mermaidStrategy = cdnOptions?.mermaid === 'umd' ? 'umd' : 'esm'
  const katexStrategy = cdnOptions?.katex === 'umd' ? 'umd' : 'esm'

  function getCdnShikiUrl(): string | undefined {
    if (!shikiEnabled)
      return
    if (!baseUrl && !customGetter)
      return
    if (!isSupportESM())
      return

    if (customGetter) {
      const url = cdnOptions?.getUrl?.('shiki', SHIKI_VERSION)
      if (url)
        return url
    }

    return `${baseUrl}/shiki@${SHIKI_VERSION}/+esm`
  }

  async function loadCdnShiki(): Promise<typeof import('shiki') | undefined> {
    if (shikiModule)
      return shikiModule

    const url = getCdnShikiUrl()
    if (!url)
      return

    const module = await dynamicImport<typeof import('shiki')>(url)
    shikiModule = module

    return module
  }

  function getCdnMermaidUrl(): string | undefined {
    if (!mermaidEnabled)
      return
    if (!baseUrl && !customGetter)
      return
    if (customGetter) {
      const url = cdnOptions?.getUrl?.('mermaid', MERMAID_VERSION)
      if (url)
        return url
    }

    const umd = `${baseUrl}/mermaid@${MERMAID_VERSION}/dist/mermaid.min.js`
    if (mermaidStrategy === 'umd')
      return umd

    return isSupportESM()
      ? `${baseUrl}/mermaid@${MERMAID_VERSION}/+esm`
      : umd
  }

  async function loadCdnMermaid(): Promise<typeof import('mermaid') | undefined> {
    if (mermaidModule)
      return mermaidModule

    const url = getCdnMermaidUrl()
    if (!url)
      return

    const module = await dynamicImport<typeof import('mermaid')>(url)
    mermaidModule = (isSupportESM() ? module : window.mermaid) ?? null

    return module
  }

  function getCdnKatexUrl(): string | undefined {
    if (!katexEnabled)
      return
    if (!baseUrl && !customGetter)
      return
    if (customGetter) {
      const url = cdnOptions?.getUrl?.('katex', KATEX_VERSION)
      if (url)
        return url
    }

    const umd = `${baseUrl}/katex@${KATEX_VERSION}/dist/katex.min.js`
    if (katexStrategy === 'umd')
      return umd

    return isSupportESM()
      ? `${baseUrl}/katex@${KATEX_VERSION}/+esm`
      : umd
  }

  async function loadCdnKatex(): Promise<typeof import('katex') | undefined> {
    if (katexModule)
      return katexModule

    const url = getCdnKatexUrl()
    if (!url)
      return

    const module = await dynamicImport<typeof import('katex')>(url)
    katexModule = (isSupportESM() ? module : window.katex) ?? null

    return module
  }

  function getCdnKatexCssUrl(): string | undefined {
    if (!katexEnabled)
      return
    if (!baseUrl && !customGetter)
      return
    if (customGetter) {
      const url = cdnOptions?.getUrl?.('katex-css', KATEX_VERSION)
      if (url)
        return url
    }

    return `${baseUrl}/katex@${KATEX_VERSION}/dist/katex.min.css`
  }

  function loadCdnKatexCss() {
    if (katexCssLoaded)
      return

    const url = getCdnKatexCssUrl()
    if (!url)
      return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    document.head.appendChild(link)

    katexCssLoaded = true
  }

  return {
    getCdnShikiUrl,
    loadCdnShiki,
    getCdnMermaidUrl,
    loadCdnMermaid,
    getCdnKatexUrl,
    loadCdnKatex,
    getCdnKatexCssUrl,
    loadCdnKatexCss,
  }
}
