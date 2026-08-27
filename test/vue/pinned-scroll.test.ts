// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { isScrollAtBottom, usePinnedScroll } from '../../packages/vue/src/composables'

async function flushScrollWatchers() {
  await nextTick()
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
  const element = wrapper.element as HTMLElement
  Object.defineProperties(element, {
    clientHeight: { configurable: true, get: () => 100 },
    scrollHeight: { configurable: true, get: () => scrollHeight },
  })

  return {
    active,
    contentKey,
    element,
    enabled,
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

    state.element.scrollTop = 200
    state.element.dispatchEvent(new Event('scroll'))
    state.setScrollHeight(1200)
    state.contentKey.value += 1
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
})
