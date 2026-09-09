// @vitest-environment happy-dom
import type { UseStreamSmoothingReturn } from 'vue-stream-markdown'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, markRaw, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useStreamSmoothing } from '../../packages/vue/src/composables'
import Markdown from '../../packages/vue/src/index.vue'

interface MarkdownTestWrapper {
  setProps: (props: { content?: string, mode?: 'static' | 'streaming' }) => Promise<void>
}

vi.mock('../../packages/vue/src/utils', async () => ({
  ...await vi.importActual('../../packages/vue/src/utils'),
  preloadAsyncComponents: () => Promise.resolve(),
}))

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useStreamSmoothing', () => {
  it('waits for each consumer pass before exposing another prefix', async () => {
    vi.useFakeTimers()
    let now = 0
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    const content = ref('')
    const mode = ref<'static' | 'streaming'>('streaming')
    let smoothing!: UseStreamSmoothingReturn
    const wrapper = mount(defineComponent({
      setup() {
        smoothing = useStreamSmoothing({ content, enabled: true, mode })
        return () => h('div', smoothing.frame.value.content)
      },
    }))

    now = 16
    content.value = 'abcdefghijklmnopqrstuvwxyz'
    await nextTick()
    expect(wrapper.text()).toBe('')

    smoothing.acknowledge()
    now = 64
    await vi.advanceTimersByTimeAsync(48)
    const firstPrefix = wrapper.text()
    expect(firstPrefix).toBeTruthy()
    expect('abcdefghijklmnopqrstuvwxyz'.startsWith(firstPrefix)).toBe(true)
    expect(firstPrefix).not.toBe('abcdefghijklmnopqrstuvwxyz')

    now = 80
    content.value += '0123456789'
    await nextTick()
    await vi.advanceTimersByTimeAsync(500)
    expect(wrapper.text()).toBe(firstPrefix)

    now = 128
    smoothing.acknowledge()
    await vi.advanceTimersByTimeAsync(1)
    expect(wrapper.text().length).toBeGreaterThan(firstPrefix.length)
    wrapper.unmount()
  })

  it('drains the latest target before leaving streaming mode', async () => {
    vi.useFakeTimers()
    let now = 0
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    const content = ref('Start')
    const mode = ref<'static' | 'streaming'>('streaming')
    let smoothing!: UseStreamSmoothingReturn
    const wrapper = mount(defineComponent({
      setup() {
        smoothing = useStreamSmoothing({ content, enabled: true, mode })
        return () => h('div', `${smoothing.frame.value.mode}:${smoothing.frame.value.content}`)
      },
    }))

    now = 16
    content.value = 'Start and finish'
    await nextTick()
    mode.value = 'static'
    await nextTick()
    expect(wrapper.text()).toBe('streaming:Start')

    smoothing.acknowledge()
    for (let index = 0; index < 20 && smoothing.frame.value.content !== 'Start and finish'; index++) {
      now += 100
      await vi.advanceTimersByTimeAsync(100)
      expect(smoothing.frame.value.mode).toBe('streaming')
      smoothing.acknowledge()
    }

    expect(wrapper.text()).toBe('streaming:Start and finish')
    smoothing.acknowledge()
    await nextTick()
    expect(wrapper.text()).toBe('static:Start and finish')
    wrapper.unmount()
  })

  it('keeps completed components mounted while draining into static mode', async () => {
    vi.useFakeTimers()
    let now = 0
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    let mountCount = 0
    let unmountCount = 0
    const Heading = markRaw(defineComponent({
      setup(_props, { slots }) {
        onMounted(() => mountCount++)
        onUnmounted(() => unmountCount++)
        return () => h('h1', slots.default?.())
      },
    }))
    const wrapper = mount(Markdown, {
      props: {
        components: { h1: Heading },
        content: '# Stable heading\n\nTail',
        mode: 'streaming',
      },
    })
    const testWrapper = wrapper as unknown as MarkdownTestWrapper

    await flushPromises()
    const heading = wrapper.get('h1').element

    now = 16
    await testWrapper.setProps({ content: `# Stable heading\n\n${'Growing tail. '.repeat(8)}` })
    await testWrapper.setProps({ mode: 'static' })

    for (let pass = 0; pass < 20; pass++) {
      now += 100
      await vi.advanceTimersByTimeAsync(100)
      await flushPromises()
    }

    expect(wrapper.get('h1').element).toBe(heading)
    expect(mountCount).toBe(1)
    expect(unmountCount).toBe(0)

    wrapper.unmount()
    expect(unmountCount).toBe(1)
  })
})
