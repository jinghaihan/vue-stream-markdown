import type {
  MermaidExtensionRenderResult,
  MermaidRenderInput,
} from '@stream-markdown/core'
import type {
  BeautifulMermaidRuntime,
  BeautifulMermaidRuntimeOptions,
} from './types'
import { resolveGetter } from '@stream-markdown/core'
import { createBeautifulMermaidCdnLoader } from './cdn'
import {
  BEAUTIFUL_MERMAID_SUPPORTED_PATTERNS,
  DEFAULT_BEAUTIFUL_MERMAID_THEME,
  PRESET_BEAUTIFUL_MERMAID_CONFIG,
} from './constants'

function assertBeautifulMermaidModule(
  module: unknown,
  source: string,
): asserts module is typeof import('beautiful-mermaid') {
  const candidate = module as Partial<typeof import('beautiful-mermaid')> | null
  const missing = [
    typeof candidate?.renderMermaidSVGAsync === 'function' ? undefined : 'renderMermaidSVGAsync',
    candidate?.THEMES && typeof candidate.THEMES === 'object' ? undefined : 'THEMES',
    typeof candidate?.fromShikiTheme === 'function' ? undefined : 'fromShikiTheme',
  ].filter((name): name is string => !!name)

  if (missing.length > 0) {
    const exports = candidate && typeof candidate === 'object'
      ? Object.keys(candidate).sort().join(', ') || '(none)'
      : typeof candidate
    throw new Error(
      `[vue-stream-markdown] Invalid Beautiful Mermaid module from ${source}. `
      + `Missing: ${missing.join(', ')}. `
      + `Received exports: ${exports}. Expected the full "beautiful-mermaid" entry.`,
    )
  }
}

const DIAGRAM_TYPE_PATTERN = new RegExp(`^(${BEAUTIFUL_MERMAID_SUPPORTED_PATTERNS.join('|')})`)

function extractDiagramType(code: string): string {
  for (const line of code.trim().split('\n')) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('%%'))
      return trimmed.match(DIAGRAM_TYPE_PATTERN)?.[1] ?? 'unknown'
  }
  return 'unknown'
}

export function createBeautifulMermaidRuntime(
  options: BeautifulMermaidRuntimeOptions = {},
): BeautifulMermaidRuntime {
  let module: typeof import('beautiful-mermaid') | null = null
  const cdnLoader = createBeautifulMermaidCdnLoader({
    cdnOptions: options.cdnOptions,
  })

  const supports = (code: string) => BEAUTIFUL_MERMAID_SUPPORTED_PATTERNS.some(
    pattern => extractDiagramType(code).startsWith(pattern),
  )

  async function load() {
    module ??= await cdnLoader.loadCdn() ?? await import('beautiful-mermaid')
    assertBeautifulMermaidModule(
      module,
      cdnLoader.getCdnUrl() ?? 'the local "beautiful-mermaid" package',
    )
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

  async function render(input: MermaidRenderInput): Promise<MermaidExtensionRenderResult> {
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
  }

  return {
    preload: async () => {
      await load()
    },
    load,
    dispose() {
      module = null
    },
    supports,
    render,
  }
}
