import type { CaretType, HardenOptions } from '../types'

export const ANIMATION_TYPES = [
  'fade-in',
  'blur-in',
  'slide-up',
] as const

export const DEFAULT_ANIMATION = ANIMATION_TYPES[0]

export const DEFAULT_ANIMATION_STAGGER = 40

export const ANIMATION_SPLITS = [
  'auto',
  'word',
  'char',
] as const

export const DEFAULT_ANIMATION_SPLIT = ANIMATION_SPLITS[0]

export const STREAM_MARKDOWN_PREFIX = 'stream-markdown'
export const DISABLED_TRANSITION_NAME = `${STREAM_MARKDOWN_PREFIX}-disabled`

export const STREAM_MARKDOWN_CSS_VARIABLES = {
  animationDuration: '--stream-markdown-animation-duration',
  defaultTransitionDuration: '--default-transition-duration',
} as const

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
