import type { DeleteNode } from '@stream-markdown/core'
import type { VNodeRenderContext, VNodeRendererProps } from './types'
import { h } from 'vue'
import { renderNodeChildren } from './types'

export function renderDelete(
  props: VNodeRendererProps<DeleteNode>,
  context: VNodeRenderContext,
) {
  return h('del', {
    'data-stream-markdown': 'delete',
    'class': 'line-through',
  }, renderNodeChildren(props, context, props.node, props.node.children))
}
