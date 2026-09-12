import type {
  MaybeGetter,
  MermaidExtensionRenderResult,
  MermaidRenderInput,
  SharedCdnOptions,
} from '@stream-markdown/core'
import type { RenderOptions, ThemeName } from 'beautiful-mermaid'

export type { RenderOptions, ThemeName } from 'beautiful-mermaid'

export interface BeautifulMermaidRuntimeOptions {
  cdnOptions?: MaybeGetter<SharedCdnOptions | undefined>
  config?: MaybeGetter<RenderOptions | undefined>
  theme?: MaybeGetter<[ThemeName, ThemeName] | undefined>
}

export interface BeautifulMermaidRuntime {
  preload: () => Promise<void>
  load: () => Promise<typeof import('beautiful-mermaid')>
  dispose: () => void
  supports: (code: string) => boolean
  render: (input: MermaidRenderInput) => Promise<MermaidExtensionRenderResult>
}

export interface BeautifulMermaidExtensionOptions<TErrorComponent = never>
  extends BeautifulMermaidRuntimeOptions {
  errorComponent?: TErrorComponent
}
