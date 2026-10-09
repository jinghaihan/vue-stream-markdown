import type { MaybeRefOrGetter } from 'vue'
import { useEventListener, useResizeObserver } from '@vueuse/core'
import { nextTick, ref, toValue, watch } from 'vue'

interface ScrollMetrics {
  clientHeight: number
  scrollHeight: number
  scrollTop: number
}

interface UsePinnedScrollOptions {
  target: MaybeRefOrGetter<HTMLElement | undefined>
  active: MaybeRefOrGetter<boolean>
  enabled: MaybeRefOrGetter<boolean>
  contentKey?: MaybeRefOrGetter<unknown>
}

const BOTTOM_THRESHOLD_PX = 8

export function isScrollAtBottom(
  metrics: ScrollMetrics,
  threshold = BOTTOM_THRESHOLD_PX,
): boolean {
  return metrics.scrollHeight - metrics.scrollTop - metrics.clientHeight < threshold
}

export function usePinnedScroll(options: UsePinnedScrollOptions) {
  const pinned = ref(true)
  let programmaticScrollTop: number | undefined

  async function followBottom() {
    await nextTick()

    const element = toValue(options.target)
    if (!element || !toValue(options.enabled) || !toValue(options.active) || !pinned.value)
      return

    element.scrollTop = element.scrollHeight
    programmaticScrollTop = element.scrollTop
  }

  useEventListener(
    () => toValue(options.target),
    'scroll',
    () => {
      const element = toValue(options.target)
      if (!element)
        return
      // A queued programmatic scroll may arrive after new content increased the height.
      // Only a changed scroll position should be able to pause following.
      if (element.scrollTop === programmaticScrollTop)
        return
      programmaticScrollTop = undefined
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
    followBottom,
    { flush: 'post', immediate: true },
  )

  // Highlighting and other asynchronous rendering can change the height after contentKey.
  useResizeObserver(
    () => Array.from(toValue(options.target)?.children ?? []).filter(
      (element): element is HTMLElement | SVGElement => element instanceof HTMLElement || element instanceof SVGElement,
    ),
    followBottom,
  )

  return { pinned }
}
