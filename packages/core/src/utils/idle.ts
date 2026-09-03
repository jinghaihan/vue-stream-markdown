import { isClient } from './env'

export type IdleCallbackId = number | ReturnType<typeof globalThis.setTimeout>

export function createIdleCallback() {
  const request = (cb: IdleRequestCallback, timeout = 500): IdleCallbackId => {
    if (isClient() && 'requestIdleCallback' in window)
      return window.requestIdleCallback(cb, { timeout })

    const start = Date.now()
    return globalThis.setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      })
    }, 1)
  }

  const cancel = (id: IdleCallbackId) => {
    if (isClient() && 'cancelIdleCallback' in window && typeof id === 'number')
      window.cancelIdleCallback(id)
    else
      globalThis.clearTimeout(id)
  }

  return { request, cancel }
}
