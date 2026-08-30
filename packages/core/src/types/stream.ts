import type { AnimationSplit, AnimationType } from '../types'
import type { MaybePromise, TextDirectionConfig } from './common'
import type { DownloadEvent } from './events'
import type { LocaleConfig } from './i18n'
import type { TableOptions } from './options'

export interface StreamMarkdownContext<
  TControls = unknown,
  TPreviewers = unknown,
  THardenOptions = unknown,
  TCodeOptions = unknown,
  TImageOptions = unknown,
  TLinkOptions = unknown,
  TUIOptions = unknown,
  TExtensions = unknown,
> {
  controls?: TControls
  previewers?: TPreviewers
  hardenOptions?: THardenOptions
  codeOptions?: TCodeOptions
  tableOptions?: TableOptions
  imageOptions?: TImageOptions
  linkOptions?: TLinkOptions
  uiOptions?: TUIOptions
  extensions?: TExtensions
  isDark?: boolean
}

export interface StreamMarkdownHooks {
  beforeDownload?: (event: DownloadEvent) => MaybePromise<boolean>
}

export interface StreamMarkdownViewProps<
  TMarkdownComponents = unknown,
  TIcons = unknown,
  TUIComponents = unknown,
  TCaret extends string = string,
> {
  mode?: 'static' | 'streaming'
  /** Force one text direction or detect it independently for each semantic block. */
  dir?: TextDirectionConfig
  content?: string
  components?: TMarkdownComponents
  icons?: Partial<TIcons>
  uiComponents?: Partial<TUIComponents>
  locale?: string | LocaleConfig
  enableAnimate?: boolean
  animation?: AnimationType
  animationSplit?: AnimationSplit
  animationDuration?: number | string
  animationStagger?: number
  caret?: TCaret
  themeElement?: () => HTMLElement | undefined
}

export type StreamMarkdownProps<
  TMarkdownComponents = unknown,
  TIcons = unknown,
  TUIComponents = unknown,
  TCaret extends string = string,
  TControls = unknown,
  TPreviewers = unknown,
  THardenOptions = unknown,
  TCodeOptions = unknown,
  TImageOptions = unknown,
  TLinkOptions = unknown,
  TUIOptions = unknown,
  TExtensions = unknown,
> = StreamMarkdownContext<
  TControls,
  TPreviewers,
  THardenOptions,
  TCodeOptions,
  TImageOptions,
  TLinkOptions,
  TUIOptions,
  TExtensions
>
& StreamMarkdownViewProps<TMarkdownComponents, TIcons, TUIComponents, TCaret>
& StreamMarkdownHooks
