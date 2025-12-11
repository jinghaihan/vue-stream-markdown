import type { Component, MaybeRef } from 'vue'
import type { IconName, ParsedNode } from '../types'
import { computed, inject, provide, unref } from 'vue'

const CONTEXT_KEY = Symbol('stream-markdown-context')

interface Context {
  isDark?: MaybeRef<boolean>
  icons?: MaybeRef<Record<IconName, Component>>
  parsedNodes?: MaybeRef<ParsedNode[]>
  getContainer?: () => HTMLElement | undefined
  onCopied?: (content: string) => void
}

export function useContext() {
  const context = injectContext()

  const icons = computed((): Record<string, Component> => unref(context.icons) ?? {})
  const isDark = computed(() => unref(context.isDark) ?? false)
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
    icons,
    isDark,
    parsedNodes,
    get getContainer() {
      return context.getContainer || (() => undefined)
    },
    get onCopied() {
      return context.onCopied || (() => {})
    },
  }
}
