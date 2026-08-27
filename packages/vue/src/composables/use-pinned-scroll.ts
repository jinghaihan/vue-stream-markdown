import type { MaybeRefOrGetter } from 'vue'
import { useEventListener } from '@vueuse/core'
import { nextTick, ref, toValue, watch } from 'vue'

const BOTTOM_THRESHOLD_PX = 8

interface ScrollMetrics {
  clientHeight: number
  scrollHeight: number
  scrollTop: number
}

export function isScrollAtBottom(
  metrics: ScrollMetrics,
  threshold = BOTTOM_THRESHOLD_PX,
): boolean {
  return metrics.scrollHeight - metrics.scrollTop - metrics.clientHeight < threshold
}

interface UsePinnedScrollOptions {
  target: MaybeRefOrGetter<HTMLElement | undefined>
  active: MaybeRefOrGetter<boolean>
  enabled: MaybeRefOrGetter<boolean>
  contentKey?: MaybeRefOrGetter<unknown>
}

export function usePinnedScroll(options: UsePinnedScrollOptions) {
  const pinned = ref(true)

  useEventListener(
    () => toValue(options.target),
    'scroll',
    () => {
      const element = toValue(options.target)
      if (element)
        pinned.value = isScrollAtBottom(element)
    },
    { passive: true },
  )

  watch(
    () => toValue(options.active),
    (active, wasActive) => {
      if (!active || (active && !wasActive))
        pinned.value = true
    },
    { immediate: true },
  )

  watch(
    () => [
      toValue(options.target),
      toValue(options.active),
      toValue(options.enabled),
      toValue(options.contentKey),
    ] as const,
    async () => {
      await nextTick()

      const element = toValue(options.target)
      if (!element || !toValue(options.enabled) || !toValue(options.active) || !pinned.value)
        return

      element.scrollTop = element.scrollHeight
    },
    { flush: 'post', immediate: true },
  )

  return { pinned }
}
