import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'

export const CODE_PREVIEWERS: Record<string, Component> = {
  html: defineAsyncComponent(() => import('./html.vue')),
  mermaid: defineAsyncComponent(() => import('./mermaid.vue')),
}
