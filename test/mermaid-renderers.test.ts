import type { MermaidExtension } from '@stream-markdown/core'
import type { Component } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useMermaid } from '../packages/vue/src/composables'

function createExtension(
  supports: (code: string) => boolean,
  svg: string,
): MermaidExtension<Component> {
  return {
    preload: async () => {},
    dispose: () => {},
    supports,
    render: vi.fn(async () => ({ svg, valid: true })),
  }
}

describe('mermaid extension fallback', () => {
  it('prefers Beautiful Mermaid for supported diagrams', async () => {
    const beautifulMermaid = createExtension(code => code.startsWith('flowchart'), '<svg>beautiful</svg>')
    const mermaid = createExtension(() => true, '<svg>vanilla</svg>')
    const runtime = useMermaid({ extensions: { beautifulMermaid, mermaid } })

    const result = await runtime.renderMermaid('flowchart LR')

    expect(result.svg).toBe('<svg>beautiful</svg>')
    expect(beautifulMermaid.render).toHaveBeenCalledOnce()
    expect(mermaid.render).not.toHaveBeenCalled()
  })

  it('falls back to Mermaid when Beautiful Mermaid does not support a diagram', async () => {
    const beautifulMermaid = createExtension(code => code.startsWith('flowchart'), '<svg>beautiful</svg>')
    const mermaid = createExtension(() => true, '<svg>vanilla</svg>')
    const runtime = useMermaid({ extensions: { beautifulMermaid, mermaid } })

    const result = await runtime.renderMermaid('pie title Usage')

    expect(result.svg).toBe('<svg>vanilla</svg>')
    expect(beautifulMermaid.render).not.toHaveBeenCalled()
    expect(mermaid.render).toHaveBeenCalledOnce()
  })

  it('keeps unsupported diagrams as source when only Beautiful Mermaid is configured', () => {
    const beautifulMermaid = createExtension(code => code.startsWith('flowchart'), '<svg />')
    const runtime = useMermaid({ extensions: { beautifulMermaid } })

    expect(runtime.canRender('pie title Usage')).toBe(false)
  })
})
