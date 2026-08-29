import type { StrongNode } from '@stream-markdown/core'
import type { VNodeRenderContext, VNodeRendererProps } from './types'
import { h } from 'vue'
import { renderNodeChildren } from './types'

export function renderStrong(
  props: VNodeRendererProps<StrongNode>,
  context: VNodeRenderContext,
) {
  return h('strong', {
    'data-stream-markdown': 'strong',
    'class': 'font-semibold',
  }, renderNodeChildren(props, context, props.node, props.node.children))
}
