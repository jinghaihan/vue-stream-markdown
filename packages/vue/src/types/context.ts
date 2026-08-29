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
  Extensions,
  HardenOptions,
  Icons,
  ImageOptions,
  LinkOptions,
  MermaidOptions,
  PreviewerConfig,
  ShikiOptions,
  TableOptions,
  UIComponents,
  UIOptions,
} from './shared'

export type { StreamMarkdownHooks } from '@stream-markdown/core'

export type StreamMarkdownContext = CoreStreamMarkdownContext<
  ControlsConfig,
  PreviewerConfig,
  ShikiOptions,
  MermaidOptions,
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
  ShikiOptions,
  MermaidOptions,
  HardenOptions,
  CodeOptions,
  ImageOptions,
  LinkOptions,
  UIOptions,
  Extensions
>

export type StreamMarkdownProps = BaseStreamMarkdownProps & {
  completion?: Completion
  parserOptions?: StreamMarkdownParserOptions
}

export interface StreamMarkdownProvideContext {
  controls?: MaybeRefOrGetter<StreamMarkdownContext['controls']>
  previewers?: MaybeRefOrGetter<StreamMarkdownContext['previewers']>
  shikiOptions?: MaybeRefOrGetter<StreamMarkdownContext['shikiOptions']>
  mermaidOptions?: MaybeRefOrGetter<StreamMarkdownContext['mermaidOptions']>
  extensions?: MaybeRefOrGetter<Extensions | undefined>
  hardenOptions?: MaybeRefOrGetter<StreamMarkdownContext['hardenOptions']>
  codeOptions?: MaybeRefOrGetter<StreamMarkdownContext['codeOptions']>
  tableOptions?: MaybeRefOrGetter<TableOptions | undefined>
  imageOptions?: MaybeRefOrGetter<StreamMarkdownContext['imageOptions']>
  linkOptions?: MaybeRefOrGetter<StreamMarkdownContext['linkOptions']>
  cdnOptions?: MaybeRefOrGetter<StreamMarkdownContext['cdnOptions']>
  mode?: MaybeRefOrGetter<'static' | 'streaming'>
  dir?: MaybeRefOrGetter<StreamMarkdownProps['dir']>
  isDark?: MaybeRefOrGetter<boolean>
  uiOptions?: MaybeRefOrGetter<UIOptions | undefined>
  icons?: MaybeRefOrGetter<Icons>
  uiComponents?: MaybeRefOrGetter<UIComponents>
  enableAnimate?: MaybeRefOrGetter<boolean>
  animation?: MaybeRefOrGetter<StreamMarkdownProps['animation']>
  animationSplit?: MaybeRefOrGetter<StreamMarkdownProps['animationSplit']>
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
  shikiOptions: ComputedRef<StreamMarkdownContext['shikiOptions']>
  mermaidOptions: ComputedRef<StreamMarkdownContext['mermaidOptions']>
  extensions: ComputedRef<Extensions | undefined>
  hardenOptions: ComputedRef<StreamMarkdownContext['hardenOptions']>
  codeOptions: ComputedRef<StreamMarkdownContext['codeOptions']>
  tableOptions: ComputedRef<TableOptions | undefined>
  imageOptions: ComputedRef<StreamMarkdownContext['imageOptions']>
  linkOptions: ComputedRef<StreamMarkdownContext['linkOptions']>
  cdnOptions: ComputedRef<StreamMarkdownContext['cdnOptions']>
  hideTooltip: ComputedRef<boolean>
  icons: ComputedRef<Partial<Icons>>
  uiComponents: ComputedRef<UIComponents>
  isDark: ComputedRef<boolean>
  enableAnimate: ComputedRef<boolean>
  animation: ComputedRef<NonNullable<StreamMarkdownProps['animation']>>
  animationSplit: ComputedRef<NonNullable<StreamMarkdownProps['animationSplit']>>
  enableCaret: ComputedRef<boolean | undefined>
  caret: ComputedRef<string | undefined>
  documentNodes: ComputedRef<MarkdownNode[]>
  readonly getContainer: () => HTMLElement | undefined
  readonly beforeDownload: NonNullable<StreamMarkdownProps['beforeDownload']>
  readonly onCopied: (content: string) => void
}
