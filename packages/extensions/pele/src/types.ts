import type { MaybeGetter, SharedCdnOptions } from '@stream-markdown/core'

export interface PeleExtensionOptions<TErrorComponent = never> {
  cdnOptions?: MaybeGetter<SharedCdnOptions | undefined>
  /** Override the diagram palette with hex colors. */
  colors?: MaybeGetter<PeleColors | undefined>
  errorComponent?: TErrorComponent
}

export interface PeleColors {
  'bg'?: string
  'fg'?: string
  'line'?: string
  'accent'?: string
  'muted'?: string
  'surface'?: string
  'surface-alt'?: string
  'border'?: string
}

export interface ShikiThemeLike {
  bg?: unknown
  fg?: unknown
  colors?: unknown
  tokenColors?: unknown
  settings?: unknown
}
