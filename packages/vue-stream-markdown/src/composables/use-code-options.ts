import type { MaybeRefOrGetter } from 'vue'
import type { CodeOptions } from '../types'
import { isCodeOptionEnabled, resolveCodeOptions } from '@stream-markdown/shared'
import { computed, toValue } from 'vue'

interface UseCodeOptionsOptions {
  codeOptions?: MaybeRefOrGetter<CodeOptions | undefined>
  language?: MaybeRefOrGetter<string>
}

export function useCodeOptions(options: UseCodeOptionsOptions) {
  const language = computed(() => toValue(options.language) || '')
  const codeOptions = computed(() => toValue(options.codeOptions))

  const languageCodeOptions = computed(() => resolveCodeOptions(codeOptions.value, language.value))

  const showLanguageIcon = computed(() => isCodeOptionEnabled(languageCodeOptions.value?.languageIcon))

  const showLanguageName = computed(() => isCodeOptionEnabled(languageCodeOptions.value?.languageName))

  const showLineNumbers = computed(() => isCodeOptionEnabled(languageCodeOptions.value?.lineNumbers))

  return {
    languageCodeOptions,
    showLanguageIcon,
    showLanguageName,
    showLineNumbers,
  }
}
