import type { MaybeRef } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { onUnmounted, ref } from 'vue'

interface UseDeferredRenderOptions {
  targetRef: MaybeRef<HTMLElement | null | undefined>
  immediate?: boolean
  debounceDelay?: number
  rootMargin?: string
  idleTimeout?: number
}

function createIdleCallback() {
  const request = (cb: IdleRequestCallback, timeout = 500): number => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      return window.requestIdleCallback(cb, { timeout })
    }

    const start = Date.now()
    // @ts-expect-error - window.setTimeout
    return window.setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () =>
          Math.max(0, 50 - (Date.now() - start)),
      })
    }, 1)
  }

  const cancel = (id: number) => {
    if (typeof window !== 'undefined' && 'cancelIdleCallback' in window)
      window.cancelIdleCallback(id)
    else
      clearTimeout(id)
  }

  return { request, cancel }
}

export function useDeferredRender(options: UseDeferredRenderOptions) {
  const {
    targetRef,
    immediate = false,
    debounceDelay = 300,
    rootMargin = '300px',
    idleTimeout = 500,
  } = options

  const shouldRender = ref(immediate)

  const debounceTimer = ref<number | null>(null)
  const idleCallbackId = ref<number | null>(null)

  const { request, cancel } = createIdleCallback()

  const clearPending = () => {
    if (debounceTimer.value !== null) {
      clearTimeout(debounceTimer.value)
      debounceTimer.value = null
    }
    if (idleCallbackId.value !== null) {
      cancel(idleCallbackId.value)
      idleCallbackId.value = null
    }
  }

  const scheduleRender = (stop: () => void) => {
    idleCallbackId.value = request(
      (deadline) => {
        if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
          shouldRender.value = true
          stop()
        }
        else {
          idleCallbackId.value = request(() => {
            shouldRender.value = true
            stop()
          }, idleTimeout / 2)
        }
      },
      idleTimeout,
    )
  }

  const { stop } = useIntersectionObserver(
    targetRef,
    ([entry]) => {
      if (shouldRender.value || immediate)
        return

      if (entry?.isIntersecting) {
        clearPending()

        debounceTimer.value = window.setTimeout(() => {
          if (entry.isIntersecting && !shouldRender.value)
            scheduleRender(stop)
        }, debounceDelay)
      }
      else {
        clearPending()
      }
    },
    { rootMargin },
  )

  onUnmounted(() => {
    clearPending()
    stop()
  })

  return { shouldRender }
}
