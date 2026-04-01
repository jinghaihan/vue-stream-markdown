import type { MaybeRef } from 'vue'
import type { CodeOptions } from '../types'
import { computed, unref } from 'vue'

interface UseCodeOptionsOptions {
  codeOptions?: MaybeRef<CodeOptions | undefined>
  language?: MaybeRef<string>
}

export function useCodeOptions(options: UseCodeOptionsOptions) {
  const language = computed(() => unref(options.language) || '')
  const codeOptions = computed(() => unref(options.codeOptions))

  const languageCodeOptions = computed(() => {
    const specificOptions = codeOptions.value?.language?.[language.value]
    return { ...codeOptions.value, ...(specificOptions ?? {}) }
  })

  const showLanguageIcon = computed(() => {
    return typeof languageCodeOptions.value?.languageIcon === 'boolean'
      ? languageCodeOptions.value.languageIcon
      : true
  })

  const showLanguageName = computed(() =>
    typeof languageCodeOptions.value?.languageName === 'boolean'
      ? languageCodeOptions.value.languageName
      : true,
  )

  const showLineNumbers = computed(() =>
    typeof languageCodeOptions.value?.lineNumbers === 'boolean'
      ? languageCodeOptions.value.lineNumbers
      : true,
  )

  return {
    languageCodeOptions,
    showLanguageIcon,
    showLanguageName,
    showLineNumbers,
  }
}
