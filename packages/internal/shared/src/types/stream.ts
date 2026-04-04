import type { MarkdownAstParserOptions } from '@markmend/ast'
import type { CdnOptions } from './cdn'
import type { MaybePromise } from './common'
import type { DownloadEvent } from './events'
import type { LocaleConfig } from './i18n'

export interface StreamMarkdownContext<
  TControls = unknown,
  TPreviewers = unknown,
  TShikiOptions = unknown,
  TMermaidOptions = unknown,
  TKatexOptions = unknown,
  THardenOptions = unknown,
  TCodeOptions = unknown,
  TImageOptions = unknown,
  TLinkOptions = unknown,
  TUIOptions = unknown,
> {
  controls?: TControls
  previewers?: TPreviewers
  shikiOptions?: TShikiOptions
  mermaidOptions?: TMermaidOptions
  katexOptions?: TKatexOptions
  hardenOptions?: THardenOptions
  codeOptions?: TCodeOptions
  imageOptions?: TImageOptions
  linkOptions?: TLinkOptions
  uiOptions?: TUIOptions
  cdnOptions?: CdnOptions
  isDark?: boolean
}

export interface StreamMarkdownHooks {
  beforeDownload?: (event: DownloadEvent) => MaybePromise<boolean>
}

export interface StreamMarkdownViewProps<
  TNodeRenderers = unknown,
  TIcons = unknown,
  TUIComponents = unknown,
  TPreload = unknown,
  TCaret extends string = string,
> {
  mode?: 'static' | 'streaming'
  content?: string
  nodeRenderers?: TNodeRenderers
  icons?: Partial<TIcons>
  components?: Partial<TUIComponents>
  preload?: TPreload
  locale?: string | LocaleConfig
  enableAnimate?: boolean
  caret?: TCaret
  themeElement?: () => HTMLElement | undefined
}

export type StreamMarkdownProps<
  TNodeRenderers = unknown,
  TIcons = unknown,
  TUIComponents = unknown,
  TPreload = unknown,
  TCaret extends string = string,
  TControls = unknown,
  TPreviewers = unknown,
  TShikiOptions = unknown,
  TMermaidOptions = unknown,
  TKatexOptions = unknown,
  THardenOptions = unknown,
  TCodeOptions = unknown,
  TImageOptions = unknown,
  TLinkOptions = unknown,
  TUIOptions = unknown,
> = StreamMarkdownContext<
  TControls,
  TPreviewers,
  TShikiOptions,
  TMermaidOptions,
  TKatexOptions,
  THardenOptions,
  TCodeOptions,
  TImageOptions,
  TLinkOptions,
  TUIOptions
>
& StreamMarkdownViewProps<TNodeRenderers, TIcons, TUIComponents, TPreload, TCaret>
& StreamMarkdownHooks
& MarkdownAstParserOptions
