import type { MermaidParseResult, MermaidRenderResult } from '../types'
import { resolveGetter } from '@stream-markdown/shared'
import { createBeautifulMermaidCdnLoader } from '../beautiful-cdn'
import {
  BEAUTIFUL_MERMAID_SUPPORTED_PATTERNS,
  DEFAULT_BEAUTIFUL_MERMAID_THEME,
  PRESET_BEAUTIFUL_MERMAID_CONFIG,
} from '../constants'
import { MermaidRenderer } from './base'
import { VanillaMermaidRenderer } from './vanilla'

const DIAGRAM_TYPE_PATTERN = new RegExp(`^(${BEAUTIFUL_MERMAID_SUPPORTED_PATTERNS.join('|')})`)

async function hasBundledBeautifulMermaidModule() {
  try {
    await import('beautiful-mermaid')
    return true
  }
  catch {
    return false
  }
}

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
  private beautifulMermaid: typeof import('beautiful-mermaid') | null = null
  private vanillaRenderer: VanillaMermaidRenderer | null = null

  private getVanillaRenderer() {
    if (!this.vanillaRenderer)
      this.vanillaRenderer = new VanillaMermaidRenderer(this.options)

    return this.vanillaRenderer
  }

  private get currentTheme() {
    const [light, dark] = resolveGetter(this.options.beautifulTheme) ?? DEFAULT_BEAUTIFUL_MERMAID_THEME
    return resolveGetter(this.options.isDark) ? dark : light
  }

  private get mergedOptions() {
    return {
      ...PRESET_BEAUTIFUL_MERMAID_CONFIG,
      ...(resolveGetter(this.options.beautifulConfig) ?? {}),
    }
  }

  private async getRenderOptions() {
    const presetOptions = this.beautifulMermaid?.THEMES[this.currentTheme]
    if (presetOptions)
      return { ...presetOptions, ...this.mergedOptions }

    const colors = await this.options.getThemeColors?.()
    return colors ? { ...colors, ...this.mergedOptions } : this.mergedOptions
  }

  async load(): Promise<void> {
    if (this.beautifulMermaid)
      return

    const cdnLoader = createBeautifulMermaidCdnLoader({
      cdnOptions: this.options.cdnOptions,
    })

    this.beautifulMermaid = await cdnLoader.loadCdn() ?? await import('beautiful-mermaid')
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
      const svg = await this.beautifulMermaid!.renderMermaidSVGAsync(code, renderOptions)
      return { svg, valid: true }
    }
    catch (error) {
      return { valid: false, error: this.toError(error) }
    }
  }

  async isEnabled(): Promise<boolean> {
    const cdnLoader = createBeautifulMermaidCdnLoader({
      cdnOptions: this.options.cdnOptions,
    })

    try {
      if (await hasBundledBeautifulMermaidModule())
        return true

      return !!cdnLoader.getCdnUrl()
    }
    catch {
      return false
    }
  }
}
