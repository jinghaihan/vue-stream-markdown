import type { MaybeRef } from 'vue'
import type { CdnOptions, MermaidOptions, ShikiOptions } from '../../types'
import type { MermaidParseResult, MermaidRenderResult } from './types'
import { unref } from 'vue'
import { DEFAULT_SHIKI_DARK_THEME, DEFAULT_SHIKI_LIGHT_THEME } from '../../constants'
import {
  BEAUTIFUL_MERMAID_SUPPORTED_PATTERNS,
  DEFAULT_BEAUTIFUL_MERMAID_THEME,
  PRESET_BEAUTIFUL_MERMAID_CONFIG,
} from '../../constants/mermaid'
import { useCdnLoader } from '../use-cdn-loader'
import { useShiki } from '../use-shiki'
import { MermaidRenderer } from './types'
import { VanillaMermaidRenderer } from './vanilla'

const DIAGRAM_TYPE_PATTERN = new RegExp(`^(${BEAUTIFUL_MERMAID_SUPPORTED_PATTERNS.join('|')})`)

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

function mightBeSupported(diagramType: string): boolean {
  return BEAUTIFUL_MERMAID_SUPPORTED_PATTERNS.some(pattern =>
    diagramType.startsWith(pattern),
  )
}

export class BeautifulMermaidRenderer extends MermaidRenderer {
  private cdnOptions?: MaybeRef<CdnOptions | undefined>
  private shikiOptions?: MaybeRef<ShikiOptions | undefined>
  private isDark: MaybeRef<boolean>
  private beautifulMermaid: typeof import('beautiful-mermaid') | null = null
  private vanillaRenderer: VanillaMermaidRenderer | null = null

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

  private getVanillaRenderer(): VanillaMermaidRenderer {
    if (!this.vanillaRenderer) {
      this.vanillaRenderer = new VanillaMermaidRenderer(
        this.options,
        this.cdnOptions,
        this.isDark,
      )
    }
    return this.vanillaRenderer
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
    return mightBeSupported(diagramType)
  }

  async parse(code: string): Promise<MermaidParseResult> {
    const diagramType = extractDiagramType(code)

    if (!mightBeSupported(diagramType))
      return this.getVanillaRenderer().parse(code)

    try {
      await this.ensureLoaded()
      return { valid: true }
    }
    catch (error) {
      return { valid: false, error: this.toError(error) }
    }
  }

  async render(code: string): Promise<MermaidRenderResult> {
    const diagramType = extractDiagramType(code)

    if (!mightBeSupported(diagramType))
      return this.getVanillaRenderer().render(code)

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
