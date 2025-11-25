import type { MaybeRef } from 'vue'
import { computed, inject, provide, unref } from 'vue'

const CONTEXT_KEY = Symbol('stream-markdown-context')

interface Context {
  isDark?: MaybeRef<boolean>
  getContainer?: () => HTMLElement | undefined
  onCopied?: (content: string) => void
}

export function useContext() {
  const context = injectContext()

  const isDark = computed(() => unref(context.isDark) ?? false)

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
    isDark,
    get getContainer() {
      return context.getContainer || (() => undefined)
    },
    get onCopied() {
      return context.onCopied || (() => {})
    },
  }
}
