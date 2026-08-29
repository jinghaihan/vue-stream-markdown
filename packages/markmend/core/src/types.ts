export interface CompletionOptions {
  /** Escape numeric comparison operators in list items while streaming. @default true */
  comparisonOperators?: boolean
  /** Hide bare `*`, `**`, `_`, `__`, `~`, and `~~` markers while streaming. @default true */
  hideBareFormattingMarkers?: boolean
  singleDollarTextMath?: boolean
}

export type CompletionContext = CompletionOptions
