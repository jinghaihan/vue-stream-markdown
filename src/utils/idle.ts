import { isClient } from './inference'

export function createIdleCallback() {
  const request = (cb: IdleRequestCallback, timeout = 500): number => {
    if (isClient() && 'requestIdleCallback' in window) {
      return window.requestIdleCallback(cb, { timeout })
    }

    const start = Date.now()
    return window.setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () =>
          Math.max(0, 50 - (Date.now() - start)),
      })
    }, 1)
  }

  const cancel = (id: number) => {
    if (isClient() && 'cancelIdleCallback' in window)
      window.cancelIdleCallback(id)
    else
      clearTimeout(id)
  }

  return { request, cancel }
}
