import type {
  BuiltinLanguage,
  BundledLanguage,
  BundledTheme,
  Highlighter,
  TokensResult,
} from 'shiki'
import type { MaybeRef } from 'vue'
import type { ShikiOptions } from '../types'
import { computed, ref, unref } from 'vue'
import { DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME, LANGUAGE_ALIAS } from '../constants'
import { hasShiki } from '../utils'

interface UseShikiOptions {
  lang?: MaybeRef<string>
  shikiOptions?: MaybeRef<ShikiOptions | undefined>
  isDark?: MaybeRef<boolean>
}

let highlighter: Highlighter | null = null

export function useShiki(options?: UseShikiOptions) {
  const installed = ref<boolean>(false)

  const lang = computed(() => unref(options?.lang) ?? 'plaintext')

  const shikiTheme = computed(() => unref(options?.shikiOptions)?.theme ?? [DEFAULT_LIGHT_THEME, DEFAULT_DARK_THEME])
  const lightTheme = computed(() => shikiTheme.value[0] ?? DEFAULT_LIGHT_THEME)
  const darkTheme = computed(() => shikiTheme.value[1] ?? DEFAULT_DARK_THEME)

  const langAlias = computed(() => unref(options?.shikiOptions)?.langAlias ?? {})
  const codeToTokenOptions = computed(() => unref(options?.shikiOptions)?.codeToTokenOptions ?? {})

  const isDark = computed(() => unref(options?.isDark) ?? false)

  async function getThemes() {
    const { bundledThemesInfo } = await import('shiki')
    return [lightTheme.value, darkTheme.value].filter(theme => bundledThemesInfo.find(t => t.id === theme))
  }

  async function getTheme() {
    const { bundledThemesInfo } = await import('shiki')
    const theme = bundledThemesInfo.find(t => t.id === (isDark.value ? darkTheme.value : lightTheme.value))
    if (!theme)
      return isDark.value ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME
    return theme.id
  }

  async function getLanguage() {
    if (LANGUAGE_ALIAS[lang.value])
      return LANGUAGE_ALIAS[lang.value]

    const { bundledLanguagesInfo } = await import('shiki')
    const language = bundledLanguagesInfo.find(l => l.id === lang.value || l.aliases?.includes(lang.value))

    if (language)
      return language.id
    return 'plaintext'
  }

  async function getHighlighter(): Promise<Highlighter> {
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

    const { createHighlighter } = await import('shiki')

    highlighter = await createHighlighter({
      themes: [await getTheme()],
      langs: [await getLanguage()],
      langAlias: {
        ...LANGUAGE_ALIAS,
        ...langAlias.value,
      },
    })
    return highlighter
  }

  async function codeToTokens(code: string): Promise<TokensResult> {
    const highlighter = await getHighlighter()
    return highlighter.codeToTokens(code, {
      theme: await getTheme(),
      lang: await getLanguage() as BuiltinLanguage,
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

  (async () => {
    if (highlighter) {
      installed.value = true
      return
    }
    installed.value = await hasShiki()
  })()

  return {
    installed,
    getHighlighter,
    codeToTokens,
    preload,
    dispose,
  }
}
