import type { InlineCodeNode } from '@stream-markdown/core'
import type { VNodeRendererProps } from './types'
import { h } from 'vue'

export function renderInlineCode(props: VNodeRendererProps<InlineCodeNode>) {
  return h('code', {
    'data-stream-markdown': 'inline-code',
    'dir': 'ltr',
    'class': 'text-sm font-mono px-1.5 py-0.5 rounded bg-muted whitespace-normal break-words',
  }, props.node.value)
}
