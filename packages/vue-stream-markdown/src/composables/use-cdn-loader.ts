import type { CdnOptions } from '@stream-markdown/shared'
import { createShikiCdnLoader } from '@stream-markdown/code'
import { createKatexCdnLoader } from '@stream-markdown/math'
import { createBeautifulMermaidCdnLoader, createMermaidCdnLoader } from '@stream-markdown/mermaid'

interface UseCdnLoaderOptions {
  cdnOptions?: CdnOptions
}

export function useCdnLoader(options?: UseCdnLoaderOptions) {
  const cdnOptions = options?.cdnOptions
  const shikiCdn = createShikiCdnLoader({ cdnOptions })
  const mermaidCdn = createMermaidCdnLoader({ cdnOptions })
  const beautifulMermaidCdn = createBeautifulMermaidCdnLoader({ cdnOptions })
  const katexCdn = createKatexCdnLoader({ cdnOptions })

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
