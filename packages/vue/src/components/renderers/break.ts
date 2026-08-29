import type { BreakNode } from '@stream-markdown/core'
import type { VNodeRendererProps } from './types'
import { h } from 'vue'

export function renderBreak(_props: VNodeRendererProps<BreakNode>) {
  return h('br', { 'data-stream-markdown': 'break' })
}
