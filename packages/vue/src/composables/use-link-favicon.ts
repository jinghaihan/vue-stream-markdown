import type { MaybeRefOrGetter } from 'vue'
import type { LinkOptions } from '../types'
import { isClient, resolveLinkFaviconUrl } from '@stream-markdown/core'
import { computed, ref, toValue, watch } from 'vue'

interface UseLinkFaviconOptions {
  enabled: MaybeRefOrGetter<boolean>
  favicon: MaybeRefOrGetter<LinkOptions['favicon']>
  loading: MaybeRefOrGetter<boolean | undefined>
  url: MaybeRefOrGetter<string | null | undefined>
  waitingForDestination: MaybeRefOrGetter<boolean | undefined>
}

const STREAMING_FAVICON_DELAY = 300

export function useLinkFavicon(options: UseLinkFaviconOptions) {
  const source = ref<string>()
  const loaded = ref(false)
  const failed = ref(false)
  const show = computed(() => toValue(options.enabled) && toValue(options.favicon) !== false)

  watch(
    [
      () => toValue(options.url),
      () => toValue(options.favicon),
      () => toValue(options.loading),
      () => toValue(options.waitingForDestination),
      show,
    ],
    ([url, favicon, loading, waitingForDestination], _, onCleanup) => {
      let active = true
      let timer: ReturnType<typeof setTimeout> | undefined
      onCleanup(() => {
        active = false
        if (timer)
          clearTimeout(timer)
      })

      source.value = undefined
      loaded.value = false
      failed.value = false

      if (!show.value || waitingForDestination || !url || !isClient())
        return
      const resolvedUrl = url

      async function resolve() {
        try {
          const resolved = await resolveLinkFaviconUrl(resolvedUrl, favicon)
          if (!active)
            return
          source.value = resolved
          failed.value = !resolved
        }
        catch {
          if (active)
            failed.value = true
        }
      }

      if (loading)
        timer = setTimeout(() => void resolve(), STREAMING_FAVICON_DELAY)
      else
        void resolve()
    },
    { immediate: true },
  )

  function handleLoad() {
    loaded.value = true
  }

  function handleError() {
    failed.value = true
  }

  return {
    failed,
    handleError,
    handleLoad,
    loaded,
    show,
    source,
  }
}
