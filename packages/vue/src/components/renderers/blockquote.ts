import type { BlockquoteNode } from '@stream-markdown/core'
import type { VNodeRenderContext, VNodeRendererProps } from './types'
import { resolveNodeTextDirection } from '@stream-markdown/core'
import { h } from 'vue'
import { renderNodeChildren } from './types'

export function renderBlockquote(
  props: VNodeRendererProps<BlockquoteNode>,
  context: VNodeRenderContext,
) {
  return h('blockquote', {
    'data-stream-markdown': 'blockquote',
    'dir': resolveNodeTextDirection(props.node, context.direction),
    'class': 'text-muted-foreground mx-0 my-4 pl-4 border-l-4 border-l-muted-foreground/30 italic relative [&_p]:mb-0',
  }, renderNodeChildren(props, context, props.node, props.node.children))
}
