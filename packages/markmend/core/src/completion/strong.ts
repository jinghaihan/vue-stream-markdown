import type { CompletionContext } from '../types'
import type { CompletionParagraphAnalysis } from './context'
import { getCompletionAnalysis } from './context'
import {
  doubleAsteriskPattern,
  doubleUnderscorePattern,
  singleAsteriskPattern,
  singleUnderscorePattern,
  trailingStandaloneDashWithNewlinesPattern,
} from './pattern'
import {
  appendBeforeTrailingWhitespace,
  hideBareFormattingMarker,
  isPositionInRanges,
  isWithinHtmlTag,
  isWithinLinkOrImageUrl,
  isWithinMathBlock,
  maskInvalidUnderscoreMarkers,
  shouldIgnoreUnderscoreMarker,
} from './utils'

interface StrongMarkerResult {
  needsCompletion: boolean
  needsRemoval: boolean
  lastRunLength: number
}

type CompletionAnalysis = ReturnType<typeof getCompletionAnalysis>

interface TrailingMarkerRecomputeResult {
  analysis: CompletionAnalysis
  content: string
  needsCompletion: boolean
  needsRemoval: boolean
}

interface StrongFixPlan {
  analysis: CompletionAnalysis
  content: string
  markerText: string
  needsAsteriskCompletion: boolean
  needsAsteriskRemoval: boolean
  needsUnderscoreCompletion: boolean
  needsUnderscoreRemoval: boolean
  removedTrailingSingle: boolean
}

interface TrailingStrongMarkerResult {
  analysis: CompletionAnalysis
  content: string
  needsCompletion: boolean
  needsRemoval: boolean
  removed: boolean
}

interface StrongMarkerState {
  asterisk: StrongMarkerResult
  endsWithSingleAsterisk: boolean
  endsWithSingleUnderscore: boolean
  markerText: string
  underscore: StrongMarkerResult
}

/**
 * Complete incomplete strong emphasis syntax.
 *
 * @param content - Markdown content, potentially incomplete during streaming.
 * @param options - Optional completion context.
 * @returns The content with the applicable completion applied.
 */
export function fixStrong(
  content: string,
  options?: CompletionContext,
): string {
  if (!content.includes('**') && !content.includes('__'))
    return content

  const analysis = getCompletionAnalysis(content, options)
  // Don't process if we're inside a code block (unclosed)
  if (analysis.hasUnclosedCodeBlock)
    return content

  const hiddenBareMarker = hideBareFormattingMarker(
    content,
    ['*', '**', '_', '__'],
    analysis.getLastParagraph().content,
  )
  if (hiddenBareMarker !== undefined)
    return options?.hideBareFormattingMarkers === false ? content : hiddenBareMarker

  const plan = createStrongFixPlan(content, options, analysis)
  if (plan === undefined || typeof plan === 'string')
    return plan ?? content

  return applyStrongFixPlan(plan, options)
}

function createStrongFixPlan(
  content: string,
  options: CompletionContext | undefined,
  initialAnalysis: CompletionAnalysis,
): StrongFixPlan | string | undefined {
  // Find the last paragraph (after the last blank line)
  // Use skipTrailingEmpty=true so that a trailing whitespace-only line
  // (common with templated / indented content) doesn't appear as an
  // empty "last paragraph" and prevent us from fixing the real last
  // paragraph that contains the unclosed strong markers.
  let analysis = initialAnalysis
  const paragraph = analysis.getLastParagraph(true)
  const lastParagraph = paragraph.content
  if (paragraph.isFullyCodeBlock || (!lastParagraph.includes('**') && !lastParagraph.includes('__')))
    return undefined

  const markerState = analyzeStrongMarkers(content, paragraph, options)
  if (markerState === undefined)
    return undefined

  let currentContent = content
  let needsAsteriskCompletion = markerState.asterisk.needsCompletion
  let needsAsteriskRemoval = markerState.asterisk.needsRemoval
  let needsUnderscoreCompletion = markerState.underscore.needsCompletion
  let needsUnderscoreRemoval = markerState.underscore.needsRemoval
  let removedTrailingSingle = false

  // Handle trailing single * or _ when there's an unclosed ** or __
  if (markerState.endsWithSingleAsterisk && (needsAsteriskCompletion || needsAsteriskRemoval)) {
    const result = prepareTrailingStrongMarker(
      currentContent,
      options,
      analysis,
      '*',
      needsAsteriskCompletion,
      needsAsteriskRemoval,
      markerState.asterisk.lastRunLength,
    )
    if (typeof result === 'string')
      return result
    if (result !== undefined) {
      currentContent = result.content
      analysis = result.analysis
      removedTrailingSingle = result.removed
      needsAsteriskCompletion = result.needsCompletion
      needsAsteriskRemoval = result.needsRemoval
    }
  }

  if (markerState.endsWithSingleUnderscore && (needsUnderscoreCompletion || needsUnderscoreRemoval)) {
    const result = prepareTrailingStrongMarker(
      currentContent,
      options,
      analysis,
      '_',
      needsUnderscoreCompletion,
      needsUnderscoreRemoval,
    )
    if (typeof result === 'string')
      return result
    if (result !== undefined) {
      currentContent = result.content
      analysis = result.analysis
      removedTrailingSingle = result.removed
      needsUnderscoreCompletion = result.needsCompletion
      needsUnderscoreRemoval = result.needsRemoval
    }
  }

  return {
    analysis,
    content: currentContent,
    markerText: markerState.markerText,
    needsAsteriskCompletion,
    needsAsteriskRemoval,
    needsUnderscoreCompletion,
    needsUnderscoreRemoval,
    removedTrailingSingle,
  }
}

function analyzeStrongMarkers(
  content: string,
  paragraph: CompletionParagraphAnalysis,
  options: CompletionContext | undefined,
): StrongMarkerState | undefined {
  const formattingMarkers = paragraph.formattingMarkers
  const markerText = formattingMarkers.withoutMath(options?.singleDollarTextMath)
  const sourceMarkers = formattingMarkers.maskedContent
  const asteriskCount = markerText.match(doubleAsteriskPattern)?.length ?? 0
  const underscoreCount = markerText.match(doubleUnderscorePattern)?.length ?? 0
  const asterisk = analyzeStrongMarker(content, paragraph, markerText, '*', sourceMarkers, asteriskCount)
  if (asterisk === undefined)
    return undefined
  const underscore = analyzeStrongMarker(
    content,
    paragraph,
    markerText,
    '_',
    sourceMarkers,
    underscoreCount,
    shouldIgnoreUnderscoreMarker,
  )
  if (underscore === undefined)
    return undefined
  return {
    asterisk,
    endsWithSingleAsterisk: content.endsWith('*') && !content.endsWith('**'),
    endsWithSingleUnderscore: content.endsWith('_') && !content.endsWith('__'),
    markerText,
    underscore,
  }
}

function prepareTrailingStrongMarker(
  content: string,
  options: CompletionContext | undefined,
  analysis: CompletionAnalysis,
  marker: '*' | '_',
  needsCompletion: boolean,
  needsRemoval: boolean,
  runLength = 0,
): TrailingStrongMarkerResult | string | undefined {
  if (!needsCompletion && !needsRemoval)
    return undefined
  if (marker === '*' && needsCompletion && runLength >= 3)
    return appendBeforeTrailingWhitespace(content, '**')

  const result = recomputeAfterTrailingStrongMarker(content.slice(0, -1), options, marker)
  return {
    analysis: result.analysis,
    content: result.content,
    needsCompletion: result.needsCompletion,
    needsRemoval: result.needsRemoval,
    removed: true,
  }
}

function applyStrongFixPlan(plan: StrongFixPlan, options: CompletionContext | undefined): string {
  if (plan.needsAsteriskRemoval)
    return removeTrailingAsterisk(plan.content)
  if (plan.needsUnderscoreRemoval)
    return removeTrailingUnderscore(plan.content, plan.analysis)
  if (plan.needsAsteriskCompletion && plan.needsUnderscoreCompletion)
    return appendBothStrongMarkers(plan.content, plan.markerText)
  if (plan.needsAsteriskCompletion)
    return completeAsterisk(plan, options)
  if (plan.needsUnderscoreCompletion)
    return completeUnderscore(plan, options)
  return plan.content
}

function removeTrailingAsterisk(content: string): string {
  let result = content.slice(0, -2).trimEnd()
  if (trailingStandaloneDashWithNewlinesPattern.test(result))
    result = result.replace(trailingStandaloneDashWithNewlinesPattern, '$1')
  return result
}

function removeTrailingUnderscore(content: string, analysis: CompletionAnalysis): string {
  const paragraph = analysis.getLastParagraph()
  const markerPosition = paragraph.content.lastIndexOf('__')
  const absolutePosition = paragraph.startOffset + markerPosition
  let result = content.substring(0, absolutePosition).trimEnd()
  if (trailingStandaloneDashWithNewlinesPattern.test(result))
    result = result.replace(trailingStandaloneDashWithNewlinesPattern, '$1')
  return result
}

function appendBothStrongMarkers(content: string, markerText: string): string {
  const asteriskPosition = markerText.indexOf('**')
  const underscorePosition = markerText.indexOf('__')
  return appendBeforeTrailingWhitespace(content, asteriskPosition < underscorePosition ? '__**' : '**__')
}

function completeAsterisk(plan: StrongFixPlan, options: CompletionContext | undefined): string {
  if (!plan.removedTrailingSingle) {
    const paragraph = plan.analysis.getLastParagraph(true)
    const markerText = paragraph.formattingMarkers.withoutMath(options?.singleDollarTextMath)
    const withoutDouble = markerText.replace(doubleAsteriskPattern, '')
    if ((withoutDouble.match(singleAsteriskPattern)?.length ?? 0) % 2 === 1)
      return appendBeforeTrailingWhitespace(plan.content, '***')
  }
  return appendBeforeTrailingWhitespace(plan.content, '**')
}

function completeUnderscore(plan: StrongFixPlan, options: CompletionContext | undefined): string {
  if (!plan.removedTrailingSingle) {
    const paragraph = plan.analysis.getLastParagraph()
    const markerText = paragraph.formattingMarkers.withoutMath(options?.singleDollarTextMath)
    const withoutDouble = maskInvalidUnderscoreMarkers(markerText).replace(doubleUnderscorePattern, '')
    if ((withoutDouble.match(singleUnderscorePattern)?.length ?? 0) % 2 === 1)
      return appendBeforeTrailingWhitespace(plan.content, '___')
  }
  return appendBeforeTrailingWhitespace(plan.content, '__')
}

function analyzeStrongMarker(
  content: string,
  paragraph: CompletionParagraphAnalysis,
  markerText: string,
  marker: '*' | '_',
  sourceMarkers: string,
  count: number,
  shouldIgnore?: (text: string, start: number, length?: number) => boolean,
): StrongMarkerResult | undefined {
  if (count % 2 === 0)
    return { needsCompletion: false, needsRemoval: false, lastRunLength: 0 }

  const markerPosition = findLastStrongMarkerPosition(paragraph, marker, sourceMarkers, shouldIgnore)
  if (markerPosition === -1)
    return undefined

  const absolutePosition = paragraph.startOffset + markerPosition
  if (isWithinMathBlock(content, absolutePosition)
    || isWithinLinkOrImageUrl(content, absolutePosition)
    || isWithinHtmlTag(content, absolutePosition)) {
    return undefined
  }

  const markerEnd = markerText.lastIndexOf(marker + marker) + 2
  const afterLast = markerText.substring(markerEnd).trim()
  const beforeLast = markerText.slice(0, markerEnd - 2).trim()
  return {
    needsCompletion: afterLast.length > 0,
    needsRemoval: afterLast.length === 0 && beforeLast.length === 0,
    lastRunLength: marker === '*' ? getAsteriskRunLength(paragraph.content, markerPosition) : 0,
  }
}

function findLastStrongMarkerPosition(
  paragraph: CompletionParagraphAnalysis,
  marker: '*' | '_',
  sourceMarkers: string,
  shouldIgnore?: (text: string, start: number, length?: number) => boolean,
): number {
  let lastMarkerPosition = -1
  for (let index = 0; index < paragraph.content.length - 1; index += 1) {
    if (isPositionInRanges(index, paragraph.codeBlockRanges) || isPositionInRanges(index, paragraph.inlineCodeRanges))
      continue
    if (paragraph.content.substring(index, index + 2) !== marker + marker)
      continue
    if (sourceMarkers.substring(index, index + 2) !== marker + marker)
      continue
    if (shouldIgnore?.(paragraph.content, index, 2))
      continue

    lastMarkerPosition = index
  }
  return lastMarkerPosition
}

function recomputeAfterTrailingStrongMarker(
  content: string,
  options: CompletionContext | undefined,
  marker: '*' | '_',
): TrailingMarkerRecomputeResult {
  const analysis = getCompletionAnalysis(content, options)
  const paragraph = analysis.getLastParagraph(true)
  const markerText = paragraph.formattingMarkers.withoutMath(options?.singleDollarTextMath)
  const pattern = marker === '*' ? doubleAsteriskPattern : doubleUnderscorePattern
  const count = markerText.match(pattern)?.length ?? 0
  if (count % 2 === 0) {
    return { analysis, content, needsCompletion: false, needsRemoval: false }
  }

  const lastMarkerPosition = markerText.lastIndexOf(marker + marker)
  const afterLast = markerText.substring(lastMarkerPosition + 2).trim()
  return {
    analysis,
    content,
    needsCompletion: afterLast.length > 0,
    needsRemoval: afterLast.length === 0,
  }
}

function getAsteriskRunLength(content: string, position: number): number {
  let end = position
  while (content[end] === '*')
    end += 1
  return end - position
}
