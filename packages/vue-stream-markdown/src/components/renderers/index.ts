import type { BuiltinNodeRenderers } from '@stream-markdown/shared'
import type { Component } from 'vue'
import type { NodeRenderers } from '../../types'
import { defineAsyncComponent } from 'vue'

export const NODE_RENDERERS = {
  blockquote: defineAsyncComponent(() => import('./blockquote.vue')),
  break: defineAsyncComponent(() => import('./break.vue')),
  code: defineAsyncComponent(() => import('./code/index.vue')),
  delete: defineAsyncComponent(() => import('./delete.vue')),
  emphasis: defineAsyncComponent(() => import('./emphasis.vue')),
  footnoteDefinition: defineAsyncComponent(() => import('./footnote-definition.vue')),
  footnoteReference: defineAsyncComponent(() => import('./footnote-reference.vue')),
  heading: defineAsyncComponent(() => import('./heading.vue')),
  html: defineAsyncComponent(() => import('./html.vue')),
  image: defineAsyncComponent(() => import('./image.vue')),
  inlineCode: defineAsyncComponent(() => import('./inline-code.vue')),
  inlineMath: defineAsyncComponent(() => import('./inline-math.vue')),
  link: defineAsyncComponent(() => import('./link.vue')),
  list: defineAsyncComponent(() => import('./list.vue')),
  listItem: defineAsyncComponent(() => import('./list-item.vue')),
  math: defineAsyncComponent(() => import('./math.vue')),
  paragraph: defineAsyncComponent(() => import('./paragraph.vue')),
  strong: defineAsyncComponent(() => import('./strong.vue')),
  table: defineAsyncComponent(() => import('./table.vue')),
  text: defineAsyncComponent(() => import('./text.vue')),
  thematicBreak: defineAsyncComponent(() => import('./thematic-break.vue')),
  yaml: defineAsyncComponent(() => import('./yaml.vue')),
} as const satisfies Record<BuiltinNodeRenderers, Component> & NodeRenderers
