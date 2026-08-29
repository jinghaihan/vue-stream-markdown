export type MarkdownProcessorMode = 'static' | 'streaming'

export type PreprocessStepName
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

export type PreprocessStep = (content: string, options?: PreprocessContext) => string

export type PreprocessSteps = Partial<Record<PreprocessStepName, PreprocessStep>>

export interface MarkdownProcessorOptions {
  normalize?: (content: string) => string
  preprocess?: (content: string, options?: PreprocessContext) => string
  preprocessOptions?: PreprocessContext
  preprocessSteps?: PreprocessSteps
  parseMarkdownIntoBlocks?: (content: string) => string[]
}

export interface CompletionOptions {
  /** Escape numeric comparison operators in list items while streaming. @default true */
  comparisonOperators?: boolean
  /** Hide bare `*`, `**`, `_`, `__`, `~`, and `~~` markers while streaming. @default true */
  hideBareFormattingMarkers?: boolean
  singleDollarTextMath?: boolean
}

/** @deprecated Use `CompletionOptions` instead. */
export type PreprocessContext = CompletionOptions

export interface MarkdownProcessorRunOptions {
  mode?: MarkdownProcessorMode
  preprocessContext?: PreprocessContext
}

export interface MarkdownProcessorResult {
  normalizedContent: string
  blocks: string[]
  contents: string[]
}
