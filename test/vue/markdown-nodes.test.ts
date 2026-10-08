// @vitest-environment happy-dom
import type { PropType } from 'vue'
import type { MarkdownElement, MarkdownNode } from 'vue-stream-markdown'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h, markRaw, ref, shallowRef } from 'vue'
import { Markdown, MarkdownNodes, useContext } from 'vue-stream-markdown'

vi.mock('../../packages/vue/src/utils', async () => ({
  ...await vi.importActual<typeof import('../../packages/vue/src/utils')>('../../packages/vue/src/utils'),
  preloadAsyncComponents: async () => {},
}))

describe('public MarkdownNodes', () => {
  it('renders updated Comark nodes with stable keys and tail loading state', async () => {
    const nodes = shallowRef<MarkdownNode[]>([
      ['strong', {}, 'Stable'],
      ['strong', {}, 'Tail'],
    ])
    const loading = ref(true)
    const hideCaret = ref(false)
    const Strong = markRaw(defineComponent({
      props: ['nodeKey', 'loading'],
      setup(props, { slots }) {
        return () => h('strong', {
          'data-key': props.nodeKey,
          'data-loading': String(props.loading),
        }, slots.default?.())
      },
    }))
    const Host = defineComponent({
      setup() {
        useContext().provideContext({ enableAnimate: false, enableCaret: true })
        return () => h('div', [h(MarkdownNodes, {
          nodes: nodes.value,
          nodeKey: 'selected',
          components: { strong: Strong },
          loading: loading.value,
          hideCaret: hideCaret.value,
        })])
      },
    })
    const wrapper = mount(Host)
    await vi.dynamicImportSettled()
    await flushPromises()
    const first = wrapper.findAll('strong')[0]!
    const stableElement = first.element
    expect(first.attributes('data-key')).toBe('selected-0-strong')
    expect(first.attributes('data-loading')).toBe('false')
    expect(wrapper.findAll('strong')[1]!.attributes('data-loading')).toBe('true')
    expect(wrapper.find('[data-stream-markdown="caret"]').exists()).toBe(true)

    nodes.value = [nodes.value[0]!, ['strong', {}, 'Changed tail']]
    hideCaret.value = true
    await flushPromises()
    expect(wrapper.findAll('strong')[0]!.element).toBe(stableElement)
    expect(wrapper.findAll('strong')[1]!.text()).toBe('Changed tail')
    expect(wrapper.find('[data-stream-markdown="caret"]').exists()).toBe(false)

    loading.value = false
    await flushPromises()
    expect(wrapper.findAll('strong').map(node => node.attributes('data-loading'))).toEqual(['false', 'false'])
    wrapper.unmount()
  })

  it('inherits component mappings, code extensions, and UI when rendering generated nodes', async () => {
    const highlight = vi.fn(async () => ({ tokens: [[{ content: 'generated', htmlStyle: { color: 'red' } }]] }))
    const Strong = markRaw(defineComponent({
      setup(_props, { slots }) {
        return () => h('strong', { 'data-custom-strong': '' }, slots.default?.())
      },
    }))
    const CodeBlock = markRaw(defineComponent({
      setup(_props, { slots }) {
        return () => h('section', { 'data-custom-code-block': '' }, slots.default?.())
      },
    }))
    const Quote = markRaw(defineComponent({
      props: {
        node: { type: Array as unknown as PropType<MarkdownElement>, required: true },
        nodeKey: String,
        loading: Boolean,
      },
      setup(props) {
        const nodes = computed<MarkdownNode[]>(() => {
          const [, , ...children] = props.node
          return [...children, ['pre', { language: 'js' }, ['code', {}, 'generated']]]
        })
        return () => h('blockquote', [h(MarkdownNodes, { nodes: nodes.value, nodeKey: props.nodeKey, loading: props.loading })])
      },
    }))
    const wrapper = mount(Markdown, {
      props: {
        content: '> **Original**',
        mode: 'static',
        enableAnimate: false,
        isDark: true,
        components: { blockquote: Quote, strong: Strong },
        uiComponents: { CodeBlock },
        codeOptions: { lineNumbers: false },
        extensions: { code: { preload: async () => {}, dispose: () => {}, highlight } },
      },
    })
    await vi.dynamicImportSettled()
    await flushPromises()
    expect(wrapper.get('[data-custom-strong]').text()).toBe('Original')
    expect(wrapper.get('[data-custom-code-block]').text()).toBe('generated')
    expect(highlight).toHaveBeenCalledWith({ code: 'generated', language: 'js', isDark: true })
    expect(wrapper.get('[data-stream-markdown="code-line"] span').attributes('style')).toContain('color: red')
    wrapper.unmount()
  })

  it('inherits completion metadata when rendering an unfinished streaming link', async () => {
    const Quote = markRaw(defineComponent({
      props: {
        node: { type: Array as unknown as PropType<MarkdownElement>, required: true },
        nodeKey: String,
        loading: Boolean,
      },
      setup(props) {
        return () => {
          const [, , ...nodes] = props.node
          return h('blockquote', [h(MarkdownNodes, { nodes, nodeKey: props.nodeKey, loading: props.loading })])
        }
      },
    }))
    const wrapper = mount(Markdown, {
      props: {
        content: '> [Example](https://exa',
        mode: 'streaming',
        enableAnimate: false,
        components: { blockquote: Quote },
      },
    })
    await vi.dynamicImportSettled()
    await flushPromises()
    expect(wrapper.find('[data-stream-markdown="spin"]').exists()).toBe(true)
    expect(wrapper.find('[data-stream-markdown="caret"]').exists()).toBe(false)
    wrapper.unmount()
  })
})
