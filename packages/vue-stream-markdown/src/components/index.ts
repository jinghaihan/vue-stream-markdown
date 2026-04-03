import type { BuiltinUIComponents } from '@stream-markdown/shared'
import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'

export * from './previewers'
export * from './renderers'

export const UI = {
  Alert: defineAsyncComponent(() => import('./alert.vue')),
  Button: defineAsyncComponent(() => import('./button.vue')),
  Caret: defineAsyncComponent(() => import('./caret.vue')),
  CodeBlock: defineAsyncComponent(() => import('./code-block/index.vue')),
  Dropdown: defineAsyncComponent(() => import('./dropdown.vue')),
  ErrorComponent: defineAsyncComponent(() => import('./error-component.vue')),
  Icon: defineAsyncComponent(() => import('./icon.vue')),
  Image: defineAsyncComponent(() => import('./image.vue')),
  Modal: defineAsyncComponent(() => import('./modal.vue')),
  Segmented: defineAsyncComponent(() => import('./segmented.vue')),
  Spin: defineAsyncComponent(() => import('./spin.vue')),
  Table: defineAsyncComponent(() => import('./table.vue')),
  Tooltip: defineAsyncComponent(() => import('./tooltip.vue')),
  ZoomContainer: defineAsyncComponent(() => import('./zoom-container.vue')),
} as const satisfies Record<BuiltinUIComponents, Component>

export const NodeList = defineAsyncComponent(() => import('./node-list.vue'))
