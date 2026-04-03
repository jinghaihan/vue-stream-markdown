import type { MaybeGetter, SharedCdnOptions } from '@stream-markdown/shared'
import type { RenderOptions as BeautifulMermaidConfig, ThemeName } from 'beautiful-mermaid'
import type { MermaidConfig } from 'mermaid'

export type { MaybeGetter }

export type MermaidRendererType = 'beautiful' | 'vanilla'

export interface MermaidRenderResult {
  svg?: string
  error?: string
  valid: boolean
}

export interface MermaidParseResult {
  valid: boolean
  error?: string
}

export interface MermaidRuntimeOptions {
  renderer?: MaybeGetter<MermaidRendererType | undefined>
  theme?: MaybeGetter<[string, string] | undefined>
  beautifulTheme?: MaybeGetter<[ThemeName, ThemeName] | undefined>
  config?: MaybeGetter<MermaidConfig | undefined>
  beautifulConfig?: MaybeGetter<BeautifulMermaidConfig | undefined>
  cdnOptions?: MaybeGetter<SharedCdnOptions | undefined>
  isDark?: MaybeGetter<boolean | undefined>
  getThemeColors?: () => Promise<Record<string, string> | null>
}

export interface MermaidRuntime {
  installed: Promise<boolean>
  preload: () => Promise<void>
  load: () => Promise<void>
  dispose: () => void
  parse: (code: string) => Promise<MermaidParseResult>
  render: (code: string) => Promise<MermaidRenderResult>
  save: (format: 'svg' | 'png', code: string) => Promise<void>
}
