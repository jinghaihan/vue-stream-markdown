import type { MaybeRef } from 'vue'
import type { CdnOptions, MermaidOptions, ShikiOptions } from '../../types'
import type { MermaidParseResult, MermaidRenderResult } from './types'
import { unref } from 'vue'
import { DEFAULT_SHIKI_DARK_THEME, DEFAULT_SHIKI_LIGHT_THEME } from '../../constants'
import { DEFAULT_BEAUTIFUL_MERMAID_THEME, PRESET_BEAUTIFUL_MERMAID_CONFIG } from '../../constants/mermaid'
import { useCdnLoader } from '../use-cdn-loader'
import { useShiki } from '../use-shiki'
import { MermaidRenderer } from './types'

const BEAUTIFUL_DIAGRAM_PREFIXES = [
  'flowchart',
  'graph',
  'stateDiagram',
  'sequence',
  'classDiagram',
  'erDiagram',
] as const

const DIAGRAM_TYPE_PATTERN = new RegExp(`^(${BEAUTIFUL_DIAGRAM_PREFIXES.join('|')})`)

function extractDiagramType(code: string): string {
  const lines = code.trim().split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('%%')) {
      const match = trimmed.match(DIAGRAM_TYPE_PATTERN)
      return match?.[1] ?? 'unknown'
    }
  }
  return 'unknown'
}

export class BeautifulMermaidRenderer extends MermaidRenderer {
  private cdnOptions?: MaybeRef<CdnOptions | undefined>
  private shikiOptions?: MaybeRef<ShikiOptions | undefined>
  private isDark: MaybeRef<boolean>
  private beautifulMermaid: typeof import('beautiful-mermaid') | null = null

  constructor(
    options: MaybeRef<MermaidOptions | undefined>,
    cdnOptions?: MaybeRef<CdnOptions | undefined>,
    shikiOptions?: MaybeRef<ShikiOptions | undefined>,
    isDark?: MaybeRef<boolean>,
  ) {
    super(options)
    this.cdnOptions = cdnOptions
    this.shikiOptions = shikiOptions
    this.isDark = isDark ?? false
  }

  private get currentTheme(): string {
    const resolvedOptions = unref(this.options)
    const [light, dark] = resolvedOptions?.beautifulTheme ?? DEFAULT_BEAUTIFUL_MERMAID_THEME
    return unref(this.isDark) ? dark : light
  }

  private get currentShikiTheme(): string {
    const resolvedShikiOptions = unref(this.shikiOptions)
    const [light, dark] = resolvedShikiOptions?.theme ?? [DEFAULT_SHIKI_LIGHT_THEME, DEFAULT_SHIKI_DARK_THEME]
    return unref(this.isDark) ? dark : light
  }

  private get mergedOptions() {
    const resolvedOptions = unref(this.options)
    return {
      ...PRESET_BEAUTIFUL_MERMAID_CONFIG,
      ...(resolvedOptions?.beautifulConfig ?? {}),
    }
  }

  private async getShikiColors() {
    try {
      const { getHighlighter } = useShiki({
        shikiOptions: this.shikiOptions,
        cdnOptions: unref(this.cdnOptions),
        isDark: this.isDark,
      })
      const highlighter = await getHighlighter()
      const shikiTheme = highlighter.getTheme(this.currentShikiTheme)
      const colors = this.beautifulMermaid?.fromShikiTheme(shikiTheme)

      return colors ? { ...colors, ...this.mergedOptions } : null
    }
    catch {
      return null
    }
  }

  async getRenderOptions() {
    const options = this.beautifulMermaid?.THEMES[this.currentTheme]
    if (!options)
      return await this.getShikiColors() ?? this.mergedOptions

    return {
      ...options,
      ...this.mergedOptions,
    }
  }

  async load(): Promise<void> {
    if (this.beautifulMermaid)
      return

    const { loadCdnBeautifulMermaid } = useCdnLoader({
      cdnOptions: unref(this.cdnOptions),
    })

    const module = await loadCdnBeautifulMermaid() ?? await import('beautiful-mermaid')
    this.beautifulMermaid = module
  }

  isSupported(diagramType: string): boolean {
    return BEAUTIFUL_DIAGRAM_PREFIXES.some(prefix => diagramType.startsWith(prefix))
  }

  async parse(code: string): Promise<MermaidParseResult> {
    try {
      await this.ensureLoaded()

      const diagramType = extractDiagramType(code)
      if (!this.isSupported(diagramType)) {
        return {
          valid: false,
          error: `Diagram type "${diagramType}" is not supported by beautiful-mermaid`,
        }
      }

      return { valid: true }
    }
    catch (error) {
      return { valid: false, error: this.toError(error) }
    }
  }

  async render(code: string): Promise<MermaidRenderResult> {
    const parseResult = await this.parse(code)
    if (!parseResult.valid)
      return { error: parseResult.error, valid: false }

    try {
      await this.ensureLoaded()
      const renderOptions = await this.getRenderOptions()
      const svg = await this.beautifulMermaid!.renderMermaid(code, renderOptions)
      return { svg, valid: true }
    }
    catch (error) {
      return { valid: false, error: this.toError(error) }
    }
  }
}
