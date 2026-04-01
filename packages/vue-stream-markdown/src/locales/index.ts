import type { LocaleConfig } from '../types'
import { ref } from 'vue'

export const SUPPORT_LANGUAGES = ['en-US', 'zh-CN']

export const localesGlob = import.meta.glob('./*.json')

export const localeMessages = ref<LocaleConfig>()

export const currentLocale = ref<string>('en-US')

export async function loadLocaleMessages(language: string | LocaleConfig) {
  const load = async (language: string) => {
    const fn = localesGlob[`./${language}.json`]
    if (!fn)
      return
    localeMessages.value = (await fn()) as LocaleConfig
    currentLocale.value = language
  }

  try {
    if (typeof language === 'string')
      await load(language)
    else
      localeMessages.value = language
  }
  catch {
    await load('en-US')
  }
}

loadLocaleMessages('en-US')
