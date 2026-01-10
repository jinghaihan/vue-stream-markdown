import type {
  BuiltinLanguage,
  BundledLanguage,
  BundledTheme,
  Highlighter,
  TokensResult,
} from 'shiki'
import type { MaybeRef } from 'vue'
import type { CdnOptions, ShikiOptions } from '../types'
import { computed, ref, unref } from 'vue'
import { DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME, LANGUAGE_ALIAS } from '../constants'
import { hasShikiModule, isClient } from '../utils'
import { useCdnLoader } from './use-cdn-loader'

interface UseShikiOptions {
  lang?: MaybeRef<string>
  shikiOptions?: MaybeRef<ShikiOptions | undefined>
  cdnOptions?: CdnOptions
  isDark?: MaybeRef<boolean>
}

let highlighter: Highlighter | null = null
let createHighlighterPromise: Promise<Highlighter> | null = null

export function useShiki(options?: UseShikiOptions) {
  const installed = ref<boolean>(false)

  const { getCdnShikiUrl, loadCdnShiki } = useCdnLoader({ cdnOptions: options?.cdnOptions })

  const lang = computed(() => unref(options?.lang) ?? 'plaintext')

  const shikiTheme = computed(() => unref(options?.shikiOptions)?.theme ?? [DEFAULT_LIGHT_THEME, DEFAULT_DARK_THEME])
  const lightTheme = computed(() => shikiTheme.value[0] ?? DEFAULT_LIGHT_THEME)
  const darkTheme = computed(() => shikiTheme.value[1] ?? DEFAULT_DARK_THEME)

  const langs = computed(() => unref(options?.shikiOptions)?.langs ?? [])
  const langAlias = computed(() => {
    const data = unref(options?.shikiOptions)?.langAlias ?? {}
    return {
      ...LANGUAGE_ALIAS,
      ...data,
    }
  })
  const codeToTokenOptions = computed(() => unref(options?.shikiOptions)?.codeToTokenOptions ?? {})

  async function getShiki(): Promise<typeof import('shiki')> {
    const module = await loadCdnShiki() ?? await import('shiki')
    return module
  }

  async function hasShiki(): Promise<boolean> {
    return getCdnShikiUrl() ? true : await hasShikiModule()
  }

  async function getThemes() {
    const { bundledThemesInfo } = await getShiki()
    return [lightTheme.value, darkTheme.value].filter(theme => bundledThemesInfo.find(t => t.id === theme))
  }

  async function getDualTheme() {
    const { bundledThemesInfo } = await getShiki()
    return {
      light: bundledThemesInfo.find(t => t.id === lightTheme.value)?.id ?? DEFAULT_LIGHT_THEME,
      dark: bundledThemesInfo.find(t => t.id === darkTheme.value)?.id ?? DEFAULT_DARK_THEME,
    }
  }

  async function getLanguage() {
    if (langAlias.value[lang.value])
      return langAlias.value[lang.value] as BuiltinLanguage

    const { bundledLanguagesInfo } = await getShiki()
    const language = bundledLanguagesInfo.find(l => l.id === lang.value || l.aliases?.includes(lang.value))

    if (language)
      return language.id as BuiltinLanguage

    return 'plaintext'
  }

  async function getHighlighter(): Promise<Highlighter> {
    if (createHighlighterPromise) {
      highlighter = await createHighlighterPromise
      createHighlighterPromise = null
    }

    if (highlighter) {
      const loadedLangs = highlighter.getLoadedLanguages()
      const loadedThemes = highlighter.getLoadedThemes()

      const language = await getLanguage()
      const themes = await getThemes()

      if (!loadedLangs.includes(language))
        await highlighter.loadLanguage(language as BundledLanguage)

      for (const theme of themes) {
        if (!loadedThemes.includes(theme!))
          await highlighter.loadTheme(theme as BundledTheme)
      }

      return highlighter
    }

    createHighlighterPromise = (async () => {
      const { createHighlighter } = await getShiki()
      return createHighlighter({
        themes: await getThemes(),
        langs: langs.value,
        langAlias: langAlias.value,
      })
    })()

    highlighter = await createHighlighterPromise
    createHighlighterPromise = null
    return highlighter
  }

  async function codeToTokens(code: string): Promise<TokensResult> {
    const highlighter = await getHighlighter()
    return highlighter.codeToTokens(code, {
      themes: await getDualTheme(),
      lang: await getLanguage(),
      ...codeToTokenOptions.value,
    })
  }

  async function preload() {
    if (highlighter)
      return

    installed.value = await hasShiki()
    if (installed.value)
      await getHighlighter()
  }

  function dispose() {
    highlighter?.dispose()
    highlighter = null
  }

  if (isClient()) {
    (async () => {
      if (highlighter) {
        installed.value = true
        return
      }
      installed.value = await hasShiki()
    })()
  }

  return {
    installed,
    getShiki,
    getHighlighter,
    codeToTokens,
    preload,
    dispose,
  }
}
