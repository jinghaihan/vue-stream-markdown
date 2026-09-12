import type { MermaidExtension } from '@stream-markdown/core'
import type { BeautifulMermaidExtensionOptions } from './types'
import { createBeautifulMermaidRuntime } from './runtime'

export function beautifulMermaid<TErrorComponent = never>(
  options: BeautifulMermaidExtensionOptions<TErrorComponent> = {},
): MermaidExtension<TErrorComponent> {
  const runtime = createBeautifulMermaidRuntime(options)

  return {
    errorComponent: options.errorComponent,
    preload: runtime.preload,
    dispose: runtime.dispose,
    supports: runtime.supports,
    render: runtime.render,
  }
}
