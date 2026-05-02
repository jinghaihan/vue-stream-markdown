import type { MaybeRefOrGetter } from 'vue'
import type { CodeOptions } from '../types'
import { createCodeOptionsModel } from '@stream-markdown/core'
import { computed, toValue } from 'vue'

interface UseCodeOptionsOptions {
  codeOptions?: MaybeRefOrGetter<CodeOptions | undefined>
  language?: MaybeRefOrGetter<string>
}

export function useCodeOptions(options: UseCodeOptionsOptions) {
  const language = computed(() => toValue(options.language) || '')
  const codeOptions = computed(() => toValue(options.codeOptions))

  const model = computed(() => createCodeOptionsModel(codeOptions.value, language.value))
  const languageCodeOptions = computed(() => model.value.languageCodeOptions)
  const showLanguageIcon = computed(() => model.value.showLanguageIcon)
  const showLanguageName = computed(() => model.value.showLanguageName)
  const showLineNumbers = computed(() => model.value.showLineNumbers)

  return {
    languageCodeOptions,
    showLanguageIcon,
    showLanguageName,
    showLineNumbers,
  }
}
