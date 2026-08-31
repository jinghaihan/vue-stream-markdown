export interface CompletionOptions {
  /** Escape numeric comparison operators in list items while streaming. @default true */
  comparisonOperators?: boolean
  /** Hide bare `*`, `**`, `_`, `__`, `~`, and `~~` markers while streaming. @default true */
  hideBareFormattingMarkers?: boolean
  singleDollarTextMath?: boolean
}

export type CompletionType = string

export interface CompletionInfo {
  phase?: string
  type: CompletionType
}

export interface CompletionResult {
  completion?: CompletionInfo
  markdown: string
}

export type CompletionContext = CompletionOptions
