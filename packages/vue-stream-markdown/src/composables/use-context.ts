import type {
  Icons,
  NodeRenderers,
  StreamMarkdownProvideContext,
  StreamMarkdownResolvedContext,
  UIComponents,
} from '../types'
import { CARETS, DEFAULT_ANIMATION } from '@stream-markdown/shared'
import { computed, inject, provide, toValue } from 'vue'
import { UI as DEFAULT_UI } from '../components'

const CONTEXT_KEY = Symbol('stream-markdown-context')

export function useContext(): StreamMarkdownResolvedContext {
  const context = injectContext()

  const mode = computed(() => toValue(context.mode) ?? 'streaming')
  const controls = computed(() => toValue(context.controls))
  const previewers = computed(() => toValue(context.previewers))
  const shikiOptions = computed(() => toValue(context.shikiOptions))
  const mermaidOptions = computed(() => toValue(context.mermaidOptions))
  const katexOptions = computed(() => toValue(context.katexOptions))
  const hardenOptions = computed(() => toValue(context.hardenOptions))
  const codeOptions = computed(() => toValue(context.codeOptions))
  const imageOptions = computed(() => toValue(context.imageOptions))
  const linkOptions = computed(() => toValue(context.linkOptions))
  const cdnOptions = computed(() => toValue(context.cdnOptions))
  const icons = computed((): Partial<Icons> => toValue(context.icons) ?? {})
  const nodeRenderers = computed((): NodeRenderers => toValue(context.nodeRenderers) ?? {})

  const uiComponents = computed((): UIComponents => toValue(context.uiComponents) ?? DEFAULT_UI)

  const uiOptions = computed(() => toValue(context.uiOptions) ?? {})
  const hideTooltip = computed(() => uiOptions.value.hideTooltip ?? false)

  const isDark = computed(() => toValue(context.isDark) ?? false)
  const enableAnimate = computed(() => {
    const enable = toValue(context.enableAnimate)
    if (typeof enable === 'boolean')
      return enable
    return mode.value === 'streaming'
  })
  const animation = computed(() => toValue(context.animation) ?? DEFAULT_ANIMATION)

  const enableCaret = computed(() => toValue(context.enableCaret))
  const caret = computed(() => {
    const currentCaret = toValue(context.caret)
    return currentCaret
      ? CARETS[currentCaret]
      : undefined
  })

  const parsedNodes = computed(() => toValue(context.parsedNodes) ?? [])
  const blocks = computed(() => toValue(context.blocks) ?? [])

  function provideContext(ctx: Partial<StreamMarkdownProvideContext>) {
    const context = injectContext()
    provide(CONTEXT_KEY, { ...context, ...ctx })
  }

  function injectContext(): StreamMarkdownProvideContext {
    const ctx = inject<StreamMarkdownProvideContext>(CONTEXT_KEY, {})
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
    animation,
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
