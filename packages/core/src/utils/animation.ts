import type { TextPart } from './text'
import { STREAM_MARKDOWN_PREFIX } from '../constants'

export interface AnimationSchedule {
  baseDelay: number
  step: number
}

export interface AnimationTimeline {
  beginPass: (now?: number) => number
  commitPass: () => void
  reset: () => void
  take: (count: number, stagger: number, now: number) => AnimationSchedule
}

export interface CreateAnimationTimelineOptions {
  now?: () => number
}

export interface TextAnimationPassOptions {
  enabled: boolean
  stagger: number
}

export interface TextAnimationScheduler {
  beginPass: (options: TextAnimationPassOptions) => void
  commitPass: (compareKeys?: (left: string, right: string) => number) => ReadonlyMap<string, number>
  retain: (keys: ReadonlySet<string>) => void
  schedule: (parts: TextPart[]) => ReadonlyMap<string, number>
}

function defaultNow(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now()
}

export function createAnimationTimeline(
  options: CreateAnimationTimelineOptions = {},
): AnimationTimeline {
  const now = options.now ?? defaultNow
  let committedNextStart = 0
  let pendingNextStart = 0

  return {
    beginPass(currentTime = now()) {
      pendingNextStart = Math.max(committedNextStart, currentTime)
      return currentTime
    },
    commitPass() {
      committedNextStart = pendingNextStart
    },
    reset() {
      committedNextStart = 0
      pendingNextStart = 0
    },
    take(count, stagger, currentTime) {
      const idealStep = Math.max(0, stagger)
      if (count <= 0)
        return { baseDelay: 0, step: idealStep }

      const queuedStart = Math.max(pendingNextStart, currentTime)
      pendingNextStart = queuedStart + count * idealStep
      return {
        baseDelay: Math.max(0, Math.round(queuedStart - currentTime)),
        step: idealStep,
      }
    },
  }
}

export function createTextAnimationScheduler(
  timeline: AnimationTimeline = createAnimationTimeline(),
): TextAnimationScheduler {
  let enabled = false
  let stagger = 0
  let lastBatchTime: number | undefined
  const committedPartDelays = new Map<string, number>()
  const pendingParts = new Map<string, TextPart>()

  return {
    beginPass(options) {
      enabled = options.enabled
      stagger = options.stagger
      if (!enabled) {
        pendingParts.clear()
        lastBatchTime = undefined
        timeline.reset()
      }
    },
    commitPass(compareKeys) {
      const delays = new Map<string, number>()
      if (!pendingParts.size)
        return delays

      const now = timeline.beginPass()
      const parts = [...pendingParts.values()]
      if (compareKeys)
        parts.sort((left, right) => compareKeys(left.key, right.key))
      const count = parts.filter(part => !part.whitespace).length
      // A batch fits within the observed arrival cadence, capped by the
      // configured stagger. No waiting time carries into the next batch.
      const window = lastBatchTime === undefined
        ? stagger
        : Math.min(stagger, Math.max(0, now - lastBatchTime))
      const step = count > 1 ? window / (count - 1) : 0
      let index = 0
      let previousDelay = 0
      for (const part of parts) {
        if (!part.whitespace)
          previousDelay = Math.round(index++ * step)
        delays.set(part.key, previousDelay)
        committedPartDelays.set(part.key, previousDelay)
      }
      pendingParts.clear()
      if (count)
        lastBatchTime = now
      return delays
    },
    retain(keys) {
      for (const key of committedPartDelays.keys()) {
        if (!keys.has(key))
          committedPartDelays.delete(key)
      }
      for (const key of pendingParts.keys()) {
        if (!keys.has(key))
          pendingParts.delete(key)
      }
    },
    schedule(parts) {
      const delays = new Map<string, number>()
      if (!enabled)
        return delays
      for (const part of parts) {
        const delay = committedPartDelays.get(part.key)
        if (delay === undefined)
          pendingParts.set(part.key, part)
        else
          delays.set(part.key, delay)
      }
      return delays
    },
  }
}

export function getTransitionName(animation: string): string {
  return `${STREAM_MARKDOWN_PREFIX}-${animation}`
}

export function normalizeAnimationDuration(duration: number | string | undefined): string | undefined {
  if (duration === undefined)
    return undefined
  return typeof duration === 'number' ? `${duration}ms` : duration
}
