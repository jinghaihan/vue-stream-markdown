import type { MathRenderInput } from '@stream-markdown/core'
import { expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { useMathRenderer } from '../../packages/vue/src/composables/use-math-renderer'

it.each([undefined, 300])('throttles math updates and renders the final content (delay: %s)', async (delay) => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const scope = effectScope()
  try {
    const node = ref({ value: 'x', display: true, loading: true })
    const render = vi.fn(async ({ code }: MathRenderInput) => ({ html: `<span>${code}</span>` }))
    const result = scope.run(() => useMathRenderer({
      node,
      throttle: delay === undefined ? undefined : ref(delay),
      extension: {
        parserPlugin: { name: 'math' },
        preload: () => {},
        dispose: () => {},
        render,
      },
    }))!
    await vi.advanceTimersByTimeAsync(0)
    expect(render).toHaveBeenCalledTimes(1)

    for (let step = 1; step <= 2; step++) {
      await vi.advanceTimersByTimeAsync(50)
      node.value = { value: `x^${step}`, display: true, loading: step < 2 }
      await nextTick()
    }
    await vi.advanceTimersByTimeAsync((delay ?? 150) - 101)
    expect(render).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(render).toHaveBeenCalledTimes(2)
    expect(render).toHaveBeenLastCalledWith({ code: 'x^2', displayMode: true })
    expect(result.html.value).toBe('<span>x^2</span>')
  }
  finally {
    scope.stop()
    vi.clearAllTimers()
    vi.useRealTimers()
  }
})
