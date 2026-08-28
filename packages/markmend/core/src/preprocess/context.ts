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
  codeBlockRanges: TextRange[]
  content: string
  hasUnclosedCodeBlock: boolean
  inlineCodeRanges: TextRange[]
  isFullyCodeBlock: boolean
  lines: string[]
  getLastParagraph: (skipTrailingEmpty?: boolean) => PreprocessParagraphAnalysis
}

const analysisCache = new WeakMap<PreprocessContext, PreprocessAnalysis>()

class CachedParagraphAnalysis implements PreprocessParagraphAnalysis {
  private cachedCodeBlockRanges?: TextRange[]
  private cachedInlineCodeRanges?: TextRange[]
  readonly content: string
  readonly startIndex: number
  readonly startOffset: number

  constructor(lines: string[], skipTrailingEmpty: boolean) {
    this.startIndex = findLastParagraphStart(lines, skipTrailingEmpty)
    this.content = lines.slice(this.startIndex).join('\n')
    this.startOffset = this.startIndex === 0
      ? 0
      : lines.slice(0, this.startIndex).join('\n').length + 1
  }

  get codeBlockRanges(): TextRange[] {
    this.cachedCodeBlockRanges ??= findClosedCodeBlockRanges(this.content)
    return this.cachedCodeBlockRanges
  }

  get inlineCodeRanges(): TextRange[] {
    this.cachedInlineCodeRanges ??= findInlineCodeRanges(this.content, this.codeBlockRanges)
    return this.cachedInlineCodeRanges
  }

  get isFullyCodeBlock(): boolean {
    return this.codeBlockRanges.some(range => (
      this.content.slice(0, range.start).trim() === ''
      && this.content.slice(range.end).trim() === ''
    ))
  }
}

class CachedPreprocessAnalysis implements PreprocessAnalysis {
  private cachedCodeBlockRanges?: TextRange[]
  private cachedHasUnclosedCodeBlock?: boolean
  private cachedInlineCodeRanges?: TextRange[]
  private cachedLines?: string[]
  private defaultParagraph?: PreprocessParagraphAnalysis
  private trailingParagraph?: PreprocessParagraphAnalysis

  constructor(readonly content: string) {}

  get codeBlockRanges(): TextRange[] {
    this.cachedCodeBlockRanges ??= findClosedCodeBlockRanges(this.content)
    return this.cachedCodeBlockRanges
  }

  get hasUnclosedCodeBlock(): boolean {
    this.cachedHasUnclosedCodeBlock ??= isInsideUnclosedCodeBlock(this.content)
    return this.cachedHasUnclosedCodeBlock
  }

  get inlineCodeRanges(): TextRange[] {
    this.cachedInlineCodeRanges ??= findInlineCodeRanges(this.content, this.codeBlockRanges)
    return this.cachedInlineCodeRanges
  }

  get isFullyCodeBlock(): boolean {
    return this.codeBlockRanges.some(range => (
      this.content.slice(0, range.start).trim() === ''
      && this.content.slice(range.end).trim() === ''
    ))
  }

  get lines(): string[] {
    this.cachedLines ??= this.content.split('\n')
    return this.cachedLines
  }

  getLastParagraph(skipTrailingEmpty = false): PreprocessParagraphAnalysis {
    if (skipTrailingEmpty) {
      this.trailingParagraph ??= new CachedParagraphAnalysis(this.lines, true)
      return this.trailingParagraph
    }

    this.defaultParagraph ??= new CachedParagraphAnalysis(this.lines, false)
    return this.defaultParagraph
  }
}

function analyzePreprocessContent(content: string): PreprocessAnalysis {
  return new CachedPreprocessAnalysis(content)
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
