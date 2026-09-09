import type { StreamMarkdownMode, StreamSmoothingPreset } from '@stream-markdown/core'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { createStreamSmoother } from '@stream-markdown/core'
import { onBeforeUnmount, onMounted, shallowRef, toValue, watch } from 'vue'

export interface StreamContentFrame {
  content: string
  mode: StreamMarkdownMode
  revision: number
}

export interface UseStreamSmoothingOptions {
  content: MaybeRefOrGetter<string>
  enabled: MaybeRefOrGetter<boolean>
  mode: MaybeRefOrGetter<StreamMarkdownMode>
  preset?: MaybeRefOrGetter<StreamSmoothingPreset>
}

export interface UseStreamSmoothingReturn {
  acknowledge: () => void
  frame: ShallowRef<StreamContentFrame>
}

interface QueuedStreamFrame {
  content: string
  mode: StreamMarkdownMode
}

/**
 * Buffers append-only content updates and waits for each consumer pass to
 * finish before exposing the next prefix.
 */
export function useStreamSmoothing(
  options: UseStreamSmoothingOptions,
): UseStreamSmoothingReturn {
  const initialContent = toValue(options.content)
  const initialMode = toValue(options.mode)
  let smoother = createStreamSmoother(initialContent, { preset: toValue(options.preset) ?? 'balanced' })
  const frame = shallowRef<StreamContentFrame>({
    content: initialContent,
    mode: initialMode,
    revision: 0,
  })
  const immediateFrames: QueuedStreamFrame[] = []
  let mounted = false
  let waiting = true
  let revision = 0
  let finishMode: StreamMarkdownMode | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  let rafId: number | undefined

  function clearTimer() {
    if (timer === undefined)
      return
    clearTimeout(timer)
    timer = undefined
  }

  function clearFrame() {
    if (rafId === undefined)
      return
    if (typeof globalThis.cancelAnimationFrame === 'function')
      globalThis.cancelAnimationFrame(rafId)
    rafId = undefined
  }

  function clearSchedule() {
    clearTimer()
    clearFrame()
  }

  function emit(content: string, mode: StreamMarkdownMode) {
    waiting = true
    frame.value = {
      content,
      mode,
      revision: ++revision,
    }
  }

  function drain() {
    if (!mounted || waiting)
      return

    const immediate = immediateFrames.shift()
    if (immediate) {
      emit(immediate.content, immediate.mode)
      return
    }

    if (!toValue(options.enabled))
      return

    const nextContent = smoother.take()
    if (nextContent !== undefined) {
      emit(nextContent, 'streaming')
      return
    }

    if (finishMode && !smoother.hasPending()) {
      const mode = finishMode
      finishMode = undefined
      emit(smoother.getContent(), mode)
      return
    }

    schedule()
  }

  function schedule() {
    if (!mounted || waiting || timer !== undefined || immediateFrames.length > 0)
      return

    const canDrain = toValue(options.mode) === 'streaming' || finishMode !== undefined
    if (!toValue(options.enabled) || !canDrain || !smoother.hasPending())
      return

    timer = setTimeout(() => {
      timer = undefined
      startFrameLoop()
    }, Math.max(1, Math.ceil(smoother.getNextDelay())))
  }

  function startFrameLoop() {
    if (!mounted || waiting || rafId !== undefined)
      return

    if (typeof globalThis.requestAnimationFrame !== 'function') {
      drain()
      return
    }

    rafId = globalThis.requestAnimationFrame(() => {
      rafId = undefined
      if (!mounted || waiting)
        return

      if (smoother.getNextDelay() > 0) {
        startFrameLoop()
        return
      }

      drain()
    })
  }

  function enqueueImmediate(content: string, mode: StreamMarkdownMode) {
    clearSchedule()
    immediateFrames.push({ content, mode })
    drain()
  }

  function acknowledge() {
    waiting = false
    drain()
  }

  watch(
    () => [
      toValue(options.content),
      toValue(options.mode),
      toValue(options.enabled),
      toValue(options.preset) ?? 'balanced',
    ] as const,
    ([content, mode, enabled, preset], previous) => {
      const modeChanged = previous !== undefined && mode !== previous[1]
      const presetChanged = previous !== undefined && preset !== previous[3]

      if (!enabled) {
        finishMode = undefined
        smoother.reset(content)
        enqueueImmediate(content, mode)
        return
      }

      if (mode === 'static') {
        const update = modeChanged ? smoother.update(content) : 'immediate'
        if (modeChanged && update !== 'immediate' && smoother.hasPending()) {
          finishMode = 'static'
          schedule()
          return
        }

        finishMode = undefined
        smoother.reset(content)
        enqueueImmediate(content, mode)
        return
      }

      if (modeChanged) {
        finishMode = undefined
        smoother.reset(content)
        enqueueImmediate(content, mode)
        return
      }

      if (presetChanged) {
        finishMode = undefined
        smoother = createStreamSmoother(content, { preset })
        enqueueImmediate(content, mode)
        return
      }

      const update = smoother.update(content)
      if (update === 'immediate') {
        enqueueImmediate(smoother.getContent(), mode)
        return
      }

      if (update === 'pending')
        schedule()
    },
    { flush: 'pre' },
  )

  onMounted(() => {
    mounted = true
    drain()
  })

  onBeforeUnmount(() => {
    mounted = false
    clearSchedule()
    immediateFrames.length = 0
  })

  return { acknowledge, frame }
}
