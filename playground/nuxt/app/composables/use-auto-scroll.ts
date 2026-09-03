import type { MaybeRefOrGetter, Ref } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { toValue } from 'vue'

interface UseAutoScrollOptions {
  container: MaybeRefOrGetter<HTMLElement | undefined>
  content: MaybeRefOrGetter<HTMLElement | undefined>
  enabled: Ref<boolean>
  active: MaybeRefOrGetter<boolean>
}

export function useAutoScroll(options: UseAutoScrollOptions) {
  const pauseAutoScroll = ref<boolean>(false)
  const lastScrollTop = ref<number>(0)
  let scrollFrame: number | undefined

  function cancelPendingScroll() {
    if (scrollFrame === undefined || typeof window === 'undefined')
      return

    window.cancelAnimationFrame(scrollFrame)
    scrollFrame = undefined
  }

  function scrollToBottom() {
    if (!options.enabled.value || pauseAutoScroll.value)
      return

    const container = toValue(options.container)
    if (!container || typeof window === 'undefined')
      return

    if (scrollFrame !== undefined)
      return

    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = undefined

      if (!options.enabled.value || pauseAutoScroll.value)
        return

      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'auto',
      })
    })
  }

  function onScroll() {
    const container = toValue(options.container)
    if (!container)
      return

    const isScrollUp = container.scrollTop < lastScrollTop.value
    lastScrollTop.value = container.scrollTop

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    if (isScrollUp && distanceFromBottom > 65)
      pauseAutoScroll.value = true
    else if (distanceFromBottom <= 20)
      pauseAutoScroll.value = false
  }

  function reset() {
    cancelPendingScroll()
    options.enabled.value = false
    pauseAutoScroll.value = false
    lastScrollTop.value = 0
  }

  watch(() => toValue(options.active), (value) => {
    if (value) {
      options.enabled.value = true
      scrollToBottom()
    }
    else {
      reset()
    }
  })
  watch(() => options.enabled.value, (value) => {
    if (value)
      scrollToBottom()
  })

  useResizeObserver(() => toValue(options.content), scrollToBottom)
  onBeforeUnmount(cancelPendingScroll)

  return {
    onScroll,
    pauseAutoScroll,
    reset,
    scrollToBottom,
  }
}
