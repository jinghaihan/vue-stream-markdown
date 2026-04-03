import type { MaybeRefOrGetter } from 'vue'
import type { HardenOptions } from '../types'
import { DEFAULT_HARDEN_OPTIONS, transformHardenedUrl } from '@stream-markdown/shared'
import { computed, toValue } from 'vue'

interface UseSanitizersOptions {
  url?: MaybeRefOrGetter<string | undefined>
  hardenOptions?: MaybeRefOrGetter<HardenOptions | undefined>
  loading?: MaybeRefOrGetter<boolean | undefined>
  isImage?: MaybeRefOrGetter<boolean | undefined>
}

export function useSanitizers(options: UseSanitizersOptions) {
  const hardenOptions = computed(() => toValue(options.hardenOptions) ?? DEFAULT_HARDEN_OPTIONS)
  const loading = computed(() => toValue(options.loading) ?? false)

  const isImage = computed(() => toValue(options.isImage) ?? false)

  const url = computed(() => toValue(options.url) ?? '')
  const transformedUrl = computed(() => transformHardenUrl(url.value))
  const isHardenUrl = computed(() => transformedUrl.value === null)

  function transformHardenUrl(url: string): string | null {
    return transformHardenedUrl(
      url,
      hardenOptions.value,
      {
        isImage: isImage.value,
        loading: loading.value,
      },
    )
  }

  return { hardenOptions, transformHardenUrl, transformedUrl, isHardenUrl }
}
