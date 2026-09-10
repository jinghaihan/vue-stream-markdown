import {
  createAnimationTimeline,
  createTextAnimationScheduler,
  createTextParts,
} from '@stream-markdown/core'
import { describe, expect, it } from 'vitest'

function createScheduler(now: () => number) {
  return createTextAnimationScheduler(createAnimationTimeline({ now }))
}

describe('animation timeline', () => {
  it('serializes animation units across sibling batches', () => {
    const timeline = createAnimationTimeline({ now: () => 1000 })
    const now = timeline.beginPass()

    expect(timeline.take(3, 40, now)).toEqual({ baseDelay: 0, step: 40 })
    expect(timeline.take(2, 40, now)).toEqual({ baseDelay: 120, step: 40 })
  })

  it('compresses large batches to the backlog budget', () => {
    const timeline = createAnimationTimeline({ now: () => 1000 })
    const now = timeline.beginPass()
    const schedule = timeline.take(20, 40, now)
    const finalDelay = schedule.baseDelay + 19 * schedule.step

    expect(schedule.step).toBeGreaterThanOrEqual(4)
    expect(finalDelay).toBeCloseTo(320)
  })

  it('drops stale backlog and can be reset', () => {
    let now = 1000
    const timeline = createAnimationTimeline({ now: () => now })
    const firstPass = timeline.beginPass()
    timeline.take(20, 40, firstPass)
    timeline.commitPass()

    now = 2000
    const caughtUpPass = timeline.beginPass()
    expect(timeline.take(1, 40, caughtUpPass).baseDelay).toBe(0)

    timeline.commitPass()
    timeline.reset()
    expect(timeline.take(1, 40, timeline.beginPass()).baseDelay).toBe(0)
  })

  it('shares one sequence across Latin and CJK text nodes', () => {
    const scheduler = createScheduler(() => 1000)
    scheduler.beginPass({ enabled: true, stagger: 40 })

    const latin = scheduler.schedule(createTextParts('Hello world', 'latin'))
    const cjk = scheduler.schedule(createTextParts('你好', 'cjk'))

    expect(latin.get('latin-0')).toBe(0)
    expect(latin.get('latin-5')).toBe(0)
    expect(latin.get('latin-6')).toBe(40)
    expect(cjk.get('cjk-0')).toBe(80)
    expect(cjk.get('cjk-1')).toBe(120)
  })

  it('keeps committed delays stable and schedules only newly inserted units', () => {
    let now = 1000
    const scheduler = createScheduler(() => now)
    scheduler.beginPass({ enabled: true, stagger: 40 })
    scheduler.schedule(createTextParts('你好', 'node'))
    scheduler.commitPass()

    now = 1010
    scheduler.beginPass({ enabled: true, stagger: 40 })
    const delays = scheduler.schedule(createTextParts('你好世界', 'node'))

    expect(delays.get('node-0')).toBe(0)
    expect(delays.get('node-1')).toBe(40)
    expect(delays.get('node-2')).toBe(70)
    expect(delays.get('node-3')).toBe(110)
  })

  it('can disable scheduling without disabling entry animations', () => {
    const scheduler = createScheduler(() => 1000)
    scheduler.beginPass({ enabled: false, stagger: 40 })
    expect(scheduler.schedule(createTextParts('Hello world', 'node')).size).toBe(0)

    scheduler.beginPass({ enabled: true, stagger: 0 })
    const delays = scheduler.schedule(createTextParts('Hello world', 'node'))
    expect(delays.get('node-0')).toBe(0)
    expect(delays.get('node-6')).toBe(0)
  })

  it('creates an independent sequence for every renderer instance', () => {
    const first = createScheduler(() => 1000)
    const second = createScheduler(() => 1000)
    first.beginPass({ enabled: true, stagger: 40 })
    second.beginPass({ enabled: true, stagger: 40 })

    expect(first.schedule(createTextParts('First', 'node')).get('node-0')).toBe(0)
    expect(second.schedule(createTextParts('Second', 'node')).get('node-0')).toBe(0)
  })
})
