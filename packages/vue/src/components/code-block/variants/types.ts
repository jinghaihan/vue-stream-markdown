import type { VNodeRef } from 'vue'

export interface CodeBlockVariantProps {
  collapsed: boolean
  loading: boolean
  maxHeight?: string
  setScrollRef: VNodeRef
}
