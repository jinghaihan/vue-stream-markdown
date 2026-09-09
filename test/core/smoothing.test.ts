import { createStreamSmoother } from '@stream-markdown/core'
import { describe, expect, it } from 'vitest'

describe('stream smoothing', () => {
  it('reveals append-only input in paced prefixes', () => {
    let now = 0
    const smoother = createStreamSmoother('', { now: () => now })

    now = 16
    expect(smoother.update('abcdefghijklmnopqrstuvwxyz')).toBe('pending')
    expect(smoother.take()).toBeUndefined()

    now = 64
    const first = smoother.take()
    expect(first).toBeTruthy()
    expect('abcdefghijklmnopqrstuvwxyz'.startsWith(first!)).toBe(true)
    expect(first).not.toBe('abcdefghijklmnopqrstuvwxyz')

    now = 500
    while (smoother.hasPending()) {
      now += 48
      smoother.take()
    }

    expect(smoother.getContent()).toBe('abcdefghijklmnopqrstuvwxyz')
  })

  it('exposes replacements and large appends immediately', () => {
    let now = 0
    const smoother = createStreamSmoother('initial', { now: () => now })

    now = 10
    expect(smoother.update('replacement')).toBe('immediate')
    expect(smoother.getContent()).toBe('replacement')

    now = 20
    const largeAppend = `replacement${'x'.repeat(121)}`
    expect(smoother.update(largeAppend)).toBe('immediate')
    expect(smoother.getContent()).toBe(largeAppend)
    expect(smoother.hasPending()).toBe(false)
  })

  it('never splits a Unicode code point', () => {
    let now = 0
    const smoother = createStreamSmoother('', { now: () => now })
    const target = '🙂'.repeat(30)

    now = 16
    smoother.update(target)
    now = 64

    const first = smoother.take()
    expect(first).toBeTruthy()
    expect(first?.endsWith('🙂')).toBe(true)
    expect(target.startsWith(first!)).toBe(true)
  })

  it('resets its pacing state explicitly', () => {
    let now = 0
    const smoother = createStreamSmoother('', { now: () => now })

    now = 16
    smoother.update('pending content')
    expect(smoother.hasPending()).toBe(true)

    now = 32
    expect(smoother.reset('final content')).toBe('final content')
    expect(smoother.hasPending()).toBe(false)
    expect(smoother.getNextDelay()).toBe(48)
  })
})
