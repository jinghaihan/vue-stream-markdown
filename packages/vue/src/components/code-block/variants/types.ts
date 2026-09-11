import type { VNodeRef } from 'vue'

export interface CodeBlockVariantProps {
  actionCount?: number
  collapsed: boolean
  loading: boolean
  maxHeight?: string
  setScrollRef: VNodeRef
}
