import type {
  CaretType,
  StreamMarkdownContext as CoreStreamMarkdownContext,
  StreamMarkdownProps as CoreStreamMarkdownProps,
} from '@stream-markdown/core'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { MarkdownComponents, MarkdownNode } from './comark'
import type { Completion, StreamMarkdownParserOptions } from './parser'
import type {
  CodeOptions,
  ControlsConfig,
  ExtensionOverrides,
  Extensions,
  HardenOptions,
  Icons,
  ImageOptions,
  LinkOptions,
  PreviewerConfig,
  TableOptions,
  UIComponents,
  UIOptions,
} from './shared'

export type { StreamMarkdownHooks } from '@stream-markdown/core'

export type StreamMarkdownContext = CoreStreamMarkdownContext<
  ControlsConfig,
  PreviewerConfig,
  HardenOptions,
  CodeOptions,
  ImageOptions,
  LinkOptions,
  UIOptions,
  Extensions
>

type BaseStreamMarkdownProps = CoreStreamMarkdownProps<
  MarkdownComponents,
  Icons,
  UIComponents,
  CaretType,
  ControlsConfig,
  PreviewerConfig,
  HardenOptions,
  CodeOptions,
  ImageOptions,
  LinkOptions,
  UIOptions,
  ExtensionOverrides
>

export type StreamMarkdownProps = BaseStreamMarkdownProps & {
  completion?: Completion
  literalTagContent?: string[]
  parserOptions?: StreamMarkdownParserOptions
}

export interface MarkdownProviderProps {
  extensions?: Extensions
  isDark?: boolean
  themeElement?: () => HTMLElement | undefined
}

export interface StreamMarkdownProvideContext {
  controls?: MaybeRefOrGetter<StreamMarkdownContext['controls']>
  previewers?: MaybeRefOrGetter<StreamMarkdownContext['previewers']>
  extensions?: MaybeRefOrGetter<Extensions | undefined>
  hardenOptions?: MaybeRefOrGetter<StreamMarkdownContext['hardenOptions']>
  codeOptions?: MaybeRefOrGetter<StreamMarkdownContext['codeOptions']>
  tableOptions?: MaybeRefOrGetter<TableOptions | undefined>
  imageOptions?: MaybeRefOrGetter<StreamMarkdownContext['imageOptions']>
  linkOptions?: MaybeRefOrGetter<StreamMarkdownContext['linkOptions']>
  mode?: MaybeRefOrGetter<'static' | 'streaming'>
  dir?: MaybeRefOrGetter<StreamMarkdownProps['dir']>
  isDark?: MaybeRefOrGetter<boolean>
  rootStyle?: MaybeRefOrGetter<Record<string, string>>
  uiOptions?: MaybeRefOrGetter<UIOptions | undefined>
  icons?: MaybeRefOrGetter<Icons>
  uiComponents?: MaybeRefOrGetter<UIComponents>
  enableAnimate?: MaybeRefOrGetter<boolean>
  animation?: MaybeRefOrGetter<StreamMarkdownProps['animation']>
  animationSplit?: MaybeRefOrGetter<StreamMarkdownProps['animationSplit']>
  animationStagger?: MaybeRefOrGetter<StreamMarkdownProps['animationStagger']>
  enableCaret?: MaybeRefOrGetter<boolean>
  caret?: MaybeRefOrGetter<StreamMarkdownProps['caret']>
  documentNodes?: MaybeRefOrGetter<MarkdownNode[]>
  getContainer?: () => HTMLElement | undefined
  beforeDownload?: StreamMarkdownProps['beforeDownload']
  onCopied?: (content: string) => void
}

export interface StreamMarkdownResolvedContext {
  context: StreamMarkdownProvideContext
  provideContext: (ctx: Partial<StreamMarkdownProvideContext>) => void
  injectContext: () => StreamMarkdownProvideContext
  mode: ComputedRef<'static' | 'streaming'>
  dir: ComputedRef<StreamMarkdownProps['dir']>
  controls: ComputedRef<StreamMarkdownContext['controls']>
  previewers: ComputedRef<StreamMarkdownContext['previewers']>
  extensions: ComputedRef<Extensions | undefined>
  hardenOptions: ComputedRef<StreamMarkdownContext['hardenOptions']>
  codeOptions: ComputedRef<StreamMarkdownContext['codeOptions']>
  tableOptions: ComputedRef<TableOptions | undefined>
  imageOptions: ComputedRef<StreamMarkdownContext['imageOptions']>
  linkOptions: ComputedRef<StreamMarkdownContext['linkOptions']>
  hideTooltip: ComputedRef<boolean>
  icons: ComputedRef<Partial<Icons>>
  uiComponents: ComputedRef<UIComponents>
  isDark: ComputedRef<boolean>
  rootStyle: ComputedRef<Record<string, string>>
  enableAnimate: ComputedRef<boolean>
  animation: ComputedRef<NonNullable<StreamMarkdownProps['animation']>>
  animationSplit: ComputedRef<NonNullable<StreamMarkdownProps['animationSplit']>>
  animationStagger: ComputedRef<number>
  enableCaret: ComputedRef<boolean | undefined>
  caret: ComputedRef<string | undefined>
  documentNodes: ComputedRef<MarkdownNode[]>
  readonly getContainer: () => HTMLElement | undefined
  readonly beforeDownload: NonNullable<StreamMarkdownProps['beforeDownload']>
  readonly onCopied: (content: string) => void
}
