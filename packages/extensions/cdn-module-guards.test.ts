import { dynamicImport } from '@stream-markdown/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { beautifulMermaid } from './beautiful-mermaid/src/extension'
import { createShikiRuntime } from './code/src/runtime'
import { createKatexRuntime } from './math/src/runtime'
import { createMermaidRuntime } from './mermaid/src/runtime'

vi.mock('@stream-markdown/core', async importOriginal => ({
  ...await importOriginal<typeof import('@stream-markdown/core')>(),
  dynamicImport: vi.fn(),
}))

function cdnModule() {
  return {
    getUrl: () => 'https://cdn.example.test/module.js',
  }
}

describe('cDN module guards', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {})
    vi.stubGlobal('document', { createElement: () => ({}) })
  })

  afterEach(() => {
    vi.mocked(dynamicImport).mockReset()
    vi.unstubAllGlobals()
  })

  it('reports an incomplete Shiki module', async () => {
    vi.mocked(dynamicImport).mockResolvedValue({
      createHighlighter: () => {},
    })
    const runtime = createShikiRuntime({
      cdnOptions: cdnModule(),
    })

    const error = await runtime.preload().catch(error => error as Error)

    expect(error.message).toMatch(
      /Invalid Shiki module.*bundledLanguagesInfo.*bundledThemesInfo|Invalid Shiki module.*bundledThemesInfo.*bundledLanguagesInfo/,
    )
    expect(error.message).toContain('https://cdn.example.test/module.js')
  })

  it('reports an incomplete Mermaid module', async () => {
    vi.mocked(dynamicImport).mockResolvedValue({ default: {} })
    const runtime = createMermaidRuntime({
      cdnOptions: cdnModule(),
    })

    await expect(runtime.load()).rejects.toThrow(
      /Invalid Mermaid module.*initialize.*parse.*render/,
    )
  })

  it('reports an incomplete Beautiful Mermaid module', async () => {
    vi.mocked(dynamicImport).mockResolvedValue({ renderMermaidSVGAsync: () => {} })
    const extension = beautifulMermaid({
      cdnOptions: cdnModule(),
    })

    await expect(extension.preload()).rejects.toThrow(
      /Invalid Beautiful Mermaid module.*THEMES.*fromShikiTheme/,
    )
  })

  it('reports an incomplete KaTeX module', async () => {
    vi.mocked(dynamicImport).mockResolvedValue({ render: () => {} })
    const runtime = createKatexRuntime({
      cdnOptions: cdnModule(),
    })

    await expect(runtime.preload()).rejects.toThrow(/Invalid KaTeX module.*renderToString/)
  })
})
