import type { LocaleConfig } from '@stream-markdown/shared'
import type { MaybeRefOrGetter } from 'vue'
import type { StreamMarkdownProps } from '../types'
import { isClient, resolveLocaleInput } from '@stream-markdown/shared'
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
    if (!isClient())
      return ''
    const html = document.documentElement
    return html.lang
  }

  onMounted(() => {
    htmlLang.value = readHtmlLang()
  })

  return { locale }
}
