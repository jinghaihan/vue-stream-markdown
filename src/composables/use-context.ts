import type { MaybeRef } from 'vue'
import type { Icons, ParsedNode, StreamMarkdownProps, UIOptions } from '../types'
import { computed, inject, provide, unref } from 'vue'

const CONTEXT_KEY = Symbol('stream-markdown-context')

interface Context {
  mode?: MaybeRef<'static' | 'streaming'>
  isDark?: MaybeRef<boolean>
  uiOptions?: MaybeRef<UIOptions | undefined>
  icons?: MaybeRef<Icons>
  enableAnimate?: MaybeRef<boolean | undefined>
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
  const enableAnimate = computed(() => unref(context.enableAnimate))

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
