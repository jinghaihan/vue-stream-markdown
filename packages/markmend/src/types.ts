export type MarkdownProcessorMode = 'static' | 'streaming'

export interface MarkdownProcessorOptions {
  normalize?: (content: string) => string
  preprocess?: (content: string, options?: PreprocessContext) => string
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
