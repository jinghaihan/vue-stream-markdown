import type { LocaleConfig, SupportedLanguage } from '@stream-markdown/shared'
import { DEFAULT_LANGUAGE, loadLocaleConfig, resolveLocaleLanguage } from '@stream-markdown/shared'
import { ref } from 'vue'

export const localeMessages = ref<LocaleConfig>()

export const currentLocale = ref<SupportedLanguage>(DEFAULT_LANGUAGE)

export async function loadLocaleMessages(language: string | LocaleConfig) {
  try {
    localeMessages.value = await loadLocaleConfig(language)

    if (typeof language === 'string')
      currentLocale.value = resolveLocaleLanguage(language)
  }
  catch {
    localeMessages.value = await loadLocaleConfig(DEFAULT_LANGUAGE)
    currentLocale.value = DEFAULT_LANGUAGE
  }
}

void loadLocaleMessages(DEFAULT_LANGUAGE)
