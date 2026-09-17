import type { Ref } from 'vue'
import type { PlaygroundLanguage, PlaygroundLocale } from '../locales'
import { inject, provide } from 'vue'
import { PLAYGROUND_LOCALES } from '../locales'

const PLAYGROUND_I18N_KEY = Symbol('playground-i18n')

interface PlaygroundI18n {
  locale: Ref<string>
  t: (key: string) => string
}

function resolveLanguage(locale: string): PlaygroundLanguage {
  return locale in PLAYGROUND_LOCALES ? locale as PlaygroundLanguage : 'en-US'
}

function getMessage(messages: PlaygroundLocale, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object')
      return undefined
    return (current as Record<string, unknown>)[segment]
  }, messages)

  return typeof value === 'string' ? value : undefined
}

export function provideI18n(locale: Ref<string>) {
  const i18n: PlaygroundI18n = {
    locale,
    t: (key) => {
      const language = resolveLanguage(locale.value)
      return getMessage(PLAYGROUND_LOCALES[language], key)
        ?? getMessage(PLAYGROUND_LOCALES['en-US'], key)
        ?? key
    },
  }

  provide(PLAYGROUND_I18N_KEY, i18n)
  return i18n
}

export function useI18n() {
  const i18n = inject<PlaygroundI18n>(PLAYGROUND_I18N_KEY)
  if (!i18n)
    throw new Error('useI18n must be used below provideI18n')
  return i18n
}
