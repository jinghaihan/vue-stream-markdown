import type { CdnOptions } from '../types'
import { useBeautifulMermaidCdn } from './modules/use-beautiful-mermaid-cdn'
import { useKatexCdn } from './modules/use-katex-cdn'
import { useMermaidCdn } from './modules/use-mermaid-cdn'
import { useShikiCdn } from './modules/use-shiki-cdn'

export interface UseCdnLoaderOptions {
  cdnOptions?: CdnOptions
}

export function useCdnLoader(options?: UseCdnLoaderOptions) {
  const shikiCdn = useShikiCdn(options)
  const mermaidCdn = useMermaidCdn(options)
  const beautifulMermaidCdn = useBeautifulMermaidCdn(options)
  const katexCdn = useKatexCdn(options)

  return {
    getCdnShikiUrl: shikiCdn.getCdnUrl,
    loadCdnShiki: shikiCdn.loadCdn,

    getCdnMermaidUrl: mermaidCdn.getCdnUrl,
    loadCdnMermaid: mermaidCdn.loadCdn,

    getCdnBeautifulMermaidUrl: beautifulMermaidCdn.getCdnUrl,
    loadCdnBeautifulMermaid: beautifulMermaidCdn.loadCdn,

    getCdnKatexUrl: katexCdn.getCdnUrl,
    loadCdnKatex: katexCdn.loadCdn,
    getCdnKatexCssUrl: katexCdn.getCdnCssUrl,
    loadCdnKatexCss: katexCdn.loadCss,
  }
}
