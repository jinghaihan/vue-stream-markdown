import type { MaybeGetter, SharedCdnOptions } from '@stream-markdown/core'
import type { RenderOptions, ThemeName } from 'beautiful-mermaid'

export type { RenderOptions, ThemeName } from 'beautiful-mermaid'

export interface BeautifulMermaidExtensionOptions<TErrorComponent = unknown> {
  cdnOptions?: MaybeGetter<SharedCdnOptions | undefined>
  config?: MaybeGetter<RenderOptions | undefined>
  errorComponent?: TErrorComponent
  theme?: MaybeGetter<[ThemeName, ThemeName] | undefined>
}
