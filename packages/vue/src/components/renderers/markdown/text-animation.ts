import type { TextPart } from '@stream-markdown/core'
import type { StreamMarkdownResolvedContext } from '../../../types'
import { createTextAnimationScheduler } from '@stream-markdown/core'

export function createTextAnimationController(context: StreamMarkdownResolvedContext) {
  const scheduler = createTextAnimationScheduler()
  const elements = new Map<string, HTMLElement>()
  const playedKeys = new Set<string>()
  const previousBatch = new Map<string, HTMLElement>()
  let commitQueued = false
  let disposed = false

  function commit() {
    if (disposed)
      return
    scheduler.retain(new Set(elements.keys()))
    for (const key of playedKeys) {
      if (!elements.has(key))
        playedKeys.delete(key)
    }
    const delays = scheduler.commitPass((left, right) => {
      const position = elements.get(left)!.compareDocumentPosition(elements.get(right)!)
      return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
    })
    if (!delays.size)
      return

    // Advance only animations that have not started. Changing an existing
    // CSS delay can rewind an animation, so advance its playback instead.
    for (const element of previousBatch.values()) {
      for (const animation of element.getAnimations?.() ?? []) {
        const delay = Number(animation.effect?.getTiming().delay ?? 0)
        if (Number(animation.currentTime ?? 0) < delay)
          animation.currentTime = delay
      }
    }
    previousBatch.clear()
    for (const [key, delay] of delays) {
      const element = elements.get(key)
      if (!element)
        continue
      element.style.animationDelay = `${delay}ms`
      element.style.transitionDelay = `${delay}ms`
      playedKeys.add(key)
      previousBatch.set(key, element)
    }
  }

  function queueCommit() {
    if (commitQueued)
      return
    commitQueued = true
    queueMicrotask(() => {
      commitQueued = false
      commit()
    })
  }

  return {
    schedule(parts: TextPart[]) {
      scheduler.beginPass({
        enabled: context.enableAnimate.value,
        stagger: context.animationStagger.value,
      })
      scheduler.schedule(parts)
      queueCommit()
    },
    mount(key: string, element: HTMLElement) {
      if (playedKeys.has(key))
        element.style.animation = 'none'
      elements.set(key, element)
      queueCommit()
    },
    unmount(key: string, element: HTMLElement) {
      if (elements.get(key) === element) {
        elements.delete(key)
        previousBatch.delete(key)
      }
      queueCommit()
    },
    dispose() {
      disposed = true
      elements.clear()
      playedKeys.clear()
      previousBatch.clear()
      scheduler.retain(new Set())
    },
  }
}

export type TextAnimationController = ReturnType<typeof createTextAnimationController>
