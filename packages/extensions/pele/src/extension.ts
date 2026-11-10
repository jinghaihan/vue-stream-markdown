import type { MermaidExtension } from '@stream-markdown/core'
import type { PeleExtensionOptions } from './types'
import { createPeleRuntime } from './runtime'

export function pele<TErrorComponent = never>(
  options: PeleExtensionOptions<TErrorComponent> = {},
): MermaidExtension<TErrorComponent> {
  const runtime = createPeleRuntime(options)

  return {
    errorComponent: options.errorComponent,
    preload: runtime.preload,
    dispose: runtime.dispose,
    supports: runtime.supports,
    render: runtime.render,
  }
}
