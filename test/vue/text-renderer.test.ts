// @vitest-environment happy-dom
import type { MarkdownAstParser, NodeRenderers, TextNode } from 'vue-stream-markdown'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TextRenderer from '../../packages/vue-stream-markdown/src/components/renderers/text.vue'

function mountText(value: string) {
  return mount(TextRenderer, {
    props: {
      markdownParser: {} as MarkdownAstParser,
      nodeRenderers: {} as NodeRenderers,
      node: {
        type: 'text',
        value,
      } as TextNode,
      nodeKey: 'stream-markdown-block-0-text-0',
      deep: 1,
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
})
