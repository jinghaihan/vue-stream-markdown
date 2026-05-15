import type { MermaidParseResult, MermaidRenderResult, MermaidRuntimeOptions } from '../types'

export abstract class MermaidRenderer {
  protected options: MermaidRuntimeOptions
  public loaded = false

  constructor(options: MermaidRuntimeOptions = {}) {
    this.options = options
  }

  abstract load(): Promise<void>
  abstract isSupported(diagramType: string): boolean
  abstract render(code: string): Promise<MermaidRenderResult>
  abstract parse(code: string): Promise<MermaidParseResult>
  abstract isEnabled(): Promise<boolean>

  isLoaded(): boolean {
    return this.loaded
  }

  protected async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      await this.load()
      this.loaded = true
    }
  }

  protected toError(error: unknown): string {
    return error instanceof Error ? error.message : String(error)
  }
}
