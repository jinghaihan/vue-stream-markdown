import type { Mermaid } from 'mermaid'
import type { MaybeRef } from 'vue'
import type { CdnOptions, MermaidOptions } from '../../types'
import type { MermaidParseResult, MermaidRenderResult } from './types'
import { randomStr } from '@antfu/utils'
import { unref } from 'vue'
import { DEFAULT_MERMAID_THEME } from '../../constants/mermaid'
import { hasMermaidModule, isClient } from '../../utils'
import { useCdnLoader } from '../use-cdn-loader'
import { MermaidRenderer } from './types'

export class VanillaMermaidRenderer extends MermaidRenderer {
  private cdnOptions?: CdnOptions
  private isDarkRef: MaybeRef<boolean>
  private mermaid: Mermaid | null = null

  constructor(
    options: MermaidOptions,
    cdnOptions?: CdnOptions,
    isDark?: MaybeRef<boolean>,
  ) {
    super(options)
    this.cdnOptions = cdnOptions
    this.isDarkRef = isDark ?? false
  }

  private get currentTheme(): string {
    const isDark = unref(this.isDarkRef)
    const [light, dark] = this.options.theme ?? DEFAULT_MERMAID_THEME
    return isDark ? dark : light
  }

  private wrapThemeCode(code: string): string {
    if (code.startsWith('%%{'))
      return code
    return `%%{init: {"theme": "${this.currentTheme}"}}%%\n${code}`
  }

  private cleanupErrorElement(id: string): void {
    const element = document.getElementById(`d${id}`)
    element?.remove()
  }

  async load(): Promise<void> {
    if (this.mermaid)
      return

    const { getCdnMermaidUrl, loadCdnMermaid } = useCdnLoader({
      cdnOptions: this.cdnOptions,
    })

    const hasCdn = getCdnMermaidUrl() ? true : await hasMermaidModule()
    if (!hasCdn)
      throw new Error('Mermaid module is not available')

    const { default: module } = await loadCdnMermaid() ?? await import('mermaid')

    module.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      ...this.options.config,
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
      this.cleanupErrorElement(id)
      return { valid: false, error: this.toError(error) }
    }
  }
}
