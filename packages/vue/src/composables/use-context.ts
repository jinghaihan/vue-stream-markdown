import type {
  Icons,
  StreamMarkdownProvideContext,
  StreamMarkdownResolvedContext,
  UIComponents,
} from '../types'
import {
  resolveAnimation,
  resolveAnimationSplit,
  resolveCaret,
  resolveEnableAnimate,
} from '@stream-markdown/core'
import { computed, inject, provide, toValue } from 'vue'
import { UI as DEFAULT_UI } from '../components'
import { ICONS as DEFAULT_ICONS } from '../components/icons'

const CONTEXT_KEY = Symbol('stream-markdown-context')
const resolvedContextCache = new WeakMap<StreamMarkdownProvideContext, StreamMarkdownResolvedContext>()

export function useContext(): StreamMarkdownResolvedContext {
  return resolveContext(injectContext())
}

function injectContext(): StreamMarkdownProvideContext {
  const context = inject<StreamMarkdownProvideContext>(CONTEXT_KEY, {})
  return context || {}
}

function resolveContext(context: StreamMarkdownProvideContext): StreamMarkdownResolvedContext {
  const cached = resolvedContextCache.get(context)
  if (cached)
    return cached

  const mode = computed(() => toValue(context.mode) ?? 'streaming')
  const dir = computed(() => toValue(context.dir))
  const controls = computed(() => toValue(context.controls))
  const previewers = computed(() => toValue(context.previewers))
  const extensions = computed(() => toValue(context.extensions))
  const hardenOptions = computed(() => toValue(context.hardenOptions))
  const codeOptions = computed(() => toValue(context.codeOptions))
  const tableOptions = computed(() => toValue(context.tableOptions))
  const imageOptions = computed(() => toValue(context.imageOptions))
  const linkOptions = computed(() => toValue(context.linkOptions))
  const icons = computed((): Partial<Icons> => toValue(context.icons) ?? DEFAULT_ICONS)
  const uiComponents = computed((): UIComponents => toValue(context.uiComponents) ?? DEFAULT_UI)

  const uiOptions = computed(() => toValue(context.uiOptions) ?? {})
  const hideTooltip = computed(() => uiOptions.value.hideTooltip ?? false)

  const isDark = computed(() => toValue(context.isDark) ?? false)
  const enableAnimate = computed(() => resolveEnableAnimate(mode.value, toValue(context.enableAnimate)))
  const animation = computed(() => resolveAnimation(toValue(context.animation)))
  const animationSplit = computed(() => resolveAnimationSplit(toValue(context.animationSplit)))

  const enableCaret = computed(() => toValue(context.enableCaret))
  const caret = computed(() => resolveCaret(toValue(context.caret)))

  const documentNodes = computed(() => toValue(context.documentNodes) ?? [])

  function provideContext(overrides: Partial<StreamMarkdownProvideContext>) {
    const providedContext = { ...context, ...overrides }
    resolveContext(providedContext)
    provide(CONTEXT_KEY, providedContext)
  }

  const resolvedContext: StreamMarkdownResolvedContext = {
    context,
    provideContext,
    injectContext,
    mode,
    dir,
    controls,
    previewers,
    extensions,
    hardenOptions,
    codeOptions,
    tableOptions,
    imageOptions,
    linkOptions,
    hideTooltip,
    icons,
    uiComponents,
    isDark,
    enableAnimate,
    animation,
    animationSplit,
    enableCaret,
    caret,
    documentNodes,
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

  resolvedContextCache.set(context, resolvedContext)
  return resolvedContext
}
