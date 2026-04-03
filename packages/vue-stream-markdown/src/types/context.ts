import type {
  CaretType,
  StreamMarkdownContext as SharedStreamMarkdownContext,
  StreamMarkdownHooks as SharedStreamMarkdownHooks,
  StreamMarkdownProps as SharedStreamMarkdownProps,
} from '@stream-markdown/shared'
import type { PreprocessContext } from 'markmend'
import type {
  FromMarkdownExtension,
  MarkdownAstParser,
  MarkdownAstParserOptions,
  MarkdownParserOptions,
  MdastOptions,
  MicromarkExtension,
  ToMarkdownExtension,
} from 'markmend-ast'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { NodeRenderers, ParsedNode, SyntaxTree } from './core'
import type {
  CodeOptions,
  ControlsConfig,
  HardenOptions,
  Icons,
  ImageOptions,
  KatexOptions,
  LinkOptions,
  MermaidOptions,
  PreloadConfig,
  PreviewerConfig,
  ShikiOptions,
  UIComponents,
  UIOptions,
} from './shared'

export type StreamMarkdownContext = SharedStreamMarkdownContext<
  ControlsConfig,
  PreviewerConfig,
  ShikiOptions,
  MermaidOptions,
  KatexOptions,
  HardenOptions,
  CodeOptions,
  ImageOptions,
  LinkOptions,
  UIOptions
>

export type StreamMarkdownHooks = SharedStreamMarkdownHooks

export type StreamMarkdownProps = SharedStreamMarkdownProps<
  NodeRenderers,
  Icons,
  UIComponents,
  PreloadConfig,
  CaretType,
  ControlsConfig,
  PreviewerConfig,
  ShikiOptions,
  MermaidOptions,
  KatexOptions,
  HardenOptions,
  CodeOptions,
  ImageOptions,
  LinkOptions,
  UIOptions
>

export interface StreamMarkdownProvideContext {
  controls?: MaybeRefOrGetter<StreamMarkdownContext['controls']>
  previewers?: MaybeRefOrGetter<StreamMarkdownContext['previewers']>
  shikiOptions?: MaybeRefOrGetter<StreamMarkdownContext['shikiOptions']>
  mermaidOptions?: MaybeRefOrGetter<StreamMarkdownContext['mermaidOptions']>
  katexOptions?: MaybeRefOrGetter<StreamMarkdownContext['katexOptions']>
  hardenOptions?: MaybeRefOrGetter<StreamMarkdownContext['hardenOptions']>
  codeOptions?: MaybeRefOrGetter<StreamMarkdownContext['codeOptions']>
  imageOptions?: MaybeRefOrGetter<StreamMarkdownContext['imageOptions']>
  linkOptions?: MaybeRefOrGetter<StreamMarkdownContext['linkOptions']>
  cdnOptions?: MaybeRefOrGetter<StreamMarkdownContext['cdnOptions']>
  mode?: MaybeRefOrGetter<'static' | 'streaming'>
  isDark?: MaybeRefOrGetter<boolean>
  uiOptions?: MaybeRefOrGetter<UIOptions | undefined>
  nodeRenderers?: MaybeRefOrGetter<NodeRenderers>
  icons?: MaybeRefOrGetter<Icons>
  uiComponents?: MaybeRefOrGetter<UIComponents>
  enableAnimate?: MaybeRefOrGetter<boolean>
  enableCaret?: MaybeRefOrGetter<boolean>
  caret?: MaybeRefOrGetter<StreamMarkdownProps['caret']>
  parsedNodes?: MaybeRefOrGetter<ParsedNode[]>
  blocks?: MaybeRefOrGetter<SyntaxTree[]>
  markdownParser?: MarkdownAstParser
  getContainer?: () => HTMLElement | undefined
  beforeDownload?: StreamMarkdownProps['beforeDownload']
  onCopied?: (content: string) => void
}

export interface StreamMarkdownResolvedContext {
  context: StreamMarkdownProvideContext
  provideContext: (ctx: Partial<StreamMarkdownProvideContext>) => void
  injectContext: () => StreamMarkdownProvideContext
  mode: ComputedRef<'static' | 'streaming'>
  controls: ComputedRef<StreamMarkdownContext['controls']>
  previewers: ComputedRef<StreamMarkdownContext['previewers']>
  shikiOptions: ComputedRef<StreamMarkdownContext['shikiOptions']>
  mermaidOptions: ComputedRef<StreamMarkdownContext['mermaidOptions']>
  katexOptions: ComputedRef<StreamMarkdownContext['katexOptions']>
  hardenOptions: ComputedRef<StreamMarkdownContext['hardenOptions']>
  codeOptions: ComputedRef<StreamMarkdownContext['codeOptions']>
  imageOptions: ComputedRef<StreamMarkdownContext['imageOptions']>
  linkOptions: ComputedRef<StreamMarkdownContext['linkOptions']>
  cdnOptions: ComputedRef<StreamMarkdownContext['cdnOptions']>
  hideTooltip: ComputedRef<boolean>
  icons: ComputedRef<Partial<Icons>>
  nodeRenderers: ComputedRef<NodeRenderers>
  uiComponents: ComputedRef<UIComponents>
  isDark: ComputedRef<boolean>
  enableAnimate: ComputedRef<boolean>
  enableCaret: ComputedRef<boolean | undefined>
  caret: ComputedRef<string | undefined>
  parsedNodes: ComputedRef<ParsedNode[]>
  blocks: ComputedRef<SyntaxTree[]>
  readonly markdownParser: MarkdownAstParser | undefined
  readonly getContainer: () => HTMLElement | undefined
  readonly beforeDownload: NonNullable<StreamMarkdownProps['beforeDownload']>
  readonly onCopied: (content: string) => void
}

export {
  type FromMarkdownExtension,
  type MarkdownAstParser,
  type MarkdownAstParserOptions,
  type MarkdownParserOptions,
  type MdastOptions,
  type MicromarkExtension,
  type ParsedNode,
  type PreprocessContext,
  type SyntaxTree,
  type ToMarkdownExtension,
}
