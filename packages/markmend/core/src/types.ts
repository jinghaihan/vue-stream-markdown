export interface CompletionOptions {
  /** Escape numeric comparison operators in list items while streaming. @default true */
  comparisonOperators?: boolean
  /** Hide bare `*`, `**`, `_`, `__`, `~`, and `~~` markers while streaming. @default true */
  hideBareFormattingMarkers?: boolean
  /** Override one or more built-in completion steps. */
  completionSteps?: CompletionSteps
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

export type CompletionStep = (content: string, context?: CompletionContext) => string

export type CompletionSteps = Partial<Record<BuiltinCompletionType, CompletionStep>>

export interface CompletionInfo {
  phase?: string
  type: CompletionType
}

export interface CompletionResult {
  completion?: CompletionInfo
  markdown: string
}

export type CompletionContext = CompletionOptions
