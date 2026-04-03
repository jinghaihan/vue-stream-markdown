export type BuiltinNodeRenderers
  = | 'blockquote'
    | 'break'
    | 'code'
    | 'delete'
    | 'emphasis'
    | 'footnoteDefinition'
    | 'footnoteReference'
    | 'heading'
    | 'html'
    | 'image'
    | 'inlineCode'
    | 'inlineMath'
    | 'link'
    | 'list'
    | 'listItem'
    | 'math'
    | 'paragraph'
    | 'strong'
    | 'table'
    | 'text'
    | 'thematicBreak'
    | 'yaml'

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

export type PlainTextNodeTypes
  = | 'text'
    | 'inlineCode'
    | 'inlineMath'
    | 'strong'
    | 'emphasis'
    | 'delete'
    | 'footnoteReference'
    | 'footnoteDefinition'
    | 'link'
    | 'linkReference'

export interface SelectOption {
  label: string
  value: string | number
  icon?: string
}

export type UIErrorVariant = 'vanilla' | 'image' | 'mermaid' | 'katex' | 'harden-image' | 'harden-link'
