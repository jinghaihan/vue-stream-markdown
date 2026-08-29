import type { ThematicBreakNode } from '@stream-markdown/core'
import type { VNodeRendererProps } from './types'
import { h } from 'vue'

export function renderThematicBreak(_props: VNodeRendererProps<ThematicBreakNode>) {
  return h('hr', {
    'data-stream-markdown': 'thematic-break',
    'class': 'my-6 border-t border-border',
  })
}
