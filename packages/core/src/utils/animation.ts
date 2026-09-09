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
  getCurrentTime: () => number
  getPartState: (key: string) => TextAnimationPartState | undefined
  markPartSettled: (key: string) => void
  schedule: (parts: TextPart[]) => ReadonlyMap<string, number>
}

export interface TextAnimationPartState {
  readonly settled: boolean
  readonly startTime: number
}

interface MutableTextAnimationPartState {
  settled: boolean
  startTime: number
}

interface TextAnimationEntry {
  delay: number
  state: MutableTextAnimationPartState
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
  let committedParts = new Map<string, TextAnimationEntry>()
  let pendingParts = new Map<string, TextAnimationEntry>()

  return {
    beginPass(options) {
      enabled = options.enabled
      stagger = options.stagger
      pendingParts = new Map<string, TextAnimationEntry>()
      if (enabled) {
        passTime = timeline.beginPass()
      }
      else {
        passTime = 0
        timeline.reset()
      }
    },
    commitPass() {
      committedParts = pendingParts
      if (enabled)
        timeline.commitPass()
    },
    getCurrentTime() {
      return passTime
    },
    getPartState(key) {
      return (pendingParts.get(key) ?? committedParts.get(key))?.state
    },
    markPartSettled(key) {
      const committed = committedParts.get(key)
      if (committed)
        committed.state.settled = true

      const pending = pendingParts.get(key)
      if (pending)
        pending.state.settled = true
    },
    schedule(parts) {
      if (!enabled)
        return new Map<string, number>()

      for (const part of parts) {
        const committed = committedParts.get(part.key)
        if (committed)
          pendingParts.set(part.key, { ...committed })
      }

      const newParts = parts.filter(part => (
        !part.whitespace && !pendingParts.has(part.key)
      ))
      const schedule = timeline.take(newParts.length, stagger, passTime)

      newParts.forEach((part, index) => {
        const delay = Math.round(schedule.baseDelay + index * schedule.step)
        pendingParts.set(part.key, {
          delay,
          state: {
            settled: false,
            startTime: passTime + delay,
          },
        })
      })

      let previousEntry: TextAnimationEntry | undefined
      const firstEntry = parts
        .map(part => pendingParts.get(part.key))
        .find(entry => entry && !entry.state.settled)

      for (const part of parts) {
        const entry = pendingParts.get(part.key)
        if (entry) {
          previousEntry = entry
        }
        else if (part.whitespace) {
          const adjacentEntry = previousEntry ?? firstEntry
          pendingParts.set(part.key, {
            delay: adjacentEntry?.delay ?? 0,
            state: {
              settled: true,
              startTime: adjacentEntry?.state.startTime ?? passTime,
            },
          })
        }
      }

      const delays = new Map<string, number>()
      for (const part of parts) {
        const entry = pendingParts.get(part.key)
        if (entry)
          delays.set(part.key, entry.delay)
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
