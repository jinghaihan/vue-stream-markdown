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

  it('keeps large batches in strict order', () => {
    const timeline = createAnimationTimeline({ now: () => 1000 })
    const now = timeline.beginPass()
    const schedule = timeline.take(20, 40, now)
    const finalDelay = schedule.baseDelay + 19 * schedule.step

    expect(schedule.step).toBe(40)
    expect(finalDelay).toBe(760)
    expect(timeline.take(1, 40, now).baseDelay).toBe(800)
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

    scheduler.schedule(createTextParts('Hello world', 'latin'))
    scheduler.schedule(createTextParts('你好', 'cjk'))
    const delays = scheduler.commitPass()
    expect([...delays.values()]).toEqual([0, 0, 13, 27, 40])
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
    expect(delays.has('node-2')).toBe(false)
    expect([...scheduler.commitPass().values()]).toEqual([0, 10])
  })

  it('can disable scheduling without disabling entry animations', () => {
    const scheduler = createScheduler(() => 1000)
    scheduler.beginPass({ enabled: false, stagger: 40 })
    expect(scheduler.schedule(createTextParts('Hello world', 'node')).size).toBe(0)

    scheduler.beginPass({ enabled: true, stagger: 0 })
    scheduler.schedule(createTextParts('Hello world', 'node'))
    const delays = scheduler.commitPass()
    expect(delays.get('node-0')).toBe(0)
    expect(delays.get('node-6')).toBe(0)
  })

  it('creates an independent sequence for every renderer instance', () => {
    const first = createScheduler(() => 1000)
    const second = createScheduler(() => 1000)
    first.beginPass({ enabled: true, stagger: 40 })
    second.beginPass({ enabled: true, stagger: 40 })

    first.schedule(createTextParts('First', 'node'))
    second.schedule(createTextParts('Second', 'node'))
    expect(first.commitPass().get('node-0')).toBe(0)
    expect(second.commitPass().get('node-0')).toBe(0)
  })

  it('remembers skipped stable blocks until their elements are removed', () => {
    const scheduler = createScheduler(() => 1000)
    const stable = createTextParts('你好', 'stable')
    scheduler.beginPass({ enabled: true, stagger: 40 })
    scheduler.schedule(stable)
    scheduler.commitPass()
    scheduler.beginPass({ enabled: true, stagger: 40 })
    scheduler.schedule(createTextParts('尾部', 'tail'))
    scheduler.commitPass()
    scheduler.beginPass({ enabled: true, stagger: 40 })
    expect([...scheduler.schedule(stable).values()]).toEqual([0, 40])
    expect(scheduler.commitPass().size).toBe(0)
    scheduler.retain(new Set())
    scheduler.schedule(stable)
    expect(scheduler.commitPass().size).toBe(2)
  })

  it('does not accumulate waiting time under character-by-character CJK input', () => {
    let now = 1000
    const scheduler = createScheduler(() => now)
    let text = ''
    for (const char of 'これは斜体のテキストです（括弧付き）。这个句子继续也没问题。') {
      now += 16
      text += char
      scheduler.beginPass({ enabled: true, stagger: 40 })
      scheduler.schedule(createTextParts(text, 'node', 'char'))
      expect([...scheduler.commitPass().values()]).toEqual([0])
    }
  })

  it('bounds a large final batch and orders it by the mounted document', () => {
    const scheduler = createScheduler(() => 1000)
    scheduler.beginPass({ enabled: true, stagger: 40 })
    scheduler.schedule(createTextParts('脚注', 'footnote'))
    scheduler.schedule(createTextParts('正文'.repeat(100), 'body'))
    const delays = scheduler.commitPass((left, right) => left.localeCompare(right, 'en', { numeric: true }))
    expect(delays.get('body-0')).toBe(0)
    expect(delays.get('footnote-1')).toBe(40)
    expect(delays.size).toBe(202)
  })
})
