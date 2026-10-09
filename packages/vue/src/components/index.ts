import type { BuiltinUIComponents } from '@stream-markdown/core'
import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'

export * from './previewers'
export * from './renderers'

export { default as MarkdownNodes } from './renderers/markdown'

export const UI = {
  Alert: defineAsyncComponent(() => import('./alert.vue')),
  Button: defineAsyncComponent(() => import('./button.vue')),
  Caret: defineAsyncComponent(() => import('./caret.vue')),
  Dropdown: defineAsyncComponent(() => import('./dropdown.vue')),
  ErrorComponent: defineAsyncComponent(() => import('./error-component.vue')),
  Icon: defineAsyncComponent(() => import('./icon.vue')),
  Image: defineAsyncComponent(() => import('./image.vue')),
  Modal: defineAsyncComponent(() => import('./modal.vue')),
  Segmented: defineAsyncComponent(() => import('./segmented.vue')),
  Spin: defineAsyncComponent(() => import('./spin.vue')),
  Tooltip: defineAsyncComponent(() => import('./tooltip.vue')),
  ZoomContainer: defineAsyncComponent(() => import('./zoom-container.vue')),
} as const satisfies Record<BuiltinUIComponents, Component>
