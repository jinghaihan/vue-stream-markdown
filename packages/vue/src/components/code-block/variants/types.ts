import type { VNodeRef } from 'vue'

export interface CodeBlockVariantProps {
  actionCount?: number
  collapsed: boolean
  loading: boolean
  maxHeight?: string
  stickyHeader: boolean
  setScrollRef: VNodeRef
}
