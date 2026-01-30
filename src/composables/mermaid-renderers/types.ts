import type { MaybeRef } from 'vue'
import type { MermaidOptions } from '../../types'

export interface MermaidRenderResult {
  svg?: string
  error?: string
  valid: boolean
}

export interface MermaidParseResult {
  valid: boolean
  error?: string
}

export abstract class MermaidRenderer {
  protected options: MaybeRef<MermaidOptions | undefined>
  public loaded = false

  constructor(options: MaybeRef<MermaidOptions | undefined>) {
    this.options = options
  }

  abstract load(): Promise<void>
  abstract isSupported(diagramType: string): boolean
  abstract render(code: string): Promise<MermaidRenderResult>
  abstract parse(code: string): Promise<MermaidParseResult>

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
