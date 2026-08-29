import type { ListItemNode } from '@stream-markdown/core'
import type { VNodeRenderContext, VNodeRendererProps } from './types'
import { createListItemModel, resolveNodeTextDirection } from '@stream-markdown/core'
import { h } from 'vue'
import { renderNodeChildren } from './types'

export function renderListItem(
  props: VNodeRendererProps<ListItemNode>,
  context: VNodeRenderContext,
) {
  const { checked, isTaskListItem } = createListItemModel(props.node)
  const children = renderNodeChildren(props, context, props.node, props.node.children)

  return h('li', {
    'data-stream-markdown': 'list-item',
    'dir': resolveNodeTextDirection(props.node, context.direction),
    'class': 'py-1 pl-1 [&_p]:m-0',
  }, isTaskListItem
    ? h('p', {
        'data-stream-markdown': 'task-list-item',
        'class': '[&_p]:inline-block',
      }, [
        h('input', {
          'data-stream-markdown': 'task-list-item-checkbox',
          'class': 'mr-2 align-middle',
          'type': 'checkbox',
          'checked': checked,
          'disabled': true,
        }),
        ...children,
      ])
    : children)
}
