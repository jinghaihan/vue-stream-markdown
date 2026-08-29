// @vitest-environment happy-dom
import type { ParagraphNode, ParsedNode } from 'vue-stream-markdown'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import NodeList from '../../packages/vue/src/components/node-list.vue'
import { useContext } from '../../packages/vue/src/composables'

function createParagraph(value: string): ParagraphNode {
  return {
    type: 'paragraph',
    children: [{ type: 'text', value }],
  }
}

describe('paragraph renderer', () => {
  it('does not rewrite unchanged inline styles', async () => {
    const nodes = ref<ParsedNode[]>([
      createParagraph('First'),
      { type: 'list', ordered: false, spread: false, children: [] },
    ])
    const WrappedParagraph = defineComponent({
      setup() {
        const { provideContext } = useContext()
        provideContext({ mode: 'static' })
        return () => h(NodeList, {
          nodes: nodes.value,
          nodeKey: 'test-block',
          deep: 0,
        })
      },
    })
    const wrapper = mount(WrappedParagraph)
    const paragraph = wrapper.get('p').element
    const observer = new MutationObserver(() => {})
    observer.observe(paragraph, { attributes: true })

    expect(paragraph.style.marginBottom).toBe('0.5rem')
    expect(paragraph.style.lineHeight).toBe('1.75')

    nodes.value = [createParagraph('Second'), nodes.value[1]!]
    await nextTick()

    expect(observer.takeRecords()).toEqual([])
    observer.disconnect()
  })
})
