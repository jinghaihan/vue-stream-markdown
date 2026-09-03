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
  maxBacklog?: number
  minStagger?: number
  now?: () => number
}

export interface TextAnimationPassOptions {
  enabled: boolean
  stagger: number
}

export interface TextAnimationScheduler {
  beginPass: (options: TextAnimationPassOptions) => void
  commitPass: () => void
  schedule: (parts: TextPart[]) => ReadonlyMap<string, number>
}

const MAX_BACKLOG_MS = 320
const MIN_STAGGER_MS = 4

function defaultNow(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now()
}

export function createAnimationTimeline(
  options: CreateAnimationTimelineOptions = {},
): AnimationTimeline {
  const maxBacklog = options.maxBacklog ?? MAX_BACKLOG_MS
  const minStagger = options.minStagger ?? MIN_STAGGER_MS
  const now = options.now ?? defaultNow
  let committedNextStart = 0
  let pendingNextStart = 0

  return {
    beginPass(currentTime = now()) {
      pendingNextStart = Math.min(
        Math.max(committedNextStart, currentTime),
        currentTime + maxBacklog,
      )
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

      const minimumStep = idealStep === 0
        ? 0
        : Math.min(idealStep, minStagger)
      const start = Math.max(pendingNextStart, currentTime)
      const budgetEnd = currentTime + maxBacklog
      const idealEnd = start + Math.max(0, count - 1) * idealStep
      let step = idealStep

      if (idealEnd > budgetEnd && count > 1) {
        step = start < budgetEnd
          ? Math.max(minimumStep, (budgetEnd - start) / (count - 1))
          : minimumStep
      }

      pendingNextStart = start + count * step
      return {
        baseDelay: Math.max(0, Math.round(start - currentTime)),
        step,
      }
    },
  }
}

export function createTextAnimationScheduler(
  timeline: AnimationTimeline = createAnimationTimeline(),
): TextAnimationScheduler {
  let passTime = 0
  let enabled = false
  let stagger = 0
  let committedPartKeys = new Set<string>()
  let committedPartDelays = new Map<string, number>()
  let pendingPartKeys = new Set<string>()
  let pendingPartDelays = new Map<string, number>()

  return {
    beginPass(options) {
      enabled = options.enabled
      stagger = options.stagger
      pendingPartKeys = new Set<string>()
      pendingPartDelays = new Map<string, number>()
      if (enabled) {
        passTime = timeline.beginPass()
      }
      else {
        passTime = 0
        timeline.reset()
      }
    },
    commitPass() {
      committedPartKeys = pendingPartKeys
      committedPartDelays = pendingPartDelays
      if (enabled)
        timeline.commitPass()
    },
    schedule(parts) {
      for (const part of parts)
        pendingPartKeys.add(part.key)

      if (!enabled)
        return new Map<string, number>()

      const newParts = parts.filter(part => (
        !part.whitespace && !committedPartKeys.has(part.key)
      ))
      const schedule = timeline.take(newParts.length, stagger, passTime)
      const delays = new Map<string, number>()

      for (const part of parts) {
        const committedDelay = committedPartDelays.get(part.key)
        if (committedDelay !== undefined)
          delays.set(part.key, committedDelay)
      }

      newParts.forEach((part, index) => {
        delays.set(part.key, Math.round(schedule.baseDelay + index * schedule.step))
      })

      let previousDelay: number | undefined
      const firstDelay = newParts.length ? delays.get(newParts[0]!.key) : undefined
      for (const part of parts) {
        const delay = delays.get(part.key)
        if (delay !== undefined) {
          previousDelay = delay
        }
        else if (part.whitespace && !committedPartKeys.has(part.key)) {
          delays.set(part.key, previousDelay ?? firstDelay ?? 0)
        }
      }

      for (const [key, delay] of delays)
        pendingPartDelays.set(key, delay)

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
