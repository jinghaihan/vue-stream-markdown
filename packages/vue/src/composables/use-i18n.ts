import { getI18nText } from '@stream-markdown/core'
import { localeMessages } from '../locales'

export function useI18n() {
  function t(key: string, fallbackKey?: string) {
    const text = getI18nText(localeMessages.value, key)
    if (text === key && fallbackKey)
      return getI18nText(localeMessages.value, fallbackKey)
    return text
  }

  return { t }
}
