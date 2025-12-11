import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'

export * from './previewers'
export * from './renderers'

/// keep-sorted
export const COMMON_COMPONENTS: Record<string, Component> = {
  Button: defineAsyncComponent(() => import('./button.vue')),
  CodeBlock: defineAsyncComponent(() => import('./code-block/index.vue')),
  Dropdown: defineAsyncComponent(() => import('./dropdown.vue')),
  ErrorComponent: defineAsyncComponent(() => import('./error-component.vue')),
  Image: defineAsyncComponent(() => import('./image.vue')),
  Modal: defineAsyncComponent(() => import('./modal.vue')),
  NodeList: defineAsyncComponent(() => import('./node-list.vue')),
  Segmented: defineAsyncComponent(() => import('./segmented.vue')),
  Spin: defineAsyncComponent(() => import('./spin.vue')),
  Table: defineAsyncComponent(() => import('./table.vue')),
  Tooltip: defineAsyncComponent(() => import('./tooltip.vue')),
  ZoomContainer: defineAsyncComponent(() => import('./zoom-container.vue')),
}
