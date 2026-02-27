import type { MaybeRef } from 'vue'
import type { CdnOptions, MermaidOptions, ShikiOptions } from '../../types'
import type { MermaidParseResult, MermaidRenderResult } from './types'
import { unref } from 'vue'
import { hasBeautifulMermaidModule } from '../../utils'
import { useBeautifulMermaidCdn } from '../modules/use-beautiful-mermaid-cdn'
import { BeautifulMermaidRenderer } from './beautiful'
import { VanillaMermaidRenderer } from './vanilla'

interface MermaidRendererInstance {
  loaded: boolean
  load: () => Promise<void>
  isLoaded: () => boolean
  isSupported: (diagramType: string) => boolean
  render: (code: string) => Promise<MermaidRenderResult>
  parse: (code: string) => Promise<MermaidParseResult>
}

export function createMermaidRenderer(
  options: MaybeRef<MermaidOptions | undefined>,
  cdnOptions?: MaybeRef<CdnOptions | undefined>,
  shikiOptions?: MaybeRef<ShikiOptions | undefined>,
  isDark?: MaybeRef<boolean>,
): MermaidRendererInstance {
  let beautifulRenderer: BeautifulMermaidRenderer | null = null
  let vanillaRenderer: VanillaMermaidRenderer | null = null
  let activeRenderer: MermaidRendererInstance | null = null
  let resolvingRenderer: Promise<MermaidRendererInstance> | null = null

  const createRenderer = (rendererType: 'beautiful' | 'vanilla'): MermaidRendererInstance => {
    if (rendererType === 'beautiful') {
      if (!beautifulRenderer)
        beautifulRenderer = new BeautifulMermaidRenderer(options, cdnOptions, shikiOptions, isDark)
      return beautifulRenderer
    }

    if (!vanillaRenderer)
      vanillaRenderer = new VanillaMermaidRenderer(options, cdnOptions, isDark)
    return vanillaRenderer
  }

  const getRenderer = async (): Promise<MermaidRendererInstance> => {
    if (activeRenderer)
      return activeRenderer

    if (!resolvingRenderer) {
      resolvingRenderer = (async () => {
        const rendererType = await resolveMermaidRendererType(
          unref(options),
          unref(cdnOptions),
        )
        const renderer = createRenderer(rendererType)
        activeRenderer = renderer
        return renderer
      })()
    }

    return await resolvingRenderer
  }

  return {
    get loaded() {
      return activeRenderer?.loaded ?? false
    },
    async load() {
      const renderer = await getRenderer()
      await renderer.load()
    },
    isLoaded: () => activeRenderer?.isLoaded() ?? false,
    isSupported: (diagramType: string) => activeRenderer?.isSupported(diagramType) ?? true,
    async render(code: string) {
      const renderer = await getRenderer()
      return await renderer.render(code)
    },
    async parse(code: string) {
      const renderer = await getRenderer()
      return await renderer.parse(code)
    },
  }
}

export async function resolveMermaidRendererType(
  options?: MermaidOptions,
  cdnOptions?: CdnOptions,
  hasBeautifulModule: () => Promise<boolean> = hasBeautifulMermaidModule,
): Promise<'beautiful' | 'vanilla'> {
  if (options?.renderer === 'beautiful')
    return 'beautiful'

  if (options?.renderer === 'vanilla')
    return 'vanilla'

  const { getCdnUrl } = useBeautifulMermaidCdn({ cdnOptions })
  if (getCdnUrl())
    return 'beautiful'

  return await hasBeautifulModule()
    ? 'beautiful'
    : 'vanilla'
}

export { BeautifulMermaidRenderer, VanillaMermaidRenderer }
export * from './types'
