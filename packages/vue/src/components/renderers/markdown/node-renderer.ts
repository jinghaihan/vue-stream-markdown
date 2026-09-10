import type { CompletionInfo, Node } from '@markmend/parser'
import type { TextAnimationScheduler } from '@stream-markdown/core'
import type { VNodeChild } from 'vue'
import type { MarkdownComponents, StreamMarkdownResolvedContext } from '../../../types'
import { createCommentVNode, defineAsyncComponent, h } from 'vue'
import { BLOCK_STYLES, ELEMENT_STYLES, ORDERED_LIST_STYLES } from './node-styles'
import {
  findLastRenderableIndex,
  resolveAttributes,
  resolveDataAttribute,
  resolveNodeDirection,
} from './node-utils'
import { renderTextNode } from './text-node'

export interface NodeRendererOptions {
  animatedTextKeys: Set<string>
  context: StreamMarkdownResolvedContext
  getCompletionInfo: () => CompletionInfo | undefined
  getComponents: () => MarkdownComponents
  getImageSources: () => string[]
  markTextRendered: (key: string) => void
  textAnimationScheduler: TextAnimationScheduler
}

export interface NodeRenderer {
  renderNode: (
    node: Node,
    loading: boolean,
    path: string,
    hideCaret: boolean,
    orderedListItemNumber?: number,
  ) => VNodeChild
  renderNodes: (
    nodes: Node[],
    loading: boolean,
    parentKey?: string,
    hideCaret?: boolean,
    orderedListStart?: number,
  ) => VNodeChild[]
}

const CodeBlock = defineAsyncComponent(() => import('../code-block.vue'))
const ImageNode = defineAsyncComponent(() => import('../image-node.vue'))
const LinkNode = defineAsyncComponent(() => import('../link-node.vue'))
const MathNode = defineAsyncComponent(() => import('../math-node.vue'))
const TableNode = defineAsyncComponent(() => import('../table-node.vue'))

export function createNodeRenderer(options: NodeRendererOptions): NodeRenderer {
  const { context } = options

  function renderListNode(
    tag: string,
    attrs: Record<string, unknown>,
    className: unknown[],
    children: Node[],
    loading: boolean,
    key: string,
    hideCaret: boolean,
    orderedListItemNumber: number | undefined,
  ): VNodeChild {
    if (tag === 'ol') {
      const hasCustomListItem = Boolean(options.getComponents().li)
      const orderedListClassName = hasCustomListItem
        ? ['leading-6 pl-5 whitespace-normal list-decimal', attrs.class]
        : className
      return h(tag, {
        ...attrs,
        key,
        'class': orderedListClassName,
        'data-stream-markdown': resolveDataAttribute(tag),
      }, renderNodes(
        children,
        loading,
        key,
        hideCaret,
        hasCustomListItem ? undefined : resolveOrderedListStart(attrs),
      ))
    }

    return h(tag, {
      ...attrs,
      key,
      'class': [...className, ORDERED_LIST_STYLES.item],
      'style': [attrs.style, { paddingInlineStart: 0 }],
      'data-stream-markdown': resolveDataAttribute(tag),
    }, [
      h('span', {
        'aria-hidden': 'true',
        'class': ORDERED_LIST_STYLES.marker,
        'data-stream-markdown': 'list-marker',
      }, `${orderedListItemNumber}.`),
      h('div', {
        'class': ORDERED_LIST_STYLES.content,
        'data-stream-markdown': 'list-item-content',
      }, renderNodes(children, loading, key, hideCaret)),
    ])
  }

  function renderNodes(
    nodes: Node[],
    loading: boolean,
    parentKey = 'root',
    hideCaret = false,
    orderedListStart?: number,
  ): VNodeChild[] {
    const lastIndex = findLastRenderableIndex(nodes)
    let nextOrderedListItemNumber = orderedListStart ?? 1
    return nodes.map((node, index) => {
      const orderedListItemNumber = orderedListStart !== undefined && isOrderedListItem(node)
        ? nextOrderedListItemNumber++
        : undefined
      return renderNode(
        node,
        loading && index === lastIndex,
        `${parentKey}-${index}`,
        hideCaret,
        orderedListItemNumber,
      )
    })
  }

  function renderNode(
    node: Node,
    loading: boolean,
    path: string,
    hideCaret: boolean,
    orderedListItemNumber?: number,
  ): VNodeChild {
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

    if (tag === 'ol' || orderedListItemNumber !== undefined)
      return renderListNode(tag, resolvedAttrs, className, children, loading, key, hideCaret, orderedListItemNumber)

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

  return { renderNode, renderNodes }
}

function resolveOrderedListStart(attrs: Record<string, unknown>): number {
  const start = attrs.start
  if (typeof start === 'number' && Number.isInteger(start))
    return start

  if (typeof start === 'string' && /^-?\d+$/.test(start))
    return Number(start)

  return 1
}

function isOrderedListItem(node: Node): boolean {
  return typeof node !== 'string' && node[0] === 'li'
}
