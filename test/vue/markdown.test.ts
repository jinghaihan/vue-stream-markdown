// @vitest-environment happy-dom
import type { NodeRendererProps } from 'vue-stream-markdown'
import { flushPromises, mount, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, markRaw, nextTick, onMounted, onUnmounted } from 'vue'
import NodeList from '../../packages/vue/src/components/node-list.vue'
import LinkRenderer from '../../packages/vue/src/components/renderers/link.vue'
import TableRenderer from '../../packages/vue/src/components/renderers/table.vue'
import Markdown from '../../packages/vue/src/index.vue'

// These tests exercise Markdown processing, not background UI component loading.
vi.mock('../../packages/vue/src/utils', () => ({
  preloadAsyncComponents: async () => {},
}))

interface MarkdownTestVm {
  getProcessedContent: () => string
}

interface MarkdownTestWrapper {
  setProps: (props: { content?: string, mode?: 'static' | 'streaming' }) => Promise<void>
}

interface TableRendererVm {
  loading: boolean
}

describe('stream markdown', () => {
  it('does not mount node lists for empty streaming blocks', () => {
    const wrapper = mount(Markdown, {
      props: {
        content: '# Heading\n\nParagraph',
        enableAnimate: false,
        mode: 'streaming',
      },
    })
    expect(wrapper.findAllComponents(NodeList)).toHaveLength(2)
    wrapper.unmount()
  })

  it('passes siblings across empty streaming blocks', async () => {
    let nextNode: NodeRendererProps['nextNode']
    const Heading = defineComponent({
      props: ['nextNode'],
      setup(props) {
        return () => {
          nextNode = props.nextNode as NodeRendererProps['nextNode']
          return h('h1', 'Heading')
        }
      },
    })
    const wrapper = mount(Markdown, {
      props: {
        content: '# Heading\n\nParagraph',
        enableAnimate: false,
        mode: 'streaming',
        nodeRenderers: { heading: Heading },
      },
    })
    const testWrapper = wrapper as unknown as MarkdownTestWrapper

    expect(nextNode?.type).toBe('paragraph')
    const initialNextNode = nextNode

    await testWrapper.setProps({ content: '# Heading\n\nParagraph grows' })

    expect(nextNode?.type).toBe('paragraph')
    expect(nextNode).not.toBe(initialNextNode)
    wrapper.unmount()
  })

  it('preserves built-in sibling layout across streaming blocks', () => {
    const wrapper = mount(Markdown, {
      props: {
        content: 'Paragraph\n\n- Item',
        enableAnimate: false,
        mode: 'streaming',
      },
    })

    expect(wrapper.get('p').element.style.marginBottom).toBe('0.5rem')
    wrapper.unmount()
  })

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

  it('clears the final link loading state when switching to static mode', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: '[Link](https://example.com)',
        mode: 'streaming',
        nodeRenderers: {
          link: markRaw(LinkRenderer),
        },
      },
    })
    const testWrapper = wrapper as unknown as MarkdownTestWrapper

    await flushPromises()
    const link = wrapper.get('[data-stream-markdown="link"]')
    expect(link.attributes('data-stream-markdown-loading')).toBe('true')

    await testWrapper.setProps({ mode: 'static' })
    await nextTick()

    expect(wrapper.get('[data-stream-markdown="link"]').element).toBe(link.element)
    expect(link.attributes('data-stream-markdown-loading')).toBe('false')
    wrapper.unmount()
  })

  it('clears the final table loading state when switching to static mode', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: '| Header |\n| --- |\n| Cell |',
        mode: 'streaming',
        controls: false,
        nodeRenderers: {
          table: markRaw(TableRenderer),
        },
      },
    })
    const testWrapper = wrapper as unknown as MarkdownTestWrapper

    await flushPromises()
    const table = wrapper.getComponent(TableRenderer)
    const tableVm = table.vm as unknown as TableRendererVm
    expect(tableVm.loading).toBe(true)

    await testWrapper.setProps({ mode: 'static' })
    await nextTick()
    await flushPromises()

    expect(tableVm.loading).toBe(false)
    wrapper.unmount()
  })
})
