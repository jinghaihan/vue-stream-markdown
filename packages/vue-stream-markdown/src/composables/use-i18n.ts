import { getI18nText } from '@stream-markdown/shared'
import { localeMessages } from '../locales'

export function useI18n() {
  function t(key: string) {
    return getI18nText(localeMessages.value, key)
  }

  return { t }
}
