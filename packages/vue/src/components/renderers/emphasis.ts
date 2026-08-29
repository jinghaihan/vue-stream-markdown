import type { EmphasisNode } from '@stream-markdown/core'
import type { VNodeRenderContext, VNodeRendererProps } from './types'
import { h } from 'vue'
import { renderNodeChildren } from './types'

export function renderEmphasis(
  props: VNodeRendererProps<EmphasisNode>,
  context: VNodeRenderContext,
) {
  return h('em', {
    'data-stream-markdown': 'emphasis',
    'class': 'italic',
  }, renderNodeChildren(props, context, props.node, props.node.children))
}
