import type { NodeRenderers } from '../../types'
import { defineAsyncComponent } from 'vue'
import { renderBlockquote } from './blockquote'
import { renderBreak } from './break'
import { renderDelete } from './delete'
import { renderEmphasis } from './emphasis'
import { renderHeading } from './heading'
import { renderInlineCode } from './inline-code'
import { renderList } from './list'
import { renderListItem } from './list-item'
import { renderParagraph } from './paragraph'
import { renderStrong } from './strong'
import { renderText } from './text'
import { renderThematicBreak } from './thematic-break'

export const VNODE_RENDERERS = {
  blockquote: renderBlockquote,
  break: renderBreak,
  delete: renderDelete,
  emphasis: renderEmphasis,
  heading: renderHeading,
  inlineCode: renderInlineCode,
  list: renderList,
  listItem: renderListItem,
  paragraph: renderParagraph,
  strong: renderStrong,
  text: renderText,
  thematicBreak: renderThematicBreak,
} as const

export const COMPONENT_RENDERERS = {
  code: defineAsyncComponent(() => import('./code/index.vue')),
  footnoteDefinition: defineAsyncComponent(() => import('./footnote-definition.vue')),
  footnoteReference: defineAsyncComponent(() => import('./footnote-reference.vue')),
  html: defineAsyncComponent(() => import('./html.vue')),
  image: defineAsyncComponent(() => import('./image.vue')),
  inlineMath: defineAsyncComponent(() => import('./inline-math.vue')),
  link: defineAsyncComponent(() => import('./link.vue')),
  math: defineAsyncComponent(() => import('./math.vue')),
  table: defineAsyncComponent(() => import('./table.vue')),
  yaml: defineAsyncComponent(() => import('./yaml.vue')),
} as const satisfies NodeRenderers
