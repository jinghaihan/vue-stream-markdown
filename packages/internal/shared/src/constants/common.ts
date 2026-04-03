import type { BuiltinNodeRenderers, CaretType, HardenOptions, PlainTextNodeTypes } from '../types'

export const CARETS = {
  block: ' ▋',
  circle: ' ●',
} as const satisfies Record<CaretType, string>

export const DEFAULT_HARDEN_OPTIONS: HardenOptions = {
  allowedLinkPrefixes: ['*'],
  allowedImagePrefixes: ['*'],
  allowedProtocols: ['*'],
  allowDataImages: true,
}

export const PLAIN_TEXT_NODES: PlainTextNodeTypes[] = [
  'text',
  'inlineCode',
  'inlineMath',
  'strong',
  'emphasis',
  'delete',
  'footnoteReference',
  'footnoteDefinition',
  'link',
  'linkReference',
]

export const PRELOAD_NODE_RENDERER: BuiltinNodeRenderers[] = [
  'blockquote',
  'delete',
  'emphasis',
  'footnoteDefinition',
  'footnoteReference',
  'heading',
  'image',
  'inlineCode',
  'inlineMath',
  'link',
  'list',
  'listItem',
  'paragraph',
  'strong',
  'table',
  'text',
  'thematicBreak',
  'yaml',
]

export const SHADCN_SCHEMAS = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'border',
  'input',
  'ring',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'sidebar',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring',
] as const
