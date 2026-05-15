import type { HtmlAstElementNode, HtmlAstNode } from '@stream-markdown/core'
import type { Component, PropType, VNodeChild } from 'vue'
import type { HtmlNodeRendererProps } from './types'
import { computed, defineComponent, h } from 'vue'

export type HtmlComponentMap = Record<string, Component>

export interface HtmlNodeRendererOptions {
  transform: (raw: string) => HtmlAstNode[]
  components?: HtmlComponentMap
}

export function createHtmlNodeRenderer(options: HtmlNodeRendererOptions): Component {
  const components = normalizeComponents(options.components)

  return defineComponent({
    name: 'StreamMarkdownHtmlNodeRenderer',
    props: {
      node: {
        type: Object as PropType<HtmlNodeRendererProps['node']>,
        required: true,
      },
    },
    setup(props) {
      const nodes = computed(() => options.transform(props.node.value))
      return () => renderHtmlNodes(nodes.value, components)
    },
  })
}

function renderHtmlNodes(nodes: HtmlAstNode[], components: HtmlComponentMap): VNodeChild[] {
  return nodes.map((node, index) => renderHtmlNode(node, components, index))
}

function renderHtmlNode(node: HtmlAstNode, components: HtmlComponentMap, key: number): VNodeChild {
  if (node.type === 'text')
    return node.value

  const component = components[node.tag]
  const children = renderHtmlNodes(node.children, components)
  if (component) {
    return h(component, {
      ...node.attrs,
      key,
      node,
      tag: node.tag,
    }, {
      default: () => children,
    })
  }

  return h(node.tag, {
    ...node.attrs,
    key,
  }, children)
}

function normalizeComponents(components: HtmlComponentMap = {}): HtmlComponentMap {
  return Object.fromEntries(
    Object.entries(components).map(([tag, component]) => [tag.toLowerCase(), component]),
  )
}

export type {
  HtmlAstElementNode,
  HtmlAstNode,
}
