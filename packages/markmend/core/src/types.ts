export interface CompletionOptions {
  /** Escape numeric comparison operators in list items while streaming. @default true */
  comparisonOperators?: boolean
  /** Hide bare `*`, `**`, `_`, `__`, `~`, and `~~` markers while streaming. @default true */
  hideBareFormattingMarkers?: boolean
  singleDollarTextMath?: boolean
}

export type BuiltinCompletionType
  = | 'code'
    | 'comparisonOperators'
    | 'html'
    | 'footnote'
    | 'strong'
    | 'emphasis'
    | 'delete'
    | 'taskList'
    | 'link'
    | 'table'
    | 'inlineMath'
    | 'math'

export type CompletionType = BuiltinCompletionType | (string & {})

export interface CompletionInfo {
  phase?: string
  type: CompletionType
}

export interface CompletionResult {
  completion?: CompletionInfo
  markdown: string
}

export type CompletionContext = CompletionOptions
