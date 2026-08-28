import type { PreprocessContext } from '../types'
import type { TextRange } from './utils'
import {
  findClosedCodeBlockRanges,
  findInlineCodeRanges,
  findLastParagraphStart,
  isInsideUnclosedCodeBlock,

} from './utils'

export interface PreprocessParagraphAnalysis {
  codeBlockRanges: TextRange[]
  content: string
  inlineCodeRanges: TextRange[]
  isFullyCodeBlock: boolean
  startIndex: number
  startOffset: number
}

export interface PreprocessAnalysis {
  content: string
  hasUnclosedCodeBlock: boolean
  lines: string[]
  getLastParagraph: (skipTrailingEmpty?: boolean) => PreprocessParagraphAnalysis
}

const analysisCache = new WeakMap<PreprocessContext, PreprocessAnalysis>()

function createParagraphAnalysis(
  content: string,
  lines: string[],
  skipTrailingEmpty: boolean,
): PreprocessParagraphAnalysis {
  const startIndex = findLastParagraphStart(lines, skipTrailingEmpty)
  const paragraphContent = lines.slice(startIndex).join('\n')
  const codeBlockRanges = findClosedCodeBlockRanges(paragraphContent)
  const inlineCodeRanges = findInlineCodeRanges(paragraphContent, codeBlockRanges)
  const startOffset = startIndex === 0
    ? 0
    : lines.slice(0, startIndex).join('\n').length + 1
  const isFullyCodeBlock = codeBlockRanges.some(range => (
    paragraphContent.slice(0, range.start).trim() === ''
    && paragraphContent.slice(range.end).trim() === ''
  ))

  return {
    codeBlockRanges,
    content: paragraphContent,
    inlineCodeRanges,
    isFullyCodeBlock,
    startIndex,
    startOffset,
  }
}

function analyzePreprocessContent(content: string): PreprocessAnalysis {
  const lines = content.split('\n')
  const paragraphs = new Map<boolean, PreprocessParagraphAnalysis>()

  return {
    content,
    hasUnclosedCodeBlock: isInsideUnclosedCodeBlock(content),
    lines,
    getLastParagraph(skipTrailingEmpty = false) {
      let paragraph = paragraphs.get(skipTrailingEmpty)
      if (!paragraph) {
        paragraph = createParagraphAnalysis(content, lines, skipTrailingEmpty)
        paragraphs.set(skipTrailingEmpty, paragraph)
      }
      return paragraph
    },
  }
}

export function createPreprocessContext(
  context: PreprocessContext = {},
): PreprocessContext {
  return { ...context }
}

export function getPreprocessAnalysis(
  content: string,
  context?: PreprocessContext,
): PreprocessAnalysis {
  if (!context)
    return analyzePreprocessContent(content)

  const cached = analysisCache.get(context)
  if (cached?.content === content)
    return cached

  const analysis = analyzePreprocessContent(content)
  analysisCache.set(context, analysis)
  return analysis
}
