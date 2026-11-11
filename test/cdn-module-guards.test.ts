import { dynamicImport } from '@stream-markdown/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { beautifulMermaid } from '../packages/extensions/beautiful-mermaid/src/extension'
import { createShikiRuntime } from '../packages/extensions/code/src/runtime'
import { createKatexRuntime } from '../packages/extensions/math/src/runtime'
import { createMermaidRuntime } from '../packages/extensions/mermaid/src/runtime'
import { pele } from '../packages/extensions/pele/src'

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
    vi.stubGlobal('document', {
      createElement: () => ({}),
    })
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

    await expect(runtime.preload()).rejects.toThrow(
      /Invalid Shiki module from https:\/\/cdn\.example\.test\/module\.js.*bundledLanguagesInfo.*bundledThemesInfo|Invalid Shiki module from https:\/\/cdn\.example\.test\/module\.js.*bundledThemesInfo.*bundledLanguagesInfo/,
    )
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
    vi.mocked(dynamicImport).mockResolvedValue({
      renderMermaidSVGAsync: () => {},
    })
    const extension = beautifulMermaid({
      cdnOptions: cdnModule(),
    })

    await expect(extension.preload()).rejects.toThrow(
      /Invalid Beautiful Mermaid module.*THEMES.*fromShikiTheme/,
    )
  })

  it('loads the lazy Pele renderer from the CDN once for concurrent diagrams', async () => {
    const renderAsync = vi.fn(async () => ({ svg: '<svg style=""></svg>' }))
    vi.mocked(dynamicImport).mockResolvedValue({ renderAsync })
    const extension = pele({
      cdnOptions: { baseUrl: 'https://cdn.example.test/npm/' },
    })
    const input = { code: 'flowchart LR\n  A --> B', isDark: false }

    const results = await Promise.all([
      extension.render(input),
      extension.render(input),
    ])

    expect(results.every(result => result.valid)).toBe(true)
    expect(renderAsync).toHaveBeenCalledTimes(2)
    expect(dynamicImport).toHaveBeenCalledExactlyOnceWith(
      expect.stringMatching(/^https:\/\/cdn\.example\.test\/npm\/pele@[^/]+\/dist\/esm\/lazy\.js$/),
    )
  })

  it('reports an incomplete Pele module', async () => {
    vi.mocked(dynamicImport).mockResolvedValue({})
    const extension = pele({
      cdnOptions: cdnModule(),
    })

    const result = await extension.render({ code: 'flowchart LR\n  A --> B', isDark: false })

    expect(result).toMatchObject({
      valid: false,
      error: expect.stringMatching(/Invalid Pele module from https:\/\/cdn\.example\.test\/module\.js/),
    })
  })

  it('reports an incomplete KaTeX module', async () => {
    vi.mocked(dynamicImport).mockResolvedValue({
      render: () => {},
    })
    const runtime = createKatexRuntime({
      cdnOptions: cdnModule(),
    })

    await expect(runtime.preload()).rejects.toThrow(/Invalid KaTeX module.*renderToString/)
  })
})
