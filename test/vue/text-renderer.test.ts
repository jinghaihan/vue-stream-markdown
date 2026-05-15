// @vitest-environment happy-dom
import type {
  MarkdownAstParser,
  NodeRenderers,
  StreamMarkdownProvideContext,
  TextNode,
} from 'vue-stream-markdown'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import Caret from '../../packages/vue/src/components/caret.vue'
import TextRenderer from '../../packages/vue/src/components/renderers/text.vue'
import { useContext } from '../../packages/vue/src/composables'

function mountText(
  value: string,
  options: {
    animationSplit?: NonNullable<StreamMarkdownProvideContext['animationSplit']>
    hideCaret?: boolean
    loading?: boolean
  } = {},
) {
  const textRendererProps = {
    markdownParser: {} as MarkdownAstParser,
    nodeRenderers: {} as NodeRenderers,
    node: {
      type: 'text',
      value,
      loading: options.loading,
    } as TextNode,
    nodeKey: 'stream-markdown-block-0-text-0',
    deep: 1,
    hideCaret: options.hideCaret,
  }

  const WrappedTextRenderer = defineComponent({
    setup() {
      const { provideContext } = useContext()
      provideContext({
        animationSplit: options.animationSplit,
      })

      return () => h(TextRenderer, textRendererProps)
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
    expect(mountText('Loading', { loading: true }).findComponent(Caret).exists()).toBe(true)
    expect(mountText('Loading', { loading: true, hideCaret: true }).findComponent(Caret).exists()).toBe(false)
  })
})
