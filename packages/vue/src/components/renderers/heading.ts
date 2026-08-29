import type { HeadingNode } from '@stream-markdown/core'
import type { VNodeRenderContext, VNodeRendererProps } from './types'
import { createHeadingModel, resolveNodeTextDirection } from '@stream-markdown/core'
import { h } from 'vue'
import { renderNodeChildren } from './types'

export function renderHeading(
  props: VNodeRendererProps<HeadingNode>,
  context: VNodeRenderContext,
) {
  const { depth, id, tag } = createHeadingModel(props.node)
  const sizeClass = depth === 1
    ? 'text-3xl'
    : depth === 2
      ? 'text-2xl'
      : depth === 3
        ? 'text-xl'
        : depth === 4
          ? 'text-lg'
          : depth === 5
            ? 'text-base'
            : 'text-sm'

  return h(tag, {
    'data-stream-markdown': id,
    'dir': resolveNodeTextDirection(props.node, context.direction),
    'class': ['font-semibold mb-2 mt-6', sizeClass],
  }, renderNodeChildren(props, context, props.parentNode, props.node.children))
}
