import type { MermaidRuntime, MermaidRuntimeOptions } from './types'
import { VanillaMermaidRenderer } from './runtime/vanilla'

export function createMermaidRuntime(options: MermaidRuntimeOptions = {}): MermaidRuntime {
  const renderer = new VanillaMermaidRenderer(options)

  async function preload() {
    if (!await renderer.isEnabled() || renderer.isLoaded())
      return

    await renderer.load()
  }

  return {
    installed: renderer.isEnabled(),
    preload,
    load: () => renderer.load(),
    dispose() {
      // Mermaid owns a process-wide module singleton and has no disposal API.
    },
    parse: code => renderer.parse(code),
    render: code => renderer.render(code),
  }
}
