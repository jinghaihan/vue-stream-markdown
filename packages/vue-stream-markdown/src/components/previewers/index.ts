import type { BuiltinPreviewers } from '@stream-markdown/core'
import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'

export const CODE_PREVIEWERS: Partial<Record<string, Component>> & Record<BuiltinPreviewers, Component> = {
  html: defineAsyncComponent(() => import('./html.vue')),
  mermaid: defineAsyncComponent(() => import('./mermaid.vue')),
}
