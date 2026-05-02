import type { LocaleConfig, SupportedLanguage } from '../types'
import { DEFAULT_LANGUAGE, SUPPORT_LANGUAGES } from '../constants'

interface LocaleModule { default: LocaleConfig }

const localeLoaders: Record<SupportedLanguage, () => Promise<LocaleModule>> = {
  'en-US': () => import('../constants/locales/en-US'),
  'zh-CN': () => import('../constants/locales/zh-CN'),
}

const localeCache: Partial<Record<SupportedLanguage, Promise<LocaleConfig>>> = {}

export function getI18nText(messages: unknown, key: string): string {
  try {
    if (!messages)
      return key

    const result = key.split('.').reduce<unknown>((obj, part) => {
      if (obj && typeof obj === 'object' && part in obj)
        return (obj as Record<string, unknown>)[part]
      return undefined
    }, messages)

    return typeof result === 'string' ? result : key
  }
  catch {
    return key
  }
}

export function isSupportedLanguage(language: string): language is SupportedLanguage {
  return (SUPPORT_LANGUAGES as readonly string[]).includes(language)
}

export function resolveSupportedLanguage(language?: string): SupportedLanguage {
  if (language && isSupportedLanguage(language))
    return language

  const normalizedLanguage = language?.toLowerCase() ?? ''
  return ['zh', 'zh-cn', 'zh-tw'].includes(normalizedLanguage) ? 'zh-CN' : DEFAULT_LANGUAGE
}

async function loadLocaleMessagesByLanguage(language: SupportedLanguage): Promise<LocaleConfig> {
  if (!localeCache[language]) {
    localeCache[language] = localeLoaders[language]().then(module => module.default)
  }

  return await localeCache[language]!
}

export async function loadLocaleConfig(language: string | LocaleConfig): Promise<LocaleConfig> {
  if (typeof language !== 'string')
    return language

  return await loadLocaleMessagesByLanguage(resolveSupportedLanguage(language))
}

export function resolveLocaleLanguage(language: string | LocaleConfig): SupportedLanguage {
  if (typeof language !== 'string')
    return DEFAULT_LANGUAGE

  return resolveSupportedLanguage(language)
}

export function resolveLocaleInput(
  locale: string | LocaleConfig | undefined,
  options: {
    htmlLanguage?: string
    navigatorLanguage?: string
  } = {},
): string | LocaleConfig {
  if (locale && typeof locale === 'object')
    return locale

  if (typeof locale === 'string' && isSupportedLanguage(locale))
    return locale

  return resolveSupportedLanguage(locale || options.htmlLanguage || options.navigatorLanguage)
}
