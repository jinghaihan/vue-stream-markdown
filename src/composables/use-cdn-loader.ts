import type { CdnOptions } from '../types'
import { KATEX_VERSION, MERMAID_VERSION, SHIKI_VERSION } from '../constants'
import { isSupportESM, trailingSlash } from '../utils'

interface UseCdnLoaderOptions {
  cdnOptions?: CdnOptions
}

let katexCssLoaded = false
let mermaidLoaded = false

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
    if (!isSupportESM())
      return
    return customGenerate
      ? cdnOptions?.generateUrl?.('shiki', SHIKI_VERSION)
      : baseUrl
        ? `${baseUrl}/shiki@${SHIKI_VERSION}/+esm`
        : undefined
  }

  function getCdnKatexCssUrl(): string | undefined {
    if (!katexEnabled)
      return
    if (customGenerate)
      return cdnOptions?.generateUrl?.('katex', KATEX_VERSION)
    return baseUrl ? `${baseUrl}/katex@${KATEX_VERSION}/dist/katex.min.css` : undefined
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

  function getCdnMermaidUrl(): string | undefined {
    if (!mermaidEnabled)
      return
    return customGenerate
      ? cdnOptions?.generateUrl?.('mermaid', MERMAID_VERSION)
      : baseUrl
        ? isSupportESM()
          ? `${baseUrl}/mermaid@${MERMAID_VERSION}/+esm`
          : `${baseUrl}/mermaid@${MERMAID_VERSION}/dist/mermaid.min.js`
        : undefined
  }

  async function loadCdnMermaid(): Promise<typeof import('mermaid') | undefined> {
    if (mermaidLoaded)
      return

    const url = getCdnMermaidUrl()
    if (!url)
      return

    const module = await dynamicImport<typeof import('mermaid')>(url)
    mermaidLoaded = true

    return module
  }

  return {
    getCdnShikiUrl,
    getCdnKatexCssUrl,
    loadCdnKatexCss,
    getCdnMermaidUrl,
    loadCdnMermaid,
  }
}
