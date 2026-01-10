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

  const customGenerate = !!cdnOptions?.generateUrl
  const baseUrl = cdnOptions?.baseUrl
    ? trailingSlash(cdnOptions.baseUrl)
    : ''

  const shikiEnabled = cdnOptions?.shiki !== false
  const katexEnabled = cdnOptions?.katex !== false
  const mermaidEnabled = cdnOptions?.mermaid !== false

  function getCdnShikiUrl(): string | undefined {
    if (!shikiEnabled)
      return
    if (!baseUrl && !customGenerate)
      return
    if (!isSupportESM())
      return

    return customGenerate
      ? cdnOptions?.generateUrl?.('shiki', SHIKI_VERSION)
      : `${baseUrl}/shiki@${SHIKI_VERSION}/+esm`
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
    if (!baseUrl && !customGenerate)
      return
    return customGenerate
      ? cdnOptions?.generateUrl?.('mermaid', MERMAID_VERSION)
      : isSupportESM()
        ? `${baseUrl}/mermaid@${MERMAID_VERSION}/+esm`
        : `${baseUrl}/mermaid@${MERMAID_VERSION}/dist/mermaid.min.js`
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
    if (!baseUrl && !customGenerate)
      return
    if (customGenerate)
      return cdnOptions?.generateUrl?.('katex', KATEX_VERSION)
    return isSupportESM()
      ? `${baseUrl}/katex@${KATEX_VERSION}/+esm`
      : `${baseUrl}/katex@${KATEX_VERSION}/dist/katex.min.js`
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
    if (!baseUrl && !customGenerate)
      return
    if (customGenerate)
      return cdnOptions?.generateUrl?.('katex', KATEX_VERSION)

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
