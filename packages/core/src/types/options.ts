import type { MaybePromise } from './common'

export type PreviewSegmentedPlacement = 'left' | 'center' | 'right' | 'auto'

export interface HtmlPreviewerOptions {
  autoHeight?: boolean
  height?: number | string
  maxHeight?: number | string
  sandbox?: string
}

export type PreviewerConfig<TComponent = unknown>
  = | boolean
    | {
      placement?: PreviewSegmentedPlacement
      progressive?: Record<string, boolean>
      html?: HtmlPreviewerOptions
      components?: {
        mermaid?: boolean | TComponent
        html?: boolean | TComponent
      } & Record<string, TComponent>
    }

export interface ImageOptions<TComponent = unknown> {
  fallback?: string
  caption?: boolean
  referrerPolicy?: ReferrerPolicy
  errorComponent?: TComponent
}

export type LinkFaviconResolver = (url: string) => MaybePromise<string | undefined>

export interface LinkOptions {
  favicon?: boolean | LinkFaviconResolver
  safetyCheck?: boolean
  isTrusted?: (url: string) => Promise<boolean> | boolean
}

export interface CodeOptions<TComponent = unknown> {
  languageIcon?: boolean
  languageName?: boolean
  lineNumbers?: boolean
  maxHeight?: number | string
  language?: Record<string, CodeOptionsLanguage<TComponent>>
}

export interface CodeOptionsLanguage<TComponent = unknown> extends Omit<CodeOptions<TComponent>, 'languageIcon'> {
  languageIcon?: boolean | TComponent
}

export interface TableOptions {
  maxHeight?: number | string
}

export interface HardenOptions<TComponent = unknown> {
  defaultOrigin?: string
  allowedLinkPrefixes?: string[]
  allowedImagePrefixes?: string[]
  allowedProtocols?: string[]
  allowDataImages?: boolean
  errorComponent?: TComponent
}

export interface UIOptions {
  hideTooltip?: boolean
}
