import type { CompletionContext } from '../types'
import type { CompletionParagraphAnalysis } from './context'
import { getCompletionAnalysis } from './context'
import {
  singleAsteriskPattern,
  singleUnderscorePattern,
} from './pattern'
import {
  hideBareFormattingMarker,
  isPositionInRanges,
  isWithinHtmlTag,
  isWithinLinkOrImageUrl,
  isWithinMathBlock,
  maskPairedMarkerRuns,
  shouldIgnoreUnderscoreMarker,
} from './utils'

interface MarkerSearchOptions {
  content: string
  lastParagraph: string
  marker: '*' | '_'
  sourceMarkers: string
  codeBlockRanges: Parameters<typeof isPositionInRanges>[1]
  inlineCodeRanges: Parameters<typeof isPositionInRanges>[1]
  paragraphOffset: number
  count: number
  shouldIgnore?: (text: string, index: number) => boolean
}

/**
 * Complete incomplete emphasis syntax.
 *
 * @param content - Markdown content, potentially incomplete during streaming.
 * @param options - Optional completion context.
 * @returns The content with the applicable completion applied.
 *
 * @example
 * completeEmphasis('*text')
 * // Returns: '*text*'
 */
export function completeEmphasis(
  content: string,
  options?: CompletionContext,
): string {
  if (!content.includes('*') && !content.includes('_'))
    return content

  const hasOddAsteriskRun = hasOddMarkerRun(content, '*')
  const hasOddUnderscoreRun = hasOddMarkerRun(content, '_')
  if (!hasOddAsteriskRun && !hasOddUnderscoreRun) {
    const hiddenBareMarker = hideBareFormattingMarker(content, ['*', '_'])
    if (hiddenBareMarker === undefined)
      return content
  }

  const analysis = getCompletionAnalysis(content, options)
  // Don't process if we're inside a code block (unclosed)
  if (analysis.hasUnclosedCodeBlock) {
    return content
  }

  const hiddenBareMarker = hideBareFormattingMarker(
    content,
    ['*', '_'],
    analysis.getLastParagraph().content,
  )
  if (hiddenBareMarker !== undefined)
    return options?.hideBareFormattingMarkers === false ? content : hiddenBareMarker

  if (!hasOddAsteriskRun && !hasOddUnderscoreRun)
    return content

  // Find the last paragraph
  const paragraph = analysis.getLastParagraph()
  if (paragraph.isFullyCodeBlock)
    return content

  return completeEmphasisContent(content, paragraph)
}

function hasOddMarkerRun(content: string, marker: '*' | '_'): boolean {
  for (let index = content.indexOf(marker); index !== -1;) {
    const runStart = index
    while (content[index] === marker)
      index += 1

    if ((index - runStart) % 2 === 1)
      return true

    index = content.indexOf(marker, index)
  }

  return false
}

function completeEmphasisContent(content: string, paragraph: CompletionParagraphAnalysis): string {
  const {
    codeBlockRanges,
    content: lastParagraph,
    inlineCodeRanges,
    startOffset: paragraphOffset,
    formattingMarkers,
  } = paragraph
  const sourceSingleAsteriskMarkers = formattingMarkers.singleAsteriskMarkers
  const sourceSingleUnderscoreMarkers = formattingMarkers.singleUnderscoreMarkers
  const lastParagraphForMarkerCounting = formattingMarkers.withoutCodeBlocksAndUrls
  const withoutDoubleAsterisk = lastParagraphForMarkerCounting === formattingMarkers.maskedContent
    ? sourceSingleAsteriskMarkers
    : maskPairedMarkerRuns(lastParagraphForMarkerCounting, '*')
  const withoutDoubleUnderscore = lastParagraphForMarkerCounting === formattingMarkers.maskedContent
    ? sourceSingleUnderscoreMarkers
    : maskPairedMarkerRuns(lastParagraphForMarkerCounting, '_')
  const asteriskCount = withoutDoubleAsterisk.match(singleAsteriskPattern)?.length ?? 0
  const underscoreCount = withoutDoubleUnderscore.match(singleUnderscorePattern)?.length ?? 0
  const needsAsteriskCompletion = getMarkerNeedsCompletion({
    content,
    lastParagraph,
    marker: '*',
    sourceMarkers: sourceSingleAsteriskMarkers,
    codeBlockRanges,
    inlineCodeRanges,
    paragraphOffset,
    count: asteriskCount,
  })
  if (needsAsteriskCompletion === undefined)
    return content

  const needsUnderscoreCompletion = getMarkerNeedsCompletion({
    content,
    lastParagraph,
    marker: '_',
    sourceMarkers: sourceSingleUnderscoreMarkers,
    codeBlockRanges,
    inlineCodeRanges,
    paragraphOffset,
    count: underscoreCount,
    shouldIgnore: shouldIgnoreUnderscoreMarker,
  })
  if (needsUnderscoreCompletion === undefined)
    return content

  return completeEmphasisMarkers(content, withoutDoubleAsterisk, withoutDoubleUnderscore, needsAsteriskCompletion, needsUnderscoreCompletion)
}

function findLastMarkerPosition(options: MarkerSearchOptions): number {
  const {
    content,
    lastParagraph,
    marker,
    sourceMarkers,
    codeBlockRanges,
    inlineCodeRanges,
    paragraphOffset,
    shouldIgnore,
  } = options

  for (let index = lastParagraph.length - 1; index >= 0; index -= 1) {
    if (isPositionInRanges(index, codeBlockRanges) || isPositionInRanges(index, inlineCodeRanges))
      continue
    if (lastParagraph[index] !== marker || sourceMarkers[index] !== marker)
      continue
    if (shouldIgnore?.(lastParagraph, index))
      continue

    const absolutePos = paragraphOffset + index
    if (!isWithinMathBlock(content, absolutePos)
      && !isWithinLinkOrImageUrl(content, absolutePos)
      && !isWithinHtmlTag(content, absolutePos)) {
      return index
    }
  }

  return -1
}

function getMarkerNeedsCompletion(options: MarkerSearchOptions): boolean | undefined {
  if (options.count % 2 === 0)
    return false

  const markerPosition = findLastMarkerPosition(options)
  if (markerPosition === -1)
    return undefined

  return hasContentAfterMarker(options.lastParagraph, markerPosition)
}

function completeEmphasisMarkers(
  content: string,
  asteriskMarkers: string,
  underscoreMarkers: string,
  needsAsterisk: boolean,
  needsUnderscore: boolean,
): string {
  if (needsAsterisk && needsUnderscore) {
    const firstStarPos = asteriskMarkers.indexOf('*')
    const firstUnderscorePos = underscoreMarkers.indexOf('_')
    return firstStarPos < firstUnderscorePos ? `${content}_*` : `${content}*_`
  }

  if (needsAsterisk)
    return `${content}*`
  if (needsUnderscore)
    return `${content}_`
  return content
}

function hasContentAfterMarker(content: string, markerPosition: number): boolean {
  return content.slice(markerPosition + 1).trim().length > 0
}
