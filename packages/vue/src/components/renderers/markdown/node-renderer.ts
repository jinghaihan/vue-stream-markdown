import type { Node } from '@markmend/parser'
import type { VNodeChild } from 'vue'
import type { MarkdownComponents, StreamMarkdownResolvedContext } from '../../../types'
import { createCommentVNode, defineAsyncComponent, h } from 'vue'
import { BLOCK_STYLES, ELEMENT_STYLES } from './node-styles'
import {
  findLastRenderableIndex,
  resolveAttributes,
  resolveDataAttribute,
  resolveNodeDirection,
} from './node-utils'
import { renderTextNode } from './text-node'

const CodeBlock = defineAsyncComponent(() => import('../code-block.vue'))
const ImageNode = defineAsyncComponent(() => import('../image-node.vue'))
const LinkNode = defineAsyncComponent(() => import('../link-node.vue'))
const MathNode = defineAsyncComponent(() => import('../math-node.vue'))
const TableNode = defineAsyncComponent(() => import('../table-node.vue'))

export interface NodeRendererOptions {
  animatedTextKeys: Set<string>
  context: StreamMarkdownResolvedContext
  getComponents: () => MarkdownComponents
  markTextRendered: (key: string) => void
}

export function createNodeRenderer(options: NodeRendererOptions) {
  const { context } = options

  function renderNodes(nodes: Node[], loading: boolean, parentKey = 'root'): VNodeChild[] {
    const lastIndex = findLastRenderableIndex(nodes)
    return nodes.map((node, index) => renderNode(
      node,
      loading && index === lastIndex,
      `${parentKey}-${index}`,
    ))
  }

  function renderNode(node: Node, loading: boolean, path: string): VNodeChild {
    if (typeof node === 'string')
      return renderTextNode(node, loading, path, options)

    const [tag, attrs, ...children] = node
    if (tag === null)
      return createCommentVNode(String(children[0] ?? ''))

    const key = `${path}-${tag}`
    const component = options.getComponents()[tag]
    if (component) {
      return h(component, {
        ...resolveAttributes(attrs),
        key,
        node,
      }, {
        default: () => renderNodes(children, loading, key),
      })
    }

    if (tag === 'pre') {
      return h(CodeBlock, {
        key,
        loading,
        node,
        nodeKey: key,
      })
    }

    if (tag === 'math') {
      return h(MathNode, {
        key,
        loading,
        node,
        nodeKey: key,
      })
    }

    const resolvedAttrs = resolveAttributes(attrs)
    const className = [
      BLOCK_STYLES[tag],
      ELEMENT_STYLES[tag],
      resolvedAttrs.class,
    ]

    if (tag === 'a') {
      return h(LinkNode, {
        key,
        attributes: resolvedAttrs,
        loading,
        node,
        nodeKey: key,
      }, {
        default: () => renderNodes(children, loading, key),
      })
    }

    if (tag === 'img') {
      return h(ImageNode, {
        key,
        loading,
        node,
        nodeKey: key,
      })
    }

    if (tag === 'table') {
      return h(TableNode, {
        key,
        loading,
        node,
        nodeKey: key,
      }, {
        default: () => h('table', {
          ...resolvedAttrs,
          'class': className,
          'data-stream-markdown': 'table',
        }, renderNodes(children, loading, key)),
      })
    }

    return h(tag, {
      ...resolvedAttrs,
      'key': key,
      'class': className,
      'data-stream-markdown': resolveDataAttribute(tag),
      'dir': tag === 'code'
        ? 'ltr'
        : resolvedAttrs.dir ?? resolveNodeDirection(tag, node, context.dir.value),
    }, renderNodes(children, loading, key))
  }

  return renderNodes
}
