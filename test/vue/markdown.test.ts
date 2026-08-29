// @vitest-environment happy-dom
import type { MarkdownElement } from 'vue-stream-markdown'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, markRaw, onMounted, onUnmounted } from 'vue'
import Markdown from '../../packages/vue/src/index.vue'

// These tests exercise Markdown processing, not background UI component loading.
vi.mock('../../packages/vue/src/utils', () => ({
  preloadAsyncComponents: async () => {},
}))

interface MarkdownTestVm {
  getDocument: () => { nodes: unknown[] }
}

interface MarkdownTestWrapper {
  setProps: (props: { content?: string, mode?: 'static' | 'streaming' }) => Promise<void>
}

describe('stream markdown', () => {
  it('renders a Comark document asynchronously', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: '# Heading\n\nParagraph',
        enableAnimate: false,
        mode: 'streaming',
      },
    })

    await flushPromises()

    expect(wrapper.get('h1').text()).toBe('Heading')
    expect(wrapper.get('p').text()).toBe('Paragraph')
    expect((wrapper.vm as unknown as MarkdownTestVm).getDocument().nodes).toHaveLength(2)
    wrapper.unmount()
  })

  it('preserves stable block elements while the tail grows', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: '# Stable\n\nTail',
        mode: 'streaming',
      },
    })
    const testWrapper = wrapper as unknown as MarkdownTestWrapper
    await flushPromises()
    const heading = wrapper.get('h1').element

    await testWrapper.setProps({ content: '# Stable\n\nTail grows' })
    await flushPromises()

    expect(wrapper.get('h1').element).toBe(heading)
    expect(wrapper.get('p').text()).toBe('Tail grows')
    wrapper.unmount()
  })

  it('parses emphasis next to CJK text consistently', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: '**中文加粗。**后文\n\n*日本語の強調。*後文\n\n~~한국어 삭제.~~다음',
        enableAnimate: false,
        mode: 'static',
      },
    })

    await flushPromises()

    expect(wrapper.get('strong').text()).toBe('中文加粗。')
    expect(wrapper.get('em').text()).toBe('日本語の強調。')
    expect(wrapper.get('del').text()).toBe('한국어 삭제.')
    expect(wrapper.text()).not.toContain('**')
    expect(wrapper.text()).not.toContain('~~')
    wrapper.unmount()
  })

  it('does not expose transient math errors while streaming', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: '$$\n\\frac{1}{',
        enableAnimate: false,
        mode: 'streaming',
      },
    })

    await vi.dynamicImportSettled()
    await flushPromises()

    expect(wrapper.find('[data-stream-markdown="error-component"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('passes raw Comark nodes to custom components', async () => {
    let receivedNode: MarkdownElement | undefined
    const Callout = defineComponent({
      inheritAttrs: false,
      props: ['node', 'type'],
      setup(props, { slots }) {
        receivedNode = props.node as MarkdownElement
        return () => h('aside', { 'data-type': props.type }, slots.default?.())
      },
    })
    const wrapper = mount(Markdown, {
      props: {
        components: { callout: markRaw(Callout) },
        content: '::callout{type="info"}\nNotice\n::',
        mode: 'static',
      },
    })

    await flushPromises()

    expect(wrapper.get('aside').attributes('data-type')).toBe('info')
    expect(wrapper.get('aside').text()).toBe('Notice')
    expect(receivedNode?.[0]).toBe('callout')
    wrapper.unmount()
  })

  it('keeps custom components mounted when switching to static mode', async () => {
    let mountCount = 0
    let unmountCount = 0
    const Heading = markRaw(defineComponent({
      inheritAttrs: false,
      setup(_props, { slots }) {
        onMounted(() => mountCount += 1)
        onUnmounted(() => unmountCount += 1)
        return () => h('h1', slots.default?.())
      },
    }))
    const wrapper = mount(Markdown, {
      props: {
        components: { h1: Heading },
        content: '# Heading',
        mode: 'streaming',
      },
    })
    const testWrapper = wrapper as unknown as MarkdownTestWrapper
    await flushPromises()

    expect(mountCount).toBe(1)
    expect(unmountCount).toBe(0)

    await testWrapper.setProps({ mode: 'static' })
    await flushPromises()

    expect(mountCount).toBe(1)
    expect(unmountCount).toBe(0)

    wrapper.unmount()
    expect(unmountCount).toBe(1)
  })

  it('disables only the loading link and restores it in static mode', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: '[Link](https://example.com)',
        mode: 'streaming',
      },
    })
    const testWrapper = wrapper as unknown as MarkdownTestWrapper
    await vi.dynamicImportSettled()
    await flushPromises()
    const link = wrapper.get('[data-stream-markdown="link"]')

    expect(link.attributes('data-stream-markdown-loading')).toBe('true')
    expect(link.classes()).toContain('data-[stream-markdown-loading=true]:no-underline')

    await testWrapper.setProps({ mode: 'static' })
    await flushPromises()

    expect(wrapper.get('[data-stream-markdown="link"]').element).toBe(link.element)
    expect(link.attributes('data-stream-markdown-loading')).toBeUndefined()
    expect(link.classes()).toContain('underline')
    wrapper.unmount()
  })
})
