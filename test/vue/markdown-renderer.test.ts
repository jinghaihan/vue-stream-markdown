import type { ShallowRef } from 'vue'
// @vitest-environment happy-dom
import type { MarkdownNode as Node } from '../../packages/vue/src/types'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, shallowRef } from 'vue'
import MarkdownNodes from '../../packages/vue/src/components/renderers/markdown'
import { useContext } from '../../packages/vue/src/composables'

function mountNodes(nodes: ShallowRef<Node[]>, components = {}) {
  const Root = defineComponent({
    setup() {
      const { provideContext } = useContext()
      provideContext({
        enableCaret: false,
        mode: 'static',
      })
      return () => h(MarkdownNodes, {
        components,
        nodes: nodes.value,
      })
    },
  })

  return mount(Root)
}

describe('markdown renderer', () => {
  it('renders semantic nodes and bound attributes directly', async () => {
    const nodes = shallowRef<Node[]>([
      ['h2', { id: 'title' }, ['strong', {}, 'Title']],
      ['p', {}, 'Visit ', ['a', { href: 'https://example.com' }, 'example']],
      ['ul', { class: 'contains-task-list' }, [
        'li',
        {},
        ['input', { ':checked': 'true', ':disabled': 'true', 'type': 'checkbox' }],
        'Done',
      ]],
      ['table', {}, ['thead', {}, ['tr', {}, ['th', {}, 'Name']]], ['tbody', {}, ['tr', {}, ['td', {}, 'Value']]]],
    ])
    const wrapper = mountNodes(nodes)
    await vi.dynamicImportSettled()
    await flushPromises()

    expect(wrapper.get('h2').classes()).toContain('text-2xl')
    expect(wrapper.get('strong').text()).toBe('Title')
    expect(wrapper.get('a').attributes()).toMatchObject({
      href: 'https://example.com/',
      rel: 'noreferrer',
      target: '_blank',
    })
    expect(wrapper.get('a').classes()).toContain('underline')
    expect(wrapper.get('input').element).toMatchObject({ checked: true, disabled: true })
    expect(wrapper.get('[data-stream-markdown="table-wrapper"]')).toBeTruthy()
    expect(wrapper.get('th').classes()).toContain('text-left')
    wrapper.unmount()
  })

  it('keeps explicit table alignment over the left-aligned header default', async () => {
    const nodes = shallowRef<Node[]>([
      ['table', {}, ['thead', {}, ['tr', {}, ['th', { style: 'text-align:left' }, 'Left'], ['th', { style: 'text-align:center' }, 'Center'], ['th', { style: 'text-align:right' }, 'Right']]]],
    ])
    const wrapper = mountNodes(nodes)
    await vi.dynamicImportSettled()
    await flushPromises()

    const headers = wrapper.findAll('th')
    expect(headers.map(header => header.attributes('style'))).toEqual([
      'text-align: left;',
      'text-align: center;',
      'text-align: right;',
    ])
    wrapper.unmount()
  })

  it('passes attributes, children, and the raw node to custom components', () => {
    let receivedNode: Node | undefined
    const Callout = defineComponent({
      inheritAttrs: false,
      props: ['node', 'type'],
      setup(props, { slots }) {
        receivedNode = props.node as Node
        return () => h('aside', { 'data-type': props.type }, slots.default?.())
      },
    })
    const node: Node = ['callout', { type: 'info' }, ['strong', {}, 'Notice']]
    const wrapper = mountNodes(shallowRef<Node[]>([node]), { callout: Callout })

    expect(wrapper.get('aside').attributes('data-type')).toBe('info')
    expect(wrapper.get('aside strong').text()).toBe('Notice')
    expect(receivedNode).toBe(node)
  })

  it('preserves reused block elements across incremental documents', async () => {
    const stable: Node = ['p', {}, 'Stable']
    const nodes = shallowRef<Node[]>([stable, ['p', {}, 'Tail']])
    const wrapper = mountNodes(nodes)
    const stableElement = wrapper.findAll('p')[0]!.element

    nodes.value = [stable, ['p', {}, 'Tail grows']]
    await nextTick()

    expect(wrapper.findAll('p')[0]!.element).toBe(stableElement)
    expect(wrapper.findAll('p')[1]!.text()).toBe('Tail grows')
  })
})
