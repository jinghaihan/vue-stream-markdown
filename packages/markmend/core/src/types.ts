export type MarkdownProcessorMode = 'static' | 'streaming'

export type PreprocessStepName
  = | 'code'
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
  preprocessSteps?: PreprocessSteps
  parseMarkdownIntoBlocks?: (content: string) => string[]
}

export interface PreprocessContext {
  singleDollarTextMath?: boolean
}

export interface MarkdownProcessorRunOptions {
  mode?: MarkdownProcessorMode
  preprocessContext?: PreprocessContext
}

export interface MarkdownProcessorResult {
  normalizedContent: string
  blocks: string[]
  contents: string[]
}
