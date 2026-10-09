import type { AnimationSplit, TextPart } from '@stream-markdown/core'
import type { ShallowRef } from 'vue'
import type { StreamMarkdownResolvedContext } from '../../../types'
import { createTextAnimationScheduler, createTextParts } from '@stream-markdown/core'
import { shallowRef } from 'vue'

export function createTextAnimationController(context: StreamMarkdownResolvedContext) {
  const scheduler = createTextAnimationScheduler()
  const elements = new Map<string, HTMLElement>()
  const playedKeys = new Set<string>()
  const previousBatch = new Map<string, HTMLElement>()
  const textRuns = new Map<string, {
    prefix: string
    parts: TextPart[]
    cursor: number
    finished: Set<string>
    revision: ShallowRef<number>
  }>()
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
    applyDelays(delays)
  }

  function applyDelays(delays: ReadonlyMap<string, number>) {
    const compact = context.compactTextAnimations.value
    const sample = compact
      ? [...delays.keys()].map(key => elements.get(key)).find(element => element && element.style.animation !== 'none')
      : undefined
    // Read CSS once before writing delays, avoiding a style flush per character.
    const animationsDisabled = sample && getComputedStyle(sample).animationName === 'none'
    for (const [key, delay] of delays) {
      const element = elements.get(key)
      if (!element)
        continue
      element.style.animationDelay = `${delay}ms`
      element.style.transitionDelay = `${delay}ms`
      playedKeys.add(key)
      previousBatch.set(key, element)
      // With animations disabled by CSS there may be no animationend event.
      if (compact && (animationsDisabled || element.style.animation === 'none'))
        finish(key, element)
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

  function finish(key: string, element: HTMLElement) {
    if (!context.compactTextAnimations.value || elements.get(key) !== element)
      return
    const textKey = key.slice(0, key.lastIndexOf('-'))
    const run = textRuns.get(textKey)
    if (!run)
      return
    run.finished.add(key)
    const previousCursor = run.cursor
    while (run.cursor < run.parts.length) {
      const part = run.parts[run.cursor]!
      if (!part.whitespace && !run.finished.has(part.key))
        break
      run.prefix += part.value
      run.finished.delete(part.key)
      run.cursor++
    }
    if (run.cursor !== previousCursor)
      run.revision.value++
  }

  return {
    compactParts(textKey: string, text: string, split: AnimationSplit) {
      let run = textRuns.get(textKey)
      if (!run) {
        run = { prefix: '', parts: [], cursor: 0, finished: new Set(), revision: shallowRef(0) }
        textRuns.set(textKey, run)
      }
      // Only the block owning this text run rerenders when its prefix advances.
      void run.revision.value
      if (!text.startsWith(run.prefix)) {
        run.prefix = ''
        run.finished.clear()
      }
      let offset = run.prefix.length
      const tail = createTextParts(text.slice(offset), textKey, split).map((part) => {
        const key = `${textKey}-${offset}`
        offset += part.value.length
        return { ...part, key }
      })
      run.parts = tail
      run.cursor = 0
      return { prefix: run.prefix, parts: tail }
    },
    finish,
    retainTextKeys(keys: ReadonlySet<string>) {
      for (const key of textRuns.keys()) {
        if (!keys.has(key))
          textRuns.delete(key)
      }
    },
    schedule(parts: TextPart[]) {
      scheduler.beginPass({
        enabled: context.enableAnimate.value,
        stagger: context.animationStagger.value,
      })
      scheduler.schedule(parts)
      queueCommit()
    },
    mount(key: string, element: HTMLElement) {
      const textKey = key.slice(0, key.lastIndexOf('-'))
      const offset = Number(key.slice(key.lastIndexOf('-') + 1))
      if (playedKeys.has(key) || offset < (textRuns.get(textKey)?.prefix.length ?? 0))
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
      textRuns.clear()
      scheduler.retain(new Set())
    },
  }
}

export type TextAnimationController = ReturnType<typeof createTextAnimationController>
