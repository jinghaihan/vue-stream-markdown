// @vitest-environment happy-dom
import { mount, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, markRaw, nextTick, onMounted, onUnmounted } from 'vue'
import Markdown from '../../packages/vue/src/index.vue'

// These tests exercise Markdown processing, not background UI component loading.
vi.mock('../../packages/vue/src/utils', () => ({
  preloadAsyncComponents: async () => {},
}))

interface MarkdownTestVm {
  getProcessedContent: () => string
}

interface MarkdownTestWrapper {
  setProps: (props: { mode: 'static' | 'streaming' }) => Promise<void>
}

describe('stream markdown', () => {
  it('preserves bare formatting markers when configured', () => {
    const wrapper = shallowMount(Markdown, {
      props: {
        content: '*',
        mode: 'streaming',
        preprocessOptions: {
          hideBareFormattingMarkers: false,
        },
      },
    })
    const vm = wrapper.vm as unknown as MarkdownTestVm

    expect(vm.getProcessedContent()).toBe('*')
    wrapper.unmount()
  })

  it('reparses the original content when switching to static mode', async () => {
    const wrapper = shallowMount(Markdown, {
      props: {
        content: '*',
        mode: 'streaming',
      },
    })
    const vm = wrapper.vm as unknown as MarkdownTestVm
    const testWrapper = wrapper as unknown as MarkdownTestWrapper

    expect(vm.getProcessedContent()).toBe('')

    await testWrapper.setProps({ mode: 'static' })
    await nextTick()

    expect(vm.getProcessedContent()).toBe('*')
    wrapper.unmount()
  })

  it('keeps node renderers mounted when switching to static mode', async () => {
    let mountCount = 0
    let unmountCount = 0
    const Heading = markRaw(defineComponent({
      inheritAttrs: false,
      setup() {
        onMounted(() => mountCount += 1)
        onUnmounted(() => unmountCount += 1)
        return () => h('h1', 'Heading')
      },
    }))
    const wrapper = mount(Markdown, {
      props: {
        content: '# Heading',
        mode: 'streaming',
        nodeRenderers: { heading: Heading },
      },
    })
    const testWrapper = wrapper as unknown as MarkdownTestWrapper

    expect(mountCount).toBe(1)
    expect(unmountCount).toBe(0)

    await testWrapper.setProps({ mode: 'static' })
    await nextTick()

    expect(mountCount).toBe(1)
    expect(unmountCount).toBe(0)

    wrapper.unmount()
    expect(unmountCount).toBe(1)
  })
})
