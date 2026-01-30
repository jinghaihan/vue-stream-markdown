import type { MaybeRef } from 'vue'
import type { Icons, ParsedNode, StreamMarkdownProps, UIOptions } from '../types'
import { computed, inject, provide, unref } from 'vue'
import { CARETS } from '../constants'

const CONTEXT_KEY = Symbol('stream-markdown-context')

interface Context {
  mode?: MaybeRef<'static' | 'streaming'>
  isDark?: MaybeRef<boolean>
  uiOptions?: MaybeRef<UIOptions | undefined>
  icons?: MaybeRef<Icons>
  enableAnimate?: MaybeRef<boolean>
  enableCaret?: MaybeRef<boolean>
  caret?: MaybeRef<StreamMarkdownProps['caret']>
  parsedNodes?: MaybeRef<ParsedNode[]>
  getContainer?: () => HTMLElement | undefined
  beforeDownload?: StreamMarkdownProps['beforeDownload']
  onCopied?: (content: string) => void
}

export function useContext() {
  const context = injectContext()

  const mode = computed(() => unref(context.mode) ?? 'streaming')
  const icons = computed((): Partial<Icons> => unref(context.icons) ?? {})

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
  const caret = computed(() => CARETS[unref(context.caret) ?? 'block'])

  const parsedNodes = computed(() => unref(context.parsedNodes) ?? [])

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
    hideTooltip,
    icons,
    isDark,
    enableAnimate,
    enableCaret,
    caret,
    parsedNodes,
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
