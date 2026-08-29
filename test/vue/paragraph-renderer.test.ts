// @vitest-environment happy-dom
import type { MarkdownAstParser, NodeRenderers, ParagraphNode } from 'vue-stream-markdown'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Paragraph from '../../packages/vue/src/components/renderers/paragraph.vue'

function createParagraph(value: string): ParagraphNode {
  return {
    type: 'paragraph',
    children: [{ type: 'text', value }],
  }
}

describe('paragraph renderer', () => {
  it('does not rewrite unchanged inline styles', async () => {
    const wrapper = mount(Paragraph, {
      props: {
        markdownParser: {} as MarkdownAstParser,
        nodeRenderers: {} as NodeRenderers,
        node: createParagraph('First'),
        nextNode: { type: 'list', ordered: false, spread: false, children: [] },
        nodeKey: 'paragraph-0',
        deep: 0,
      },
      global: {
        stubs: {
          NodeList: true,
        },
      },
    })
    const paragraph = wrapper.get('p').element
    const observer = new MutationObserver(() => {})
    observer.observe(paragraph, { attributes: true })

    expect(paragraph.style.marginBottom).toBe('0.5rem')
    expect(paragraph.style.lineHeight).toBe('1.75')

    await wrapper.setProps({ node: createParagraph('Second') } as never)
    await nextTick()

    expect(observer.takeRecords()).toEqual([])
    observer.disconnect()
  })
})
