import type { MaybeRef } from 'vue'
import QuickLRU from 'quick-lru'
import { computed, unref, watch } from 'vue'
import { sanitizeHtml } from '../utils'
import { useContext } from './use-context'

interface UseHtmlSanitizerOptions {
  html?: MaybeRef<string | undefined>
  cacheSize?: number
}

export function useHtmlSanitizer(options: UseHtmlSanitizerOptions) {
  const { htmlOptions } = useContext()
  const cache = new QuickLRU<string, string>({
    maxSize: options.cacheSize ?? 50,
  })

  const sanitizedHtml = computed(() => {
    const html = unref(options.html) ?? ''
    if (!html)
      return ''

    const hit = cache.get(html)
    if (typeof hit === 'string')
      return hit

    const output = sanitizeHtml(html, htmlOptions.value)
    cache.set(html, output)
    return output
  })

  watch(htmlOptions, () => cache.clear(), { deep: true })

  return { sanitizedHtml }
}
