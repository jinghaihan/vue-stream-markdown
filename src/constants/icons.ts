import { defineAsyncComponent } from 'vue'

/// keep-sorted
export const ICONS = {
  arrowLeft: defineAsyncComponent(() => import('~icons/lucide/arrow-left')),
  check: defineAsyncComponent(() => import('~icons/lucide/check')),
  code: defineAsyncComponent(() => import('~icons/lucide/code')),
  collapse: defineAsyncComponent(() => import('~icons/lucide/chevron-down')),
  copy: defineAsyncComponent(() => import('~icons/lucide/copy')),
  cornerDownLeft: defineAsyncComponent(() => import('~icons/lucide/corner-down-left')),
  download: defineAsyncComponent(() => import('~icons/lucide/download')),
  error: defineAsyncComponent(() => import('~icons/lucide/circle-alert')),
  flipHorizontal: defineAsyncComponent(() => import('~icons/lucide/flip-horizontal')),
  image: defineAsyncComponent(() => import('~icons/lucide/image')),
  link: defineAsyncComponent(() => import('~icons/lucide/link')),
  maximize: defineAsyncComponent(() => import('~icons/lucide/maximize')),
  mermaid: defineAsyncComponent(() => import('~icons/catppuccin/mermaid')),
  minimize: defineAsyncComponent(() => import('~icons/lucide/minimize')),
  preview: defineAsyncComponent(() => import('~icons/lucide/eye')),
  rotateLeft: defineAsyncComponent(() => import('~icons/lucide/rotate-ccw-square')),
  zoomIn: defineAsyncComponent(() => import('~icons/lucide/zoomIn')),
  zoomOut: defineAsyncComponent(() => import('~icons/lucide/zoomOut')),
} as const
