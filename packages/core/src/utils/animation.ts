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
}

export interface TextAnimationScheduler {
  beginPass: (options: TextAnimationPassOptions) => void
  commitPass: () => void
  schedule: (parts: TextPart[]) => ReadonlyMap<string, number>
}

const MAX_BACKLOG_MS = 320
const MIN_STAGGER_MS = 4
const DEFAULT_TEXT_ANIMATION_PACE_MS = 18
const MIN_TEXT_ANIMATION_PACE_MS = 2
const MAX_TEXT_ANIMATION_GAP_MS = 160

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
  let pendingPartKeys = new Set<string>()
  let partBirthTimes = new Map<string, number>()
  let passPace: number | undefined
  let lastRevealAt: number | undefined

  return {
    beginPass(options) {
      enabled = options.enabled
      pendingPartKeys = new Set<string>()
      passPace = undefined
      if (enabled) {
        passTime = timeline.beginPass()
      }
      else {
        passTime = 0
        partBirthTimes = new Map<string, number>()
        lastRevealAt = undefined
        timeline.reset()
      }
    },
    commitPass() {
      partBirthTimes = new Map(
        [...partBirthTimes].filter(([key]) => pendingPartKeys.has(key)),
      )
      if (enabled)
        timeline.commitPass()
    },
    schedule(parts) {
      for (const part of parts)
        pendingPartKeys.add(part.key)

      if (!enabled)
        return new Map<string, number>()

      const newParts = parts.filter(part => (
        !part.whitespace && !partBirthTimes.has(part.key)
      ))
      if (newParts.length > 0) {
        if (passPace === undefined) {
          const gap = lastRevealAt === undefined
            ? 16
            : Math.min(
                Math.max(passTime - lastRevealAt, 16),
                MAX_TEXT_ANIMATION_GAP_MS,
              )
          passPace = Math.min(
            DEFAULT_TEXT_ANIMATION_PACE_MS,
            Math.max(MIN_TEXT_ANIMATION_PACE_MS, gap / newParts.length),
          )
          lastRevealAt = passTime
        }

        const schedule = timeline.take(newParts.length, passPace, passTime)
        newParts.forEach((part, index) => {
          partBirthTimes.set(
            part.key,
            passTime + schedule.baseDelay + index * schedule.step,
          )
        })
      }

      const delays = new Map<string, number>()
      for (const part of parts) {
        const birthAt = partBirthTimes.get(part.key)
        if (birthAt === undefined)
          continue
        delays.set(part.key, Math.round(birthAt - passTime))
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
