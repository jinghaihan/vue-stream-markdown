import type { MaybeRef } from 'vue'
import type { CdnOptions, MermaidOptions, ShikiOptions } from '../../types'
import type { MermaidParseResult, MermaidRenderResult } from './types'
import { unref } from 'vue'
import { BeautifulMermaidRenderer } from './beautiful'
import { VanillaMermaidRenderer } from './vanilla'

export { BeautifulMermaidRenderer } from './beautiful'
export type { MermaidParseResult, MermaidRenderer, MermaidRenderResult } from './types'
export { VanillaMermaidRenderer } from './vanilla'

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

  const getRenderer = (): MermaidRendererInstance => {
    const rendererType = unref(options)?.renderer === 'beautiful' ? 'beautiful' : 'vanilla'

    if (rendererType === 'beautiful') {
      if (!beautifulRenderer)
        beautifulRenderer = new BeautifulMermaidRenderer(options, cdnOptions, shikiOptions, isDark)
      return beautifulRenderer
    }

    if (!vanillaRenderer)
      vanillaRenderer = new VanillaMermaidRenderer(options, cdnOptions, isDark)
    return vanillaRenderer
  }

  return {
    get loaded() {
      return getRenderer().loaded
    },
    load: () => getRenderer().load(),
    isLoaded: () => getRenderer().isLoaded(),
    isSupported: (diagramType: string) => getRenderer().isSupported(diagramType),
    render: (code: string) => getRenderer().render(code),
    parse: (code: string) => getRenderer().parse(code),
  }
}
