import type { MaybeRefOrGetter, Ref } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { nextTick, toValue } from 'vue'

interface UseAutoScrollOptions {
  container: MaybeRefOrGetter<HTMLElement | undefined>
  content: MaybeRefOrGetter<HTMLElement | undefined>
  enabled: Ref<boolean>
  active: MaybeRefOrGetter<boolean>
}

const SETTLE_QUIET_PERIOD_MS = 240

export function useAutoScroll(options: UseAutoScrollOptions) {
  const pauseAutoScroll = ref<boolean>(false)
  const lastScrollTop = ref<number>(0)
  let scrollFrame: number | undefined
  let settleTimer: ReturnType<typeof setTimeout> | undefined
  let settling = false

  function cancelPendingScroll() {
    if (typeof window === 'undefined')
      return

    if (scrollFrame !== undefined)
      window.cancelAnimationFrame(scrollFrame)
    if (settleTimer !== undefined)
      clearTimeout(settleTimer)
    scrollFrame = undefined
    settleTimer = undefined
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

  function settleScroll() {
    if (!options.enabled.value || pauseAutoScroll.value || typeof window === 'undefined') {
      reset()
      return
    }

    cancelPendingScroll()
    settling = true
    scheduleSettleReset()
    void nextTick(scrollToBottom)
  }

  function scheduleSettleReset() {
    if (!settling)
      return

    if (settleTimer !== undefined)
      clearTimeout(settleTimer)
    settleTimer = setTimeout(() => {
      settleTimer = undefined
      reset()
    }, SETTLE_QUIET_PERIOD_MS)
  }

  function reset() {
    cancelPendingScroll()
    settling = false
    options.enabled.value = false
    pauseAutoScroll.value = false
    lastScrollTop.value = 0
  }

  watch(() => toValue(options.active), (value) => {
    if (value) {
      cancelPendingScroll()
      settling = false
      options.enabled.value = true
      scrollToBottom()
    }
    else if (options.enabled.value && !pauseAutoScroll.value) {
      settleScroll()
    }
    else {
      reset()
    }
  })
  watch(() => options.enabled.value, (value) => {
    if (value) {
      cancelPendingScroll()
      scrollToBottom()
    }
  })

  useResizeObserver(() => toValue(options.content), () => {
    scrollToBottom()
    scheduleSettleReset()
  })
  onBeforeUnmount(cancelPendingScroll)

  return {
    onScroll,
    pauseAutoScroll,
    reset,
    scrollToBottom,
  }
}
