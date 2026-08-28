import type { PreprocessContext } from '../types'
import type { TextRange } from './utils'
import { codeBlockPattern } from './pattern'
import {
  findClosedCodeBlockRanges,
  findInlineCodeRanges,
  findLastParagraphStart,
  isInsideUnclosedCodeBlock,
  maskInlineCodeMarkdownMarkers,
  maskInvalidAsteriskMarkers,
  maskInvalidUnderscoreMarkers,
  maskPairedMarkerRuns,
  maskThematicBreakMarkers,
  removeMathBlocksFromText,
  removeUrlsFromText,
} from './utils'

export interface FormattingMarkerAnalysis {
  maskedContent: string
  singleAsteriskMarkers: string
  singleUnderscoreMarkers: string
  withoutCodeBlocksAndUrls: string
  withoutMath: (singleDollarTextMath?: boolean) => string
}

export interface PreprocessParagraphAnalysis {
  codeBlockRanges: TextRange[]
  content: string
  formattingMarkers: FormattingMarkerAnalysis
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

class CachedFormattingMarkerAnalysis implements FormattingMarkerAnalysis {
  private cachedMaskedContent?: string
  private cachedSingleAsteriskMarkers?: string
  private cachedSingleUnderscoreMarkers?: string
  private cachedWithoutCodeBlocksAndUrls?: string
  private cachedWithoutMath?: string
  private cachedWithoutSingleDollarMath?: string

  constructor(private readonly paragraph: CachedParagraphAnalysis) {}

  get maskedContent(): string {
    if (this.cachedMaskedContent === undefined) {
      const withoutInlineCodeMarkers = maskInlineCodeMarkdownMarkers(
        this.paragraph.content,
        this.paragraph.inlineCodeRanges,
      )
      const withoutThematicBreakMarkers = maskThematicBreakMarkers(withoutInlineCodeMarkers)
      const withoutInvalidAsterisks = maskInvalidAsteriskMarkers(withoutThematicBreakMarkers)
      this.cachedMaskedContent = maskInvalidUnderscoreMarkers(withoutInvalidAsterisks)
    }
    return this.cachedMaskedContent
  }

  get singleAsteriskMarkers(): string {
    this.cachedSingleAsteriskMarkers ??= maskPairedMarkerRuns(this.maskedContent, '*')
    return this.cachedSingleAsteriskMarkers
  }

  get singleUnderscoreMarkers(): string {
    this.cachedSingleUnderscoreMarkers ??= maskPairedMarkerRuns(this.maskedContent, '_')
    return this.cachedSingleUnderscoreMarkers
  }

  get withoutCodeBlocksAndUrls(): string {
    this.cachedWithoutCodeBlocksAndUrls ??= removeUrlsFromText(
      this.maskedContent.replace(codeBlockPattern, ''),
    )
    return this.cachedWithoutCodeBlocksAndUrls
  }

  withoutMath(singleDollarTextMath = false): string {
    if (singleDollarTextMath) {
      this.cachedWithoutSingleDollarMath ??= removeMathBlocksFromText(
        this.withoutCodeBlocksAndUrls,
        { singleDollarTextMath: true },
      )
      return this.cachedWithoutSingleDollarMath
    }

    this.cachedWithoutMath ??= removeMathBlocksFromText(this.withoutCodeBlocksAndUrls)
    return this.cachedWithoutMath
  }
}

class CachedParagraphAnalysis implements PreprocessParagraphAnalysis {
  private cachedCodeBlockRanges?: TextRange[]
  private cachedInlineCodeRanges?: TextRange[]
  readonly content: string
  readonly formattingMarkers: FormattingMarkerAnalysis
  readonly startIndex: number
  readonly startOffset: number

  constructor(lines: string[], skipTrailingEmpty: boolean) {
    this.startIndex = findLastParagraphStart(lines, skipTrailingEmpty)
    this.content = lines.slice(this.startIndex).join('\n')
    this.startOffset = this.startIndex === 0
      ? 0
      : lines.slice(0, this.startIndex).join('\n').length + 1
    this.formattingMarkers = new CachedFormattingMarkerAnalysis(this)
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
