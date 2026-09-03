import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { Extensions } from '../types'
import { inject, provide } from 'vue'

export interface MarkdownProviderContext {
  cssVariables: Ref<Record<string, string>> | ComputedRef<Record<string, string>>
  extensions: ComputedRef<Extensions | undefined>
  isDark: ComputedRef<boolean>
}

const MARKDOWN_PROVIDER_KEY: InjectionKey<MarkdownProviderContext> = Symbol('markdown-provider')

export function provideMarkdownProvider(context: MarkdownProviderContext) {
  provide(MARKDOWN_PROVIDER_KEY, context)
}

export function useMarkdownProvider(): MarkdownProviderContext | undefined {
  return inject(MARKDOWN_PROVIDER_KEY, undefined)
}
