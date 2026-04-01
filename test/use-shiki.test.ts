import { beforeEach, describe, expect, it, vi } from 'vitest'

const shikiMock = vi.hoisted(() => ({
  instances: [] as any[],
  nextId: 0,
}))

vi.mock('shiki', () => {
  function createMockHighlighter() {
    const loadedLangs: string[] = []
    const loadedThemes: string[] = []

    const highlighter = {
      id: ++shikiMock.nextId,
      getLoadedLanguages: vi.fn(() => [...loadedLangs]),
      getLoadedThemes: vi.fn(() => [...loadedThemes]),
      loadLanguage: vi.fn(async (lang: string) => {
        if (!loadedLangs.includes(lang))
          loadedLangs.push(lang)
      }),
      loadTheme: vi.fn(async (theme: string) => {
        if (!loadedThemes.includes(theme))
          loadedThemes.push(theme)
      }),
      codeToTokens: vi.fn((code: string, options: { lang: string }) => ({
        tokens: [],
        fg: '#000',
        bg: '#fff',
        themeName: 'github-light',
        grammarState: { lang: options.lang },
        code,
      })),
      dispose: vi.fn(),
      getTheme: vi.fn((theme: string) => ({ id: theme })),
    }

    shikiMock.instances.push(highlighter)
    return highlighter
  }

  return {
    bundledThemesInfo: [
      { id: 'github-light' },
      { id: 'github-dark' },
    ],
    bundledLanguagesInfo: [
      { id: 'rust', aliases: ['rs'] },
      { id: 'shellscript', aliases: ['bash', 'sh'] },
    ],
    createHighlighter: vi.fn(async () => createMockHighlighter()),
  }
})

async function importUseShiki() {
  return import('@vue-stream-markdown/composables/use-shiki')
}

describe('useShiki', () => {
  beforeEach(() => {
    vi.resetModules()
    shikiMock.instances.length = 0
    shikiMock.nextId = 0
  })

  it('should return a prepared highlighter from getHighlighter', async () => {
    const { disposeShikiHighlighter, useShiki } = await importUseShiki()

    const highlighter = await useShiki({ lang: 'rust' }).getHighlighter()
    const [instance] = shikiMock.instances

    expect(shikiMock.instances).toHaveLength(1)
    expect(highlighter).toBe(instance)
    expect(instance.loadLanguage).toHaveBeenCalledWith('rust')
    expect(instance.loadTheme).toHaveBeenCalledWith('github-light')
    expect(instance.loadTheme).toHaveBeenCalledWith('github-dark')

    disposeShikiHighlighter()
  })

  it('should reuse the shared highlighter while loading each requested language on that instance', async () => {
    const { disposeShikiHighlighter, useShiki } = await importUseShiki()

    const [rustHighlighter, bashHighlighter] = await Promise.all([
      useShiki({ lang: 'rust' }).getHighlighter(),
      useShiki({ lang: 'bash' }).getHighlighter(),
    ])
    const [instance] = shikiMock.instances

    expect(shikiMock.instances).toHaveLength(1)
    expect(rustHighlighter).toBe(instance)
    expect(bashHighlighter).toBe(instance)
    expect(instance.loadLanguage).toHaveBeenCalledWith('rust')
    expect(instance.loadLanguage).toHaveBeenCalledWith('shellscript')

    disposeShikiHighlighter()
  })
})
