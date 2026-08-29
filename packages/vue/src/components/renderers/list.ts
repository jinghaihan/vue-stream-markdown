import type { ListNode } from '@stream-markdown/core'
import type { VNodeRenderContext, VNodeRendererProps } from './types'
import { createListModel } from '@stream-markdown/core'
import { h } from 'vue'
import { renderNodeChildren } from './types'

export function renderList(
  props: VNodeRendererProps<ListNode>,
  context: VNodeRenderContext,
) {
  const { id, tag } = createListModel(props.node)

  return h(tag, {
    'data-stream-markdown': id,
    'class': [
      'leading-6 pl-5 whitespace-normal',
      id === 'ordered-list' ? 'list-decimal' : 'list-disc',
    ],
  }, renderNodeChildren(props, context, props.node, props.node.children))
}
