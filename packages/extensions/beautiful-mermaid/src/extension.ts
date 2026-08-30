import type {
  MermaidExtension,
  MermaidRenderInput,
} from '@stream-markdown/core'
import type { BeautifulMermaidExtensionOptions } from './types'
import { resolveGetter } from '@stream-markdown/core'
import { createBeautifulMermaidCdnLoader } from './cdn'
import {
  BEAUTIFUL_MERMAID_SUPPORTED_PATTERNS,
  DEFAULT_BEAUTIFUL_MERMAID_THEME,
  PRESET_BEAUTIFUL_MERMAID_CONFIG,
} from './constants'

const DIAGRAM_TYPE_PATTERN = new RegExp(`^(${BEAUTIFUL_MERMAID_SUPPORTED_PATTERNS.join('|')})`)

function extractDiagramType(code: string): string {
  for (const line of code.trim().split('\n')) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('%%'))
      return trimmed.match(DIAGRAM_TYPE_PATTERN)?.[1] ?? 'unknown'
  }
  return 'unknown'
}

export function beautifulMermaid<TErrorComponent = never>(
  options: BeautifulMermaidExtensionOptions<TErrorComponent> = {},
): MermaidExtension<TErrorComponent> {
  let module: typeof import('beautiful-mermaid') | null = null
  const cdnLoader = createBeautifulMermaidCdnLoader({
    cdnOptions: options.cdnOptions,
  })

  const supports = (code: string) => BEAUTIFUL_MERMAID_SUPPORTED_PATTERNS.some(
    pattern => extractDiagramType(code).startsWith(pattern),
  )

  async function load() {
    module ??= await cdnLoader.loadCdn() ?? await import('beautiful-mermaid')
    return module
  }

  async function getRenderOptions(input: MermaidRenderInput) {
    const renderer = await load()
    const [light, dark] = resolveGetter(options.theme) ?? DEFAULT_BEAUTIFUL_MERMAID_THEME
    const preset = renderer.THEMES[input.isDark ? dark : light]
    const shikiTheme = input.theme
      ? renderer.fromShikiTheme(input.theme as never)
      : undefined

    return {
      ...PRESET_BEAUTIFUL_MERMAID_CONFIG,
      ...(preset ?? shikiTheme ?? {}),
      ...(resolveGetter(options.config) ?? {}),
    }
  }

  return {
    errorComponent: options.errorComponent,
    preload: async () => {
      await load()
    },
    dispose() {
      module = null
    },
    supports,
    async render(input) {
      if (!supports(input.code))
        return { supported: false, valid: false }

      try {
        const renderer = await load()
        const svg = await renderer.renderMermaidSVGAsync(
          input.code,
          await getRenderOptions(input),
        )
        return { supported: true, svg, valid: true }
      }
      catch (error) {
        return {
          supported: true,
          valid: false,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    },
  }
}
