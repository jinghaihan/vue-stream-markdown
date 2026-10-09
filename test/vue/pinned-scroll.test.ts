// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { isScrollAtBottom, usePinnedScroll } from '../../packages/vue/src/composables'

const frames = new Map<number, FrameRequestCallback>()
const cleanups: (() => void)[] = []

beforeEach(() => {
  let nextFrame = 0
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.set(++nextFrame, callback)
    return nextFrame
  })
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => frames.delete(id))
})

afterEach(() => {
  cleanups.splice(0).forEach(cleanup => cleanup())
  frames.clear()
  vi.restoreAllMocks()
})

async function flushScrollWatchers() {
  await nextTick()
  await nextTick()
  const pending = [...frames.values()]
  frames.clear()
  pending.forEach(callback => callback(0))
  await nextTick()
}

function mountPinnedScroll() {
  const active = ref(true)
  const enabled = ref(true)
  const contentKey = ref(0)
  let scrollHeight = 1000

  const TestComponent = defineComponent({
    setup() {
      const target = ref<HTMLElement>()
      usePinnedScroll({ target, active, enabled, contentKey })
      return () => h('div', { ref: target })
    },
  })

  const wrapper = mount(TestComponent)
  cleanups.push(() => wrapper.unmount())
  const element = wrapper.element as HTMLElement
  const readScrollHeight = vi.fn(() => scrollHeight)
  Object.defineProperties(element, {
    clientHeight: { configurable: true, get: () => 100 },
    scrollHeight: { configurable: true, get: readScrollHeight },
  })

  return {
    active,
    contentKey,
    element,
    enabled,
    readScrollHeight,
    wrapper,
    setScrollHeight(value: number) {
      scrollHeight = value
    },
  }
}

describe('pinned scrolling', () => {
  it('recognizes positions within the bottom threshold', () => {
    expect(isScrollAtBottom({ clientHeight: 100, scrollHeight: 500, scrollTop: 393 })).toBe(true)
    expect(isScrollAtBottom({ clientHeight: 100, scrollHeight: 500, scrollTop: 392 })).toBe(false)
  })

  it('follows new content while pinned and pauses after the user scrolls up', async () => {
    const state = mountPinnedScroll()

    state.contentKey.value += 1
    await flushScrollWatchers()
    expect(state.element.scrollTop).toBe(1000)

    state.setScrollHeight(1200)
    state.contentKey.value += 1
    await nextTick()
    state.element.scrollTop = 200
    state.element.dispatchEvent(new Event('scroll'))
    await flushScrollWatchers()
    expect(state.element.scrollTop).toBe(200)
  })

  it('resumes after returning to the bottom or starting a new stream', async () => {
    const state = mountPinnedScroll()

    state.element.scrollTop = 895
    state.element.dispatchEvent(new Event('scroll'))
    state.setScrollHeight(1100)
    state.contentKey.value += 1
    await flushScrollWatchers()
    expect(state.element.scrollTop).toBe(1100)

    state.element.scrollTop = 100
    state.element.dispatchEvent(new Event('scroll'))
    state.active.value = false
    await flushScrollWatchers()
    state.active.value = true
    await flushScrollWatchers()
    expect(state.element.scrollTop).toBe(1100)
  })

  it('does not change the scroll position while disabled', async () => {
    const state = mountPinnedScroll()
    state.enabled.value = false
    state.element.scrollTop = 250
    state.setScrollHeight(1200)
    state.contentKey.value += 1

    await flushScrollWatchers()
    expect(state.element.scrollTop).toBe(250)
  })

  it('coalesces updates across Vue ticks and reads the latest height once per frame', async () => {
    const state = mountPinnedScroll()
    await nextTick()
    state.setScrollHeight(1200)
    state.contentKey.value += 1
    await nextTick()
    state.setScrollHeight(1600)
    state.contentKey.value += 1
    await nextTick()

    expect(frames.size).toBe(1)
    expect(state.readScrollHeight).not.toHaveBeenCalled()
    await flushScrollWatchers()
    expect(state.readScrollHeight).toHaveBeenCalledTimes(1)
    expect(state.element.scrollTop).toBe(1600)
  })

  it.each(['active', 'enabled'] as const)('rechecks %s before executing a queued scroll', async (option) => {
    const state = mountPinnedScroll()
    await nextTick()
    expect(frames.size).toBe(1)
    state[option].value = false
    await flushScrollWatchers()
    expect(state.readScrollHeight).not.toHaveBeenCalled()
    expect(state.element.scrollTop).toBe(0)
  })

  it('cancels a queued scroll when unmounted', async () => {
    const state = mountPinnedScroll()
    await nextTick()
    expect(frames.size).toBe(1)
    state.wrapper.unmount()
    expect(frames.size).toBe(0)
    await flushScrollWatchers()
    expect(state.readScrollHeight).not.toHaveBeenCalled()
  })
})
