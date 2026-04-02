import type {
  MarkdownProcessorOptions,
  MarkdownProcessorResult,
  MarkdownProcessorRunOptions,
  PreprocessContext,
} from './types'
import {
  normalize as defaultNormalize,
  parseMarkdownIntoBlocks as defaultParseMarkdownIntoBlocks,
  preprocess as defaultPreprocess,
} from './preprocess'

const EMPTY_RESULT: MarkdownProcessorResult = {
  normalizedContent: '',
  blocks: [],
  contents: [],
}

export class MarkdownProcessor {
  constructor(private readonly options: MarkdownProcessorOptions = {}) {}

  normalize(content: string): string {
    const normalize = this.options.normalize ?? defaultNormalize
    return normalize(content)
  }

  preprocess(content: string, options?: PreprocessContext): string {
    const preprocess = this.options.preprocess ?? defaultPreprocess
    return preprocess(content, options)
  }

  parseMarkdownIntoBlocks(content: string): string[] {
    const parseMarkdownIntoBlocks = this.options.parseMarkdownIntoBlocks ?? defaultParseMarkdownIntoBlocks
    return parseMarkdownIntoBlocks(content)
  }

  processMarkdown(
    content: string,
    options: MarkdownProcessorRunOptions = {},
  ): MarkdownProcessorResult {
    if (!content)
      return EMPTY_RESULT

    const normalizedContent = this.normalize(content)
    if (!normalizedContent) {
      return {
        ...EMPTY_RESULT,
        normalizedContent,
      }
    }

    const mode = options.mode ?? 'streaming'
    const blocks = mode === 'static'
      ? [normalizedContent]
      : this.parseMarkdownIntoBlocks(normalizedContent)

    const contents = blocks.map((block, index) => {
      const isLastBlock = index === blocks.length - 1
      if (mode === 'streaming' && isLastBlock)
        return this.preprocess(block, options.preprocessContext)
      return block
    })

    return {
      normalizedContent,
      blocks,
      contents,
    }
  }
}
