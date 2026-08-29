// @vitest-environment happy-dom
import type { Ref } from 'vue'
import type { MarkdownAstParser, NodeRendererProps, NodeRenderers, ParsedNode, StreamMarkdownProps, TextNode } from 'vue-stream-markdown'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import NodeList from '../../packages/vue/src/components/node-list.vue'
import { useContext } from '../../packages/vue/src/composables'

function mountNodeList(
  nodes: Ref<ParsedNode[]>,
  options: {
    dir?: StreamMarkdownProps['dir']
    mode?: Ref<'static' | 'streaming'>
    nodeRenderers?: NodeRenderers
  } = {},
) {
  const WrappedNodeList = defineComponent({
    setup() {
      const { provideContext } = useContext()
      provideContext({
        dir: options.dir,
        mode: options.mode ?? ref<'static' | 'streaming'>('static'),
        nodeRenderers: options.nodeRenderers,
      })

      return () => h(NodeList, {
        markdownParser: {} as MarkdownAstParser,
        nodes: nodes.value,
        nodeKey: 'test-block',
        deep: 0,
      })
    },
  })

  return mount(WrappedNodeList)
}

describe('vnode rendering', () => {
  it('renders simple built-in nodes with their existing semantics', () => {
    const nodes = ref<ParsedNode[]>([
      {
        type: 'heading',
        depth: 2,
        children: [
          { type: 'strong', children: [{ type: 'text', value: 'Title' }] },
          { type: 'text', value: ' ' },
          { type: 'emphasis', children: [{ type: 'text', value: 'text' }] },
        ],
      },
      {
        type: 'blockquote',
        children: [{
          type: 'paragraph',
          children: [
            { type: 'text', value: 'שלום ' },
            { type: 'delete', children: [{ type: 'text', value: 'old' }] },
            { type: 'break' },
            { type: 'inlineCode', value: 'const value = 1' },
          ],
        }],
      },
      {
        type: 'list',
        ordered: false,
        spread: false,
        children: [{
          type: 'listItem',
          checked: true,
          spread: false,
          children: [{ type: 'paragraph', children: [{ type: 'text', value: 'Done' }] }],
        }],
      },
      { type: 'thematicBreak' },
    ] as ParsedNode[])
    const wrapper = mountNodeList(nodes, { dir: 'auto' })

    expect(wrapper.get('h2').attributes('data-stream-markdown')).toBe('heading-2')
    expect(wrapper.get('h2').classes()).toContain('text-2xl')
    expect(wrapper.get('strong').text()).toBe('Title')
    expect(wrapper.get('em').text()).toBe('text')
    expect(wrapper.get('blockquote').attributes('dir')).toBe('rtl')
    expect(wrapper.get('del').text()).toBe('old')
    expect(wrapper.get('br').attributes('data-stream-markdown')).toBe('break')
    expect(wrapper.get('code').attributes('dir')).toBe('ltr')
    expect(wrapper.get('ul').attributes('data-stream-markdown')).toBe('task-list')
    expect(wrapper.get('input[type="checkbox"]').element).toMatchObject({ checked: true, disabled: true })
    expect(wrapper.get('hr').attributes('data-stream-markdown')).toBe('thematic-break')
  })

  it('keeps custom renderers on the component path', () => {
    const received = ref<NodeRendererProps>()
    const CustomHeading = defineComponent({
      inheritAttrs: false,
      props: ['node', 'nodeKey', 'prevNode', 'nextNode', 'deep'],
      setup(props) {
        received.value = props as unknown as NodeRendererProps
        return () => h('section', { 'data-custom-heading': '' }, props.nodeKey as string)
      },
    })
    const nodes = ref<ParsedNode[]>([
      { type: 'heading', depth: 1, children: [{ type: 'text', value: 'Custom' }] },
      { type: 'paragraph', children: [{ type: 'text', value: 'Next' }] },
    ] as ParsedNode[])
    const wrapper = mountNodeList(nodes, {
      nodeRenderers: {
        heading: CustomHeading,
      },
    })

    expect(wrapper.get('[data-custom-heading]').text()).toBe('test-block-heading-0')
    expect(received.value?.node.type).toBe('heading')
    expect(received.value?.nextNode?.type).toBe('paragraph')
    expect(received.value?.deep).toBe(0)
  })

  it('keeps stable elements while streaming content grows', async () => {
    const mode = ref<'static' | 'streaming'>('streaming')
    const nodes = ref<ParsedNode[]>([
      {
        type: 'heading',
        depth: 1,
        children: [{ type: 'text', value: 'Stable' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'Growing', loading: true } as TextNode],
      },
    ] as ParsedNode[])
    const wrapper = mountNodeList(nodes, { mode })
    const heading = wrapper.get('h1').element
    const text = wrapper.get('p [data-stream-markdown="text"]').element

    nodes.value = [
      nodes.value[0]!,
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'Growing text', loading: true } as TextNode],
      },
    ]
    await nextTick()

    expect(wrapper.get('h1').element).toBe(heading)
    expect(wrapper.get('p [data-stream-markdown="text"]').element).toBe(text)

    mode.value = 'static'
    await nextTick()

    expect(wrapper.get('h1').element).toBe(heading)
    expect(wrapper.get('p [data-stream-markdown="text"]').element).toBe(text)
  })
})
