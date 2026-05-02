import type { LocaleConfig } from '@stream-markdown/core'
import type { MaybeRefOrGetter } from 'vue'
import type { StreamMarkdownProps } from '../types'
import { readDocumentLanguage, resolveLocaleInput } from '@stream-markdown/core'
import { useNavigatorLanguage } from '@vueuse/core'
import { computed, onMounted, ref, toValue } from 'vue'

export function useLocaleDetector(localeProp: MaybeRefOrGetter<StreamMarkdownProps['locale']>) {
  const { language } = useNavigatorLanguage()
  const htmlLang = ref<string>()

  const locale = computed((): string | LocaleConfig => {
    return resolveLocaleInput(toValue(localeProp), {
      htmlLanguage: htmlLang.value,
      navigatorLanguage: language.value,
    })
  })

  function readHtmlLang() {
    return readDocumentLanguage()
  }

  onMounted(() => {
    htmlLang.value = readHtmlLang()
  })

  return { locale }
}
