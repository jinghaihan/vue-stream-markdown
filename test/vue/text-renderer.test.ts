// @vitest-environment happy-dom
import type { Ref } from 'vue'
import type {
  StreamMarkdownProvideContext,
  TextNode,
} from 'vue-stream-markdown'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import NodeList from '../../packages/vue/src/components/node-list.vue'
import { useContext } from '../../packages/vue/src/composables'

function mountText(
  value: string,
  options: {
    animationSplit?: NonNullable<StreamMarkdownProvideContext['animationSplit']>
    hideCaret?: boolean
    loading?: boolean
    mode?: Ref<'static' | 'streaming'>
  } = {},
) {
  const node = {
    type: 'text',
    value,
    loading: options.loading,
  } as TextNode

  const WrappedTextRenderer = defineComponent({
    setup() {
      const { provideContext } = useContext()
      provideContext({
        animationSplit: options.animationSplit,
        enableCaret: true,
        mode: options.mode,
      })

      return () => h(NodeList, {
        nodes: [node],
        nodeKey: 'stream-markdown-block-0',
        deep: 1,
        hideCaret: options.hideCaret,
      })
    },
  })

  return mount(WrappedTextRenderer)
}

describe('text renderer', () => {
  it('splits animated text into word and whitespace parts', () => {
    const wrapper = mountText('Hello  world')

    expect(wrapper.findAll('[data-stream-markdown="text-word"]').map(node => node.text())).toEqual([
      'Hello',
      'world',
    ])
    expect(wrapper.find('[data-stream-markdown="text-space"]').element.textContent).toBe('  ')
  })

  it('splits animated text into character and whitespace parts', () => {
    const wrapper = mountText('你好 world', { animationSplit: 'char' })

    expect(wrapper.findAll('[data-stream-markdown="text-char"]').map(node => node.text())).toEqual([
      '你',
      '好',
      'w',
      'o',
      'r',
      'l',
      'd',
    ])
    expect(wrapper.find('[data-stream-markdown="text-space"]').element.textContent).toBe(' ')
  })

  it('automatically splits CJK text into characters by default', () => {
    const wrapper = mountText('你好 world')

    expect(wrapper.findAll('[data-stream-markdown="text-char"]').map(node => node.text())).toEqual([
      '你',
      '好',
    ])
    expect(wrapper.findAll('[data-stream-markdown="text-word"]').map(node => node.text())).toEqual(['world'])
  })

  it('does not render the caret when hidden by a parent renderer', () => {
    expect(mountText('Loading', { loading: true }).find('[data-stream-markdown="caret"]').exists()).toBe(true)
    expect(mountText('Loading', { loading: true, hideCaret: true }).find('[data-stream-markdown="caret"]').exists()).toBe(false)
  })

  it('inherits text decorations through animated wrappers', () => {
    const wrapper = mountText('Linked text')
    const text = wrapper.get('[data-stream-markdown="text"]')
    const parts = wrapper.findAll('[data-stream-markdown^="text-"]')

    expect(text.classes()).toContain('[text-decoration:inherit]')
    expect(parts).not.toHaveLength(0)
    expect(parts.every(part => part.classes().includes('[text-decoration:inherit]'))).toBe(true)
  })

  it('keeps the text element when switching to static mode', async () => {
    const mode = ref<'static' | 'streaming'>('streaming')
    const wrapper = mountText('Heading', { mode })
    const textElement = wrapper.get('[data-stream-markdown="text"]').element

    mode.value = 'static'
    await nextTick()

    expect(wrapper.get('[data-stream-markdown="text"]').element).toBe(textElement)
  })
})
