import type { CompletionInfo, Node } from '@markmend/parser'
import type { TextAnimationScheduler } from '@stream-markdown/core'
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
  getCompletionInfo: () => CompletionInfo | undefined
  getComponents: () => MarkdownComponents
  getImageSources: () => string[]
  markTextRendered: (key: string) => void
  textAnimationScheduler: TextAnimationScheduler
}

export function createNodeRenderer(options: NodeRendererOptions) {
  const { context } = options

  function renderNodes(
    nodes: Node[],
    loading: boolean,
    parentKey = 'root',
    hideCaret = false,
  ): VNodeChild[] {
    const lastIndex = findLastRenderableIndex(nodes)
    return nodes.map((node, index) => renderNode(
      node,
      loading && index === lastIndex,
      `${parentKey}-${index}`,
      hideCaret,
    ))
  }

  function renderNode(node: Node, loading: boolean, path: string, hideCaret: boolean): VNodeChild {
    if (typeof node === 'string')
      return renderTextNode(node, loading && !hideCaret, path, options)

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
        default: () => renderNodes(children, loading, key, hideCaret),
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
      const completion = options.getCompletionInfo()
      const waitingForDestination = loading
        && completion?.type === 'link'
        && completion.phase === 'destination'
      return h(LinkNode, {
        key,
        attributes: resolvedAttrs,
        loading,
        node,
        nodeKey: key,
        waitingForDestination,
      }, {
        default: () => renderNodes(
          children,
          loading,
          key,
          hideCaret || waitingForDestination,
        ),
      })
    }

    if (tag === 'img') {
      return h(ImageNode, {
        key,
        loading,
        node,
        nodeKey: key,
        sources: options.getImageSources(),
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
        }, renderNodes(children, loading, key, true)),
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
    }, renderNodes(children, loading, key, hideCaret))
  }

  return renderNodes
}
