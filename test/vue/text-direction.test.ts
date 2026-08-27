// @vitest-environment happy-dom
import type { Component } from 'vue'
import type {
  MarkdownAstParser,
  NodeRenderers,
  ParsedNode,
  StreamMarkdownProps,
} from 'vue-stream-markdown'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import Heading from '../../packages/vue/src/components/renderers/heading.vue'
import InlineCode from '../../packages/vue/src/components/renderers/inline-code.vue'
import Paragraph from '../../packages/vue/src/components/renderers/paragraph.vue'
import Table from '../../packages/vue/src/components/table.vue'
import { useContext } from '../../packages/vue/src/composables'

function mountRenderer(component: Component, node: ParsedNode, dir: StreamMarkdownProps['dir']) {
  const WrappedRenderer = defineComponent({
    setup() {
      const { provideContext } = useContext()
      provideContext({ dir })

      return () => h(component, {
        markdownParser: {} as MarkdownAstParser,
        nodeRenderers: {} as NodeRenderers,
        node,
        nodeKey: `test-${node.type}`,
        deep: 0,
      })
    },
  })

  return mount(WrappedRenderer)
}

describe('text direction', () => {
  it('detects direction independently for semantic blocks', () => {
    const heading = mountRenderer(Heading, {
      type: 'heading',
      depth: 1,
      children: [{ type: 'text', value: 'שלום עולם' }],
    } as ParsedNode, 'auto')
    const englishParagraph = mountRenderer(Paragraph, {
      type: 'paragraph',
      children: [{ type: 'text', value: 'English paragraph.' }],
    } as ParsedNode, 'auto')
    const persianParagraph = mountRenderer(Paragraph, {
      type: 'paragraph',
      children: [{ type: 'text', value: 'React یک کتابخانه جاوااسکریپت بسیار محبوب است.' }],
    } as ParsedNode, 'auto')

    expect(heading.find('h1').attributes('dir')).toBe('rtl')
    expect(englishParagraph.find('p').attributes('dir')).toBe('ltr')
    expect(persianParagraph.find('p').attributes('dir')).toBe('rtl')
  })

  it('forces a document direction while keeping code left-to-right', () => {
    const paragraph = mountRenderer(Paragraph, {
      type: 'paragraph',
      children: [{ type: 'text', value: 'English paragraph.' }],
    } as ParsedNode, 'rtl')
    const code = mountRenderer(InlineCode, {
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
