// @vitest-environment happy-dom
import type { MarkdownAstParser, NodeRenderers, TextNode } from 'vue-stream-markdown'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Caret from '../../packages/vue-stream-markdown/src/components/caret.vue'
import TextRenderer from '../../packages/vue-stream-markdown/src/components/renderers/text.vue'

function mountText(value: string, options: { hideCaret?: boolean, loading?: boolean } = {}) {
  return mount(TextRenderer, {
    props: {
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
    },
  })
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

  it('does not render the caret when hidden by a parent renderer', () => {
    expect(mountText('Loading', { loading: true }).findComponent(Caret).exists()).toBe(true)
    expect(mountText('Loading', { loading: true, hideCaret: true }).findComponent(Caret).exists()).toBe(false)
  })
})
