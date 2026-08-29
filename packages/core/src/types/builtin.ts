import type { ANIMATION_SPLITS, ANIMATION_TYPES } from '../constants'

export type BuiltinPreviewers = 'mermaid' | 'html'

export type BuiltinUIComponents
  = | 'Alert'
    | 'Button'
    | 'Caret'
    | 'CodeBlock'
    | 'Dropdown'
    | 'ErrorComponent'
    | 'Icon'
    | 'Image'
    | 'Modal'
    | 'Segmented'
    | 'Spin'
    | 'Table'
    | 'Tooltip'
    | 'ZoomContainer'

export type CaretType = 'block' | 'circle'

export type AnimationType = typeof ANIMATION_TYPES[number] | (string & {})

export type AnimationSplit = typeof ANIMATION_SPLITS[number]
export type ResolvedAnimationSplit = Exclude<AnimationSplit, 'auto'>

export interface SelectOption {
  label: string
  value: string | number
  icon?: string
}

export type UIErrorVariant = 'vanilla' | 'image' | 'mermaid' | 'katex' | 'harden-image' | 'harden-link'
