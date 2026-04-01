import type { MaybeRef } from 'vue'
import type { HardenOptions } from '../types'
import { computed, unref } from 'vue'
import { DEFAULT_HARDEN_OPTIONS } from '../constants'
import { transformUrl } from '../utils'

interface UseSanitizersOptions {
  url?: MaybeRef<string | undefined>
  hardenOptions?: MaybeRef<HardenOptions | undefined>
  loading?: MaybeRef<boolean | undefined>
  isImage?: MaybeRef<boolean | undefined>
}

export function useSanitizers(options: UseSanitizersOptions) {
  const hardenOptions = computed(() => unref(options.hardenOptions) ?? DEFAULT_HARDEN_OPTIONS)
  const loading = computed(() => unref(options.loading) ?? false)

  const allowedLinkPrefixes = computed(() => hardenOptions.value.allowedLinkPrefixes ?? ['*'])
  const allowedImagePrefixes = computed(() => hardenOptions.value.allowedImagePrefixes ?? ['*'])
  const allowedProtocols = computed(() => hardenOptions.value.allowedProtocols ?? ['*'])
  const allowDataImages = computed(() => hardenOptions.value.allowDataImages ?? true)
  const defaultOrigin = computed(() => hardenOptions.value.defaultOrigin ?? '')

  const isImage = computed(() => unref(options.isImage) ?? false)

  const url = computed(() => unref(options.url) ?? '')
  const transformedUrl = computed(() => transformHardenUrl(url.value))
  const isHardenUrl = computed(() => transformedUrl.value === null)

  function transformHardenUrl(url: string): string | null {
    if (!url || loading.value)
      return url

    return transformUrl(
      url,
      isImage.value ? allowedImagePrefixes.value : allowedLinkPrefixes.value,
      defaultOrigin.value,
      allowDataImages.value,
      isImage.value,
      allowedProtocols.value,
    )
  }

  return { hardenOptions, transformHardenUrl, transformedUrl, isHardenUrl }
}
