import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'

/// keep-sorted
export const ICONS: Record<string, Component> = {
  check: defineAsyncComponent(() => import('~icons/lucide/check')),
  code: defineAsyncComponent(() => import('~icons/lucide/code')),
  collapse: defineAsyncComponent(() => import('~icons/lucide/chevron-down')),
  copy: defineAsyncComponent(() => import('~icons/lucide/copy')),
  download: defineAsyncComponent(() => import('~icons/lucide/download')),
  error: defineAsyncComponent(() => import('~icons/lucide/circle-alert')),
  image: defineAsyncComponent(() => import('~icons/lucide/image')),
  link: defineAsyncComponent(() => import('~icons/lucide/link')),
  maximize: defineAsyncComponent(() => import('~icons/lucide/maximize')),
  mermaid: defineAsyncComponent(() => import('~icons/catppuccin/mermaid')),
  minimize: defineAsyncComponent(() => import('~icons/lucide/minimize')),
  preview: defineAsyncComponent(() => import('~icons/lucide/eye')),
  zoomIn: defineAsyncComponent(() => import('~icons/lucide/zoomIn')),
  zoomOut: defineAsyncComponent(() => import('~icons/lucide/zoomOut')),
} as const
