import type { Mermaid } from 'mermaid'
import type { MermaidParseResult, MermaidRenderResult } from '../types'
import { randomStr } from '@antfu/utils'
import { isClient, resolveGetter } from '@stream-markdown/shared'
import { DEFAULT_MERMAID_THEME } from '../constants'
import { createMermaidCdnLoader } from '../mermaid-cdn'
import { MermaidRenderer } from './base'

async function hasBundledMermaidModule() {
  try {
    await import('mermaid')
    return true
  }
  catch {
    return false
  }
}

export class VanillaMermaidRenderer extends MermaidRenderer {
  private mermaid: Mermaid | null = null

  private get currentTheme(): string {
    const [light, dark] = resolveGetter(this.options.theme) ?? DEFAULT_MERMAID_THEME
    return resolveGetter(this.options.isDark) ? dark : light
  }

  private wrapThemeCode(code: string): string {
    if (code.startsWith('%%{'))
      return code

    return `%%{init: {"theme": "${this.currentTheme}"}}%%\n${code}`
  }

  async load(): Promise<void> {
    if (this.mermaid)
      return

    const cdnLoader = createMermaidCdnLoader({
      cdnOptions: this.options.cdnOptions,
    })

    const hasRuntime = cdnLoader.getCdnUrl() ? true : await hasBundledMermaidModule()
    if (!hasRuntime)
      throw new Error('Mermaid module is not available')

    const mermaidImport = await cdnLoader.loadCdn() ?? await import('mermaid')
    const module = mermaidImport.default

    module.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      ...(resolveGetter(this.options.config) ?? {}),
    })

    this.mermaid = module
  }

  isSupported(): boolean {
    return true
  }

  async parse(code: string): Promise<MermaidParseResult> {
    try {
      await this.ensureLoaded()
      await this.mermaid!.parse(this.wrapThemeCode(code))
      return { valid: true }
    }
    catch (error) {
      return { valid: false, error: this.toError(error) }
    }
  }

  async render(code: string): Promise<MermaidRenderResult> {
    const parseResult = await this.parse(code)
    if (!parseResult.valid || !isClient())
      return { error: parseResult.error, valid: false }

    const id = `mermaid-${randomStr()}`

    try {
      const result = await this.mermaid!.render(id, this.wrapThemeCode(code))
      return { svg: result.svg, valid: true }
    }
    catch (error) {
      document.getElementById(`d${id}`)?.remove()
      return { valid: false, error: this.toError(error) }
    }
  }

  async isEnabled(): Promise<boolean> {
    const cdnLoader = createMermaidCdnLoader({
      cdnOptions: this.options.cdnOptions,
    })

    try {
      if (await hasBundledMermaidModule())
        return true

      return !!cdnLoader.getCdnUrl()
    }
    catch {
      return false
    }
  }
}
