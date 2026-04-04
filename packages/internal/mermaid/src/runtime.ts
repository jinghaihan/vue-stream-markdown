import type {
  MermaidParseResult,
  MermaidRendererType,
  MermaidRenderResult,
  MermaidRuntime,
  MermaidRuntimeOptions,
} from './types'
import { resolveGetter, save, svgToPngBlob } from '@stream-markdown/shared'
import { createBeautifulMermaidCdnLoader } from './beautiful-cdn'
import { BeautifulMermaidRenderer } from './runtime/beautiful'
import { VanillaMermaidRenderer } from './runtime/vanilla'

async function hasBundledBeautifulMermaidModule() {
  try {
    await import('beautiful-mermaid')
    return true
  }
  catch {
    return false
  }
}

interface MermaidRendererInstance {
  loaded: boolean
  load: () => Promise<void>
  isLoaded: () => boolean
  isSupported: (diagramType: string) => boolean
  render: (code: string) => Promise<MermaidRenderResult>
  parse: (code: string) => Promise<MermaidParseResult>
  isEnabled: () => Promise<boolean>
}

export async function resolveMermaidRendererType(
  options: Pick<MermaidRuntimeOptions, 'renderer' | 'cdnOptions'> = {},
  hasBeautifulModule: () => Promise<boolean> = hasBundledBeautifulMermaidModule,
): Promise<MermaidRendererType> {
  const cdnLoader = createBeautifulMermaidCdnLoader({
    cdnOptions: options.cdnOptions,
  })

  const renderer = resolveGetter(options.renderer)
  if (renderer === 'beautiful')
    return 'beautiful'
  if (renderer === 'vanilla')
    return 'vanilla'
  if (cdnLoader.getCdnUrl())
    return 'beautiful'

  return await hasBeautifulModule() ? 'beautiful' : 'vanilla'
}

export function createMermaidRuntime(options: MermaidRuntimeOptions = {}): MermaidRuntime {
  let beautifulRenderer: BeautifulMermaidRenderer | null = null
  let vanillaRenderer: VanillaMermaidRenderer | null = null
  let activeRenderer: MermaidRendererInstance | null = null
  let activeRendererType: MermaidRendererType | null = null

  const createRenderer = (rendererType: MermaidRendererType): MermaidRendererInstance => {
    if (rendererType === 'beautiful') {
      if (!beautifulRenderer)
        beautifulRenderer = new BeautifulMermaidRenderer(options)
      return beautifulRenderer
    }

    if (!vanillaRenderer)
      vanillaRenderer = new VanillaMermaidRenderer(options)
    return vanillaRenderer
  }

  const getRenderer = async (): Promise<MermaidRendererInstance> => {
    const rendererType = await resolveMermaidRendererType(options)
    if (activeRenderer && activeRendererType === rendererType)
      return activeRenderer

    const renderer = createRenderer(rendererType)
    activeRenderer = renderer
    activeRendererType = rendererType
    return renderer
  }

  async function load() {
    const renderer = await getRenderer()
    await renderer.load()
  }

  async function parse(code: string) {
    const renderer = await getRenderer()
    return await renderer.parse(code)
  }

  async function render(code: string) {
    const renderer = await getRenderer()
    return await renderer.render(code)
  }

  async function saveDiagram(format: 'svg' | 'png', code: string) {
    const { svg } = await render(code)
    if (!svg)
      throw new Error('SVG not found. Please wait for the diagram to render.')

    if (format === 'svg') {
      save('diagram.svg', svg, 'image/svg+xml')
      return
    }

    const blob = await svgToPngBlob(svg)
    if (!blob)
      throw new Error('Failed to export PNG image')

    save('diagram.png', blob, 'image/png')
  }

  async function preload() {
    const renderer = await getRenderer()
    if (!await renderer.isEnabled())
      return

    if (!renderer.isLoaded())
      await renderer.load()
  }

  return {
    installed: getRenderer().then(renderer => renderer.isEnabled()),
    preload,
    load,
    dispose() {
      activeRenderer = null
      activeRendererType = null
    },
    parse,
    render,
    save: saveDiagram,
  }
}
