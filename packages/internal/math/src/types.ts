import type { MaybeGetter, SharedCdnOptions } from '@stream-markdown/shared'
import type { KatexOptions } from 'katex'

export type { MaybeGetter }

export interface MathRuntimeOptions {
  cdnOptions?: MaybeGetter<SharedCdnOptions | undefined>
}

export interface RenderMathOptions {
  displayMode?: boolean
  config?: KatexOptions
}

export interface KatexRuntime {
  installed: Promise<boolean>
  preload: () => Promise<void>
  dispose: () => void
  ensureCss: () => void
  getKatex: () => Promise<typeof import('katex')>
  renderToHtml: (code: string, options?: RenderMathOptions) => Promise<{
    html?: string
    error?: string
  }>
}
