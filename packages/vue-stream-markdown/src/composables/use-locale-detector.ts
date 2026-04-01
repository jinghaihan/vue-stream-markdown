import type { MaybeRef } from 'vue'
import type { LocaleConfig, StreamMarkdownProps } from '../types'
import { useNavigatorLanguage } from '@vueuse/core'
import { computed, onMounted, ref, unref } from 'vue'
import { SUPPORT_LANGUAGES } from '../locales'
import { isClient } from '../utils'

export function useLocaleDetector(localeProp: MaybeRef<StreamMarkdownProps['locale']>) {
  const { language } = useNavigatorLanguage()
  const isLocaleConfig = computed(() => typeof unref(localeProp) === 'object')
  const htmlLang = ref<string>()

  const locale = computed((): string | LocaleConfig => {
    const data = unref(localeProp)
    if (isLocaleConfig.value)
      return data!
    const locale = SUPPORT_LANGUAGES.find(l => l === data)
    if (locale)
      return locale
    const lang = (htmlLang.value || language.value)?.toLowerCase() ?? ''
    return ['zh', 'zh-cn', 'zh-tw'].includes(lang) ? 'zh-CN' : 'en-US'
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
