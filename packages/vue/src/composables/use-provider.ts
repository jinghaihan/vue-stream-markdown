import type { ExtensionRuntime } from '@stream-markdown/core'
import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { ExtensionOverrides, Extensions } from '../types'
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

export function resolveExtensions(
  inherited: Extensions | undefined,
  overrides: ExtensionOverrides | undefined,
): Extensions | undefined {
  const resolved = { ...inherited } as Record<string, unknown>

  for (const [name, extension] of Object.entries(overrides ?? {})) {
    if (extension === false || extension === undefined)
      delete resolved[name]
    else
      resolved[name] = extension
  }

  return Object.keys(resolved).length > 0 ? resolved as Extensions : undefined
}

export function resolveOwnedExtensions(
  inherited: Extensions | undefined,
  overrides: ExtensionOverrides | undefined,
): ExtensionRuntime[] {
  return Object.entries(overrides ?? {}).flatMap(([name, extension]) => {
    if (!extension || extension === inherited?.[name as keyof Extensions])
      return []
    return [extension]
  })
}
