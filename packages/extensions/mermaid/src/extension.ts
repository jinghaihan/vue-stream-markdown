import type { MermaidExtension } from '@stream-markdown/core'
import type { MermaidRuntimeOptions } from './types'
import { createMermaidRuntime } from './runtime'

export interface MermaidExtensionOptions<TErrorComponent = unknown>
  extends Omit<MermaidRuntimeOptions, 'isDark'> {
  errorComponent?: TErrorComponent
}

export function mermaid<TErrorComponent = unknown>(
  options: MermaidExtensionOptions<TErrorComponent> = {},
): MermaidExtension<TErrorComponent> {
  let isDark = false
  const runtime = createMermaidRuntime({
    ...options,
    isDark: () => isDark,
  })

  return {
    errorComponent: options.errorComponent,
    preload: runtime.preload,
    dispose: runtime.dispose,
    supports: () => true,
    async render(input) {
      isDark = input.isDark
      return await runtime.render(input.code)
    },
  }
}
