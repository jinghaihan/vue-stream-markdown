// @vitest-environment happy-dom
import type {
  ParsedNode,
  StreamMarkdownProps,
} from 'vue-stream-markdown'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import NodeList from '../../packages/vue/src/components/node-list.vue'
import Table from '../../packages/vue/src/components/table.vue'
import { useContext } from '../../packages/vue/src/composables'

function mountRenderer(node: ParsedNode, dir: StreamMarkdownProps['dir']) {
  const WrappedRenderer = defineComponent({
    setup() {
      const { provideContext } = useContext()
      provideContext({ dir, mode: 'static' })

      return () => h(NodeList, {
        nodes: [node],
        nodeKey: `test-${node.type}`,
        deep: 0,
      })
    },
  })

  return mount(WrappedRenderer)
}

describe('text direction', () => {
  it('detects direction independently for semantic blocks', () => {
    const heading = mountRenderer({
      type: 'heading',
      depth: 1,
      children: [{ type: 'text', value: 'שלום עולם' }],
    } as ParsedNode, 'auto')
    const englishParagraph = mountRenderer({
      type: 'paragraph',
      children: [{ type: 'text', value: 'English paragraph.' }],
    } as ParsedNode, 'auto')
    const persianParagraph = mountRenderer({
      type: 'paragraph',
      children: [{ type: 'text', value: 'React یک کتابخانه جاوااسکریپت بسیار محبوب است.' }],
    } as ParsedNode, 'auto')

    expect(heading.find('h1').attributes('dir')).toBe('rtl')
    expect(englishParagraph.find('p').attributes('dir')).toBe('ltr')
    expect(persianParagraph.find('p').attributes('dir')).toBe('rtl')
  })

  it('forces a document direction while keeping code left-to-right', () => {
    const paragraph = mountRenderer({
      type: 'paragraph',
      children: [{ type: 'text', value: 'English paragraph.' }],
    } as ParsedNode, 'rtl')
    const code = mountRenderer({
      type: 'inlineCode',
      value: 'const answer = 42',
    } as ParsedNode, 'rtl')

    expect(paragraph.find('p').attributes('dir')).toBe('rtl')
    expect(code.find('code').attributes('dir')).toBe('ltr')
  })

  it('applies auto direction to individual table cells', () => {
    const wrapper = mount(Table, {
      props: {
        headers: ['Name', 'שם'],
        rows: [{ children: ['Hello', 'مرحبا'] }],
        getDirection: (cell: unknown) => /[\u0590-\u08FF]/.test(String(cell)) ? 'rtl' : 'ltr',
      },
    })

    expect(wrapper.findAll('th').map(cell => cell.attributes('dir'))).toEqual(['ltr', 'rtl'])
    expect(wrapper.findAll('td').map(cell => cell.attributes('dir'))).toEqual(['ltr', 'rtl'])
  })
})
