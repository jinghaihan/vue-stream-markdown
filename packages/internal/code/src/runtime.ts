import type {
  BuiltinLanguage,
  BundledLanguage,
  BundledTheme,
  Highlighter,
  TokensResult,
} from 'shiki'
import type { CodeRuntimeOptions, ShikiRuntime } from './types'
import { resolveGetter } from '@stream-markdown/shared'
import { createShikiCdnLoader } from './cdn'
import {
  DEFAULT_SHIKI_DARK_THEME,
  DEFAULT_SHIKI_LIGHT_THEME,
  LANGUAGE_ALIAS,
} from './constants'

let highlighter: Highlighter | null = null
let createHighlighterPromise: Promise<Highlighter> | null = null

function normalizeShikiModule(module: typeof import('shiki')): typeof import('shiki') {
  let defaultExport: typeof import('shiki') | undefined

  try {
    defaultExport = (module as typeof import('shiki') & { default?: typeof import('shiki') }).default
  }
  catch {
    defaultExport = undefined
  }

  if (defaultExport && typeof defaultExport === 'object')
    return { ...module, ...defaultExport }

  return module
}

async function hasBundledShikiModule() {
  try {
    await import('shiki')
    return true
  }
  catch {
    return false
  }
}

export function disposeSharedShikiHighlighter() {
  highlighter?.dispose()
  highlighter = null
  createHighlighterPromise = null
}

export function createShikiRuntime(options: CodeRuntimeOptions = {}): ShikiRuntime {
  const cdnLoader = createShikiCdnLoader({
    cdnOptions: options.cdnOptions,
  })

  const getThemePair = () =>
    resolveGetter(options.theme) ?? [DEFAULT_SHIKI_LIGHT_THEME, DEFAULT_SHIKI_DARK_THEME]

  const getLangAlias = () => ({
    ...LANGUAGE_ALIAS,
    ...(resolveGetter(options.langAlias) ?? {}),
  })

  const getLangs = () => resolveGetter(options.langs) ?? []
  const getCodeToTokenOptions = () => resolveGetter(options.codeToTokenOptions) ?? {}
  const getCurrentLanguage = () => resolveGetter(options.lang) ?? 'plaintext'

  async function getShiki(): Promise<typeof import('shiki')> {
    const module = await cdnLoader.loadCdn() ?? await import('shiki')
    return normalizeShikiModule(module)
  }

  async function hasShiki() {
    return cdnLoader.getCdnUrl() ? true : await hasBundledShikiModule()
  }

  async function getThemes() {
    const [lightTheme, darkTheme] = getThemePair()
    const { bundledThemesInfo } = await getShiki()

    return [lightTheme, darkTheme]
      .filter(theme => bundledThemesInfo.find(t => t.id === theme))
  }

  async function getDualTheme() {
    const { bundledThemesInfo } = await getShiki()
    const [lightTheme, darkTheme] = getThemePair()

    return {
      light: bundledThemesInfo.find(t => t.id === lightTheme)?.id ?? DEFAULT_SHIKI_LIGHT_THEME,
      dark: bundledThemesInfo.find(t => t.id === darkTheme)?.id ?? DEFAULT_SHIKI_DARK_THEME,
    }
  }

  async function getLanguage(): Promise<BuiltinLanguage> {
    const lang = getCurrentLanguage()
    const langAlias = getLangAlias()

    if (langAlias[lang])
      return langAlias[lang] as BuiltinLanguage

    const { bundledLanguagesInfo } = await getShiki()
    const language = bundledLanguagesInfo.find(l => l.id === lang || l.aliases?.includes(lang))
    if (language)
      return language.id as BuiltinLanguage

    return 'plaintext' as BuiltinLanguage
  }

  async function ensureResourceLoaded(targetHighlighter: Highlighter) {
    const language = await getLanguage()
    const themes = await getThemes()
    const loadedLangs = targetHighlighter.getLoadedLanguages()
    const loadedThemes = targetHighlighter.getLoadedThemes()

    if (!loadedLangs.includes(language))
      await targetHighlighter.loadLanguage(language as unknown as BundledLanguage)

    for (const theme of themes) {
      if (!loadedThemes.includes(theme))
        await targetHighlighter.loadTheme(theme as BundledTheme)
    }
  }

  async function getHighlighter() {
    let targetHighlighter = highlighter

    if (!targetHighlighter) {
      if (!createHighlighterPromise) {
        createHighlighterPromise = (async () => {
          const { createHighlighter } = await getShiki()
          return createHighlighter({
            themes: await getThemes(),
            langs: getLangs(),
            langAlias: getLangAlias(),
          })
        })()
      }

      try {
        targetHighlighter = await createHighlighterPromise
        highlighter = targetHighlighter
      }
      finally {
        createHighlighterPromise = null
      }
    }

    await ensureResourceLoaded(targetHighlighter)
    return targetHighlighter
  }

  async function codeToTokens(code: string): Promise<TokensResult> {
    const targetHighlighter = await getHighlighter()
    return targetHighlighter.codeToTokens(code, {
      themes: await getDualTheme(),
      lang: await getLanguage(),
      ...getCodeToTokenOptions(),
    })
  }

  async function preload() {
    if (highlighter)
      return

    if (await hasShiki())
      await getHighlighter()
  }

  return {
    installed: hasShiki(),
    preload,
    dispose: () => {},
    getShiki,
    getHighlighter,
    codeToTokens,
    getLanguage,
  }
}
