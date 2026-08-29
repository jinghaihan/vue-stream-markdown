import type { ParagraphNode } from '@stream-markdown/core'
import type { VNodeRenderContext, VNodeRendererProps } from './types'
import { createParagraphModel, resolveNodeTextDirection } from '@stream-markdown/core'
import { h } from 'vue'
import { renderNodeChildren } from './types'

export function renderParagraph(
  props: VNodeRendererProps<ParagraphNode>,
  context: VNodeRenderContext,
) {
  const { lineHeight, marginBottom } = createParagraphModel(props)
  const declarations: string[] = []
  if (marginBottom)
    declarations.push(`margin-bottom:${marginBottom}`)
  if (lineHeight)
    declarations.push(`line-height:${lineHeight}`)

  return h('p', {
    'data-stream-markdown': 'paragraph',
    'dir': resolveNodeTextDirection(props.node, context.direction),
    'class': 'my-4 align-middle transition-[height] duration-[var(--default-transition-duration)] ease',
    'style': declarations.join(';'),
  }, renderNodeChildren(props, context, props.node, props.node.children))
}
