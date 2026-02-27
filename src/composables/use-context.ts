import type { MaybeRef } from 'vue'
import type { MarkdownParser } from '../markdown-parser'
import type {
  Icons,
  NodeRenderers,
  ParsedNode,
  StreamMarkdownContext,
  StreamMarkdownProps,
  SyntaxTree,
  UIComponents,
  UIOptions,
} from '../types'
import { computed, inject, provide, unref } from 'vue'
import { UI as DEFAULT_UI } from '../components'
import { CARETS } from '../constants'

const CONTEXT_KEY = Symbol('stream-markdown-context')

interface Context {
  controls?: MaybeRef<StreamMarkdownContext['controls']>
  previewers?: MaybeRef<StreamMarkdownContext['previewers']>
  shikiOptions?: MaybeRef<StreamMarkdownContext['shikiOptions']>
  mermaidOptions?: MaybeRef<StreamMarkdownContext['mermaidOptions']>
  katexOptions?: MaybeRef<StreamMarkdownContext['katexOptions']>
  hardenOptions?: MaybeRef<StreamMarkdownContext['hardenOptions']>
  codeOptions?: MaybeRef<StreamMarkdownContext['codeOptions']>
  imageOptions?: MaybeRef<StreamMarkdownContext['imageOptions']>
  linkOptions?: MaybeRef<StreamMarkdownContext['linkOptions']>
  cdnOptions?: MaybeRef<StreamMarkdownContext['cdnOptions']>
  mode?: MaybeRef<'static' | 'streaming'>
  isDark?: MaybeRef<boolean>
  uiOptions?: MaybeRef<UIOptions | undefined>
  nodeRenderers?: MaybeRef<NodeRenderers>
  icons?: MaybeRef<Icons>
  uiComponents?: MaybeRef<UIComponents>
  enableAnimate?: MaybeRef<boolean>
  enableCaret?: MaybeRef<boolean>
  caret?: MaybeRef<StreamMarkdownProps['caret']>
  parsedNodes?: MaybeRef<ParsedNode[]>
  blocks?: MaybeRef<SyntaxTree[]>
  markdownParser?: MarkdownParser
  getContainer?: () => HTMLElement | undefined
  beforeDownload?: StreamMarkdownProps['beforeDownload']
  onCopied?: (content: string) => void
}

export function useContext() {
  const context = injectContext()

  const mode = computed(() => unref(context.mode) ?? 'streaming')
  const controls = computed(() => unref(context.controls))
  const previewers = computed(() => unref(context.previewers))
  const shikiOptions = computed(() => unref(context.shikiOptions))
  const mermaidOptions = computed(() => unref(context.mermaidOptions))
  const katexOptions = computed(() => unref(context.katexOptions))
  const hardenOptions = computed(() => unref(context.hardenOptions))
  const codeOptions = computed(() => unref(context.codeOptions))
  const imageOptions = computed(() => unref(context.imageOptions))
  const linkOptions = computed(() => unref(context.linkOptions))
  const cdnOptions = computed(() => unref(context.cdnOptions))
  const icons = computed((): Partial<Icons> => unref(context.icons) ?? {})
  const nodeRenderers = computed((): NodeRenderers => unref(context.nodeRenderers) ?? {})

  const uiComponents = computed((): UIComponents => unref(context.uiComponents) ?? DEFAULT_UI)

  const uiOptions = computed(() => unref(context.uiOptions) ?? {})
  const hideTooltip = computed(() => uiOptions.value.hideTooltip ?? false)

  const isDark = computed(() => unref(context.isDark) ?? false)
  const enableAnimate = computed(() => {
    const enable = unref(context.enableAnimate)
    if (typeof enable === 'boolean')
      return enable
    return mode.value === 'streaming'
  })

  const enableCaret = computed(() => unref(context.enableCaret))
  const caret = computed(() => unref(context.caret)
    ? CARETS[unref(context.caret) as keyof typeof CARETS]
    : undefined)

  const parsedNodes = computed(() => unref(context.parsedNodes) ?? [])
  const blocks = computed(() => unref(context.blocks) ?? [])

  function provideContext(ctx: Partial<Context>) {
    const context = injectContext()
    provide(CONTEXT_KEY, { ...context, ...ctx })
  }

  function injectContext(): Context {
    const ctx = inject<Context>(CONTEXT_KEY, {})
    return ctx || {}
  }

  return {
    context,
    provideContext,
    injectContext,
    mode,
    controls,
    previewers,
    shikiOptions,
    mermaidOptions,
    katexOptions,
    hardenOptions,
    codeOptions,
    imageOptions,
    linkOptions,
    cdnOptions,
    hideTooltip,
    icons,
    nodeRenderers,
    uiComponents,
    isDark,
    enableAnimate,
    enableCaret,
    caret,
    parsedNodes,
    blocks,
    get markdownParser() {
      return context.markdownParser
    },
    get getContainer() {
      return context.getContainer || (() => undefined)
    },
    get beforeDownload() {
      return context.beforeDownload || (() => true)
    },
    get onCopied() {
      return context.onCopied || (() => {})
    },
  }
}
