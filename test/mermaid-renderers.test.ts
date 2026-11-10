import type { MermaidExtension } from '@stream-markdown/core'
import type { Component } from 'vue'
import { beautifulMermaid as createBeautifulMermaid } from '@stream-markdown/beautiful-mermaid'
import { pele } from '@stream-markdown/pele'
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
    const pele = createExtension(() => true, '<svg>pele</svg>')
    const runtime = useMermaid({ extensions: { beautifulMermaid, mermaid, pele } })

    const result = await runtime.renderMermaid('flowchart LR')

    expect(result.svg).toBe('<svg>beautiful</svg>')
    expect(beautifulMermaid.render).toHaveBeenCalledOnce()
    expect(pele.render).not.toHaveBeenCalled()
    expect(mermaid.render).not.toHaveBeenCalled()
  })

  it('selects Pele before Mermaid for a supported diagram', async () => {
    const beautifulMermaid = createExtension(() => false, '<svg>beautiful</svg>')
    const mermaid = createExtension(() => true, '<svg>vanilla</svg>')
    const runtime = useMermaid({ extensions: { beautifulMermaid, mermaid, pele: pele() } })
    const source = 'packet-beta\n  0-7: "Header"'

    expect(runtime.canRender(source)).toBe(true)
    expect((await runtime.renderMermaid(source)).svg).toContain('pele-packet')
    expect(beautifulMermaid.render).not.toHaveBeenCalled()
    expect(mermaid.render).not.toHaveBeenCalled()
  })

  it('falls back to Mermaid when the other extensions do not support a diagram', async () => {
    const beautifulMermaid = createExtension(code => code.startsWith('flowchart'), '<svg>beautiful</svg>')
    const mermaid = createExtension(() => true, '<svg>vanilla</svg>')
    const runtime = useMermaid({ extensions: { beautifulMermaid, mermaid, pele: pele() } })

    const result = await runtime.renderMermaid('unknownDiagram')

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

describe('beautiful mermaid extension', () => {
  it('isolates diagram colors from the page and preserves explicit theme colors', async () => {
    const input = { code: 'classDiagram\n  class User {\n    +String name\n  }', isDark: true }
    const zinc = await createBeautifulMermaid().render(input)
    const custom = await createBeautifulMermaid({ config: { muted: '#abcdef' } }).render(input)

    expect(zinc.svg).toMatch(/^<svg[^>]+ style="[^"]*--muted:initial;[^"]*--bg:#18181B;/)
    expect(custom.svg).toMatch(/^<svg[^>]+ style="[^"]*--muted:initial;[^"]*--muted:#abcdef[;"]/)
  })
})

describe('pele extension', () => {
  it('embeds color overrides, Shiki colors, and dark defaults in the SVG', async () => {
    const { svg, valid } = await pele({ colors: { accent: '#abc' } }).render({
      code: 'flowchart LR\n  A --> B',
      isDark: true,
      theme: {
        colors: { 'editor.background': '#123456', 'focusBorder': '#def' },
        settings: [{ scope: ['comment.line'], settings: { foreground: '#abc123' } }],
      },
    })

    expect(valid).toBe(true)
    expect(svg).toMatch(/^<svg[^>]* style="[^"]*--pele-bg:#123456;/)
    expect(svg).toContain('--pele-accent:#abc;')
    expect(svg).toContain('--pele-muted:#abc123;')
    expect(svg).toContain('--pele-fg:#e6edf3;')
  })
})
