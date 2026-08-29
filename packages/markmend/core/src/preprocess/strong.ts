import type { PreprocessContext } from '../types'
import { getPreprocessAnalysis } from './context'
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

/**
 * Fix unclosed strong (** or __) syntax in streaming markdown
 *
 * Only processes the last paragraph (content after the last blank line).
 * This respects Markdown's rule that strong formatting cannot span across paragraphs.
 *
 * @param content - Markdown content (potentially incomplete in stream mode)
 * @returns Content with auto-completed ** or __ if needed
 *
 * @example
 * fixStrong('Hello **world')
 * // Returns: 'Hello **world**'
 *
 * @example
 * fixStrong('Hello __world')
 * // Returns: 'Hello __world__'
 *
 * @example
 * fixStrong('Para1 **bold**\n\nPara2 **text')
 * // Returns: 'Para1 **bold**\n\nPara2 **text**'
 *
 * @example
 * fixStrong('List item\n\n**')
 * // Returns: 'List item' (bare formatting markers are hidden by default)
 */
export function fixStrong(
  content: string,
  options?: PreprocessContext,
): string {
  if (!content.includes('**') && !content.includes('__'))
    return content

  let analysis = getPreprocessAnalysis(content, options)
  // Don't process if we're inside a code block (unclosed)
  if (analysis.hasUnclosedCodeBlock) {
    return content
  }

  const hiddenBareMarker = hideBareFormattingMarker(
    content,
    ['*', '**', '_', '__'],
    analysis.getLastParagraph().content,
  )
  if (hiddenBareMarker !== undefined)
    return options?.hideBareFormattingMarkers === false ? content : hiddenBareMarker

  // Find the last paragraph (after the last blank line)
  // Use skipTrailingEmpty=true so that a trailing whitespace-only line
  // (common with templated / indented content) doesn't appear as an
  // empty "last paragraph" and prevent us from fixing the real last
  // paragraph that contains the unclosed strong markers.
  let paragraph = analysis.getLastParagraph(true)
  const {
    content: lastParagraph,
    inlineCodeRanges,
    startOffset: paragraphOffset,
  } = paragraph
  if (paragraph.isFullyCodeBlock)
    return content

  if (!lastParagraph.includes('**') && !lastParagraph.includes('__'))
    return content

  // Remove code blocks and mask Markdown markers inside inline code to avoid
  // treating code content as incomplete strong emphasis.
  const formattingMarkers = paragraph.formattingMarkers
  const lastParagraphWithoutInvalidMarkers = formattingMarkers.maskedContent
  // Remove code blocks, URLs, and math to avoid counting their Markdown-like markers.
  const lastParagraphWithoutCodeBlocksAndUrlsAndMath = formattingMarkers.withoutMath(
    options?.singleDollarTextMath,
  )
  const lastParagraphForMarkerCounting = lastParagraphWithoutCodeBlocksAndUrlsAndMath

  // Check if content ends with a single * or _ (not ** or __)
  const endsWithSingleAsterisk = content.endsWith('*') && !content.endsWith('**')
  const endsWithSingleUnderscore = content.endsWith('_') && !content.endsWith('__')

  // Count ** in the last paragraph only (excluding code blocks, URLs, and math blocks)
  const asteriskMatches = lastParagraphForMarkerCounting.match(doubleAsteriskPattern)
  const asteriskCount = asteriskMatches ? asteriskMatches.length : 0

  // Count __ in the last paragraph only (excluding code blocks, URLs, and math blocks)
  const underscoreMatches = lastParagraphForMarkerCounting.match(doubleUnderscorePattern)
  const underscoreCount = underscoreMatches ? underscoreMatches.length : 0

  // Track what needs to be done
  let needsAsteriskCompletion = false
  let needsUnderscoreCompletion = false
  let needsAsteriskRemoval = false
  let needsUnderscoreRemoval = false
  let lastAsteriskRunLength = 0

  // Check asterisk
  if (asteriskCount % 2 === 1) {
    // Find the last ** in original lastParagraph, skipping code blocks
    let actualLastStarPos = -1
    let inCodeBlock = false
    for (let i = 0; i < lastParagraph.length - 1; i++) {
      // Check for code block fences
      if (lastParagraph.substring(i, i + 3) === '```') {
        inCodeBlock = !inCodeBlock
        i += 2 // Skip the next two backticks
        continue
      }
      if (isPositionInRanges(i, inlineCodeRanges))
        continue
      // Skip if inside code block
      if (inCodeBlock) {
        continue
      }
      // Check for **
      if (lastParagraph.substring(i, i + 2) === '**') {
        if (lastParagraphWithoutInvalidMarkers.substring(i, i + 2) !== '**') {
          i += 1
          continue
        }
        actualLastStarPos = i
        i += 1 // Skip the second *
      }
    }
    const absoluteLastStarPos = paragraphOffset + actualLastStarPos
    if (actualLastStarPos >= 0) {
      let runEnd = actualLastStarPos
      while (lastParagraph[runEnd] === '*')
        runEnd += 1
      lastAsteriskRunLength = runEnd - actualLastStarPos
    }

    // Check if the asterisk is in math block, link/image URL, or HTML tag
    if (isWithinMathBlock(content, absoluteLastStarPos, options) || isWithinLinkOrImageUrl(content, absoluteLastStarPos) || isWithinHtmlTag(content, absoluteLastStarPos)) {
      // Don't process if inside math block, link/image URL, or HTML tag
      return content
    }

    const lastMarkerPosition = lastParagraphForMarkerCounting.lastIndexOf('**')
    const afterLast = lastParagraphForMarkerCounting.substring(lastMarkerPosition + 2).trim()

    if (afterLast.length > 0) {
      needsAsteriskCompletion = true
    }
    else if (lastParagraphForMarkerCounting.slice(0, lastMarkerPosition).trim().length === 0) {
      needsAsteriskRemoval = true
    }
  }

  // Check underscore
  if (underscoreCount % 2 === 1) {
    // Find the last __ in original lastParagraph, skipping code blocks
    let actualLastUnderscorePos = -1
    let inCodeBlock = false
    for (let i = 0; i < lastParagraph.length - 1; i++) {
      // Check for code block fences
      if (lastParagraph.substring(i, i + 3) === '```') {
        inCodeBlock = !inCodeBlock
        i += 2 // Skip the next two backticks
        continue
      }
      if (isPositionInRanges(i, inlineCodeRanges))
        continue
      // Skip if inside code block
      if (inCodeBlock) {
        continue
      }
      // Check for __
      if (lastParagraph.substring(i, i + 2) === '__') {
        if (lastParagraphWithoutInvalidMarkers.substring(i, i + 2) !== '__') {
          i += 1
          continue
        }
        if (shouldIgnoreUnderscoreMarker(lastParagraph, i, 2)) {
          i += 1
          continue
        }
        actualLastUnderscorePos = i
        i += 1 // Skip the second _
      }
    }
    const absoluteLastUnderscorePos = paragraphOffset + actualLastUnderscorePos

    // Check if the underscore is in math block, link/image URL, or HTML tag
    if (isWithinMathBlock(content, absoluteLastUnderscorePos, options) || isWithinLinkOrImageUrl(content, absoluteLastUnderscorePos) || isWithinHtmlTag(content, absoluteLastUnderscorePos)) {
      // Don't process if inside math block, link/image URL, or HTML tag
      return content
    }

    const lastMarkerPosition = lastParagraphForMarkerCounting.lastIndexOf('__')
    const afterLast = lastParagraphForMarkerCounting.substring(lastMarkerPosition + 2).trim()

    if (afterLast.length > 0) {
      needsUnderscoreCompletion = true
    }
    else if (lastParagraphForMarkerCounting.slice(0, lastMarkerPosition).trim().length === 0) {
      needsUnderscoreRemoval = true
    }
  }

  // Handle trailing single * or _ when there's an unclosed ** or __
  let removedTrailingSingle = false
  if (endsWithSingleAsterisk && (needsAsteriskCompletion || needsAsteriskRemoval)) {
    if (needsAsteriskCompletion && lastAsteriskRunLength >= 3)
      return appendBeforeTrailingWhitespace(content, '**')

    // Remove the trailing single * first
    content = content.slice(0, -1)
    removedTrailingSingle = true
    analysis = getPreprocessAnalysis(content, options)
    // Recalculate after removal. Again, skip any trailing empty line so we
    // still operate on the actual last non-empty paragraph.
    const newParagraph = analysis.getLastParagraph(true)
    const newLastParagraphWithoutCodeBlocksAndUrlsAndMath = newParagraph.formattingMarkers.withoutMath(
      options?.singleDollarTextMath,
    )
    const newAsteriskMatches = newLastParagraphWithoutCodeBlocksAndUrlsAndMath.match(doubleAsteriskPattern)
    const newAsteriskCount = newAsteriskMatches ? newAsteriskMatches.length : 0
    if (newAsteriskCount % 2 === 1) {
      const lastStarPos = newLastParagraphWithoutCodeBlocksAndUrlsAndMath.lastIndexOf('**')
      const afterLast = newLastParagraphWithoutCodeBlocksAndUrlsAndMath.substring(lastStarPos + 2).trim()
      if (afterLast.length > 0) {
        needsAsteriskCompletion = true
        needsAsteriskRemoval = false
      }
      else {
        needsAsteriskRemoval = true
        needsAsteriskCompletion = false
      }
    }
  }

  if (endsWithSingleUnderscore && (needsUnderscoreCompletion || needsUnderscoreRemoval)) {
    // Remove the trailing single _ first
    content = content.slice(0, -1)
    removedTrailingSingle = true
    analysis = getPreprocessAnalysis(content, options)
    // Recalculate after removal. Again, skip any trailing empty line so we
    // still operate on the actual last non-empty paragraph.
    const newParagraph = analysis.getLastParagraph(true)
    const newLastParagraphForMarkerCounting = newParagraph.formattingMarkers.withoutMath(
      options?.singleDollarTextMath,
    )
    const newUnderscoreMatches = newLastParagraphForMarkerCounting.match(doubleUnderscorePattern)
    const newUnderscoreCount = newUnderscoreMatches ? newUnderscoreMatches.length : 0
    if (newUnderscoreCount % 2 === 1) {
      const lastUnderscorePos = newLastParagraphForMarkerCounting.lastIndexOf('__')
      const afterLast = newLastParagraphForMarkerCounting.substring(lastUnderscorePos + 2).trim()
      if (afterLast.length > 0) {
        needsUnderscoreCompletion = true
        needsUnderscoreRemoval = false
      }
      else {
        needsUnderscoreRemoval = true
        needsUnderscoreCompletion = false
      }
    }
  }

  // Handle removals first
  if (needsAsteriskRemoval) {
    let result = content.slice(0, -2).trimEnd()
    if (trailingStandaloneDashWithNewlinesPattern.test(result)) {
      result = result.replace(trailingStandaloneDashWithNewlinesPattern, '$1')
    }
    return result
  }

  if (needsUnderscoreRemoval) {
    paragraph = analysis.getLastParagraph()
    const newLastParagraph = paragraph.content
    const lastUnderscorePos = newLastParagraph.lastIndexOf('__')
    const absoluteLastUnderscorePos = paragraph.startOffset + lastUnderscorePos
    let result = content.substring(0, absoluteLastUnderscorePos).trimEnd()
    if (trailingStandaloneDashWithNewlinesPattern.test(result)) {
      result = result.replace(trailingStandaloneDashWithNewlinesPattern, '$1')
    }
    return result
  }

  // Handle completions - check for both ** and __, and also check for single * or _
  if (needsAsteriskCompletion && needsUnderscoreCompletion) {
    // Both need completion - complete the one that appears first
    const firstAsteriskPos = lastParagraphWithoutCodeBlocksAndUrlsAndMath.indexOf('**')
    const firstUnderscorePos = lastParagraphForMarkerCounting.indexOf('__')
    if (firstAsteriskPos < firstUnderscorePos) {
      // Asterisk appears first, complete underscore first, then asterisk
      return appendBeforeTrailingWhitespace(content, '__**')
    }
    else {
      // Underscore appears first, complete asterisk first, then underscore
      return appendBeforeTrailingWhitespace(content, '**__')
    }
  }

  if (needsAsteriskCompletion) {
    // Check if there's also an unclosed single * that needs completion
    // But only if we didn't just remove a trailing single *
    if (!removedTrailingSingle) {
      const currentParagraph = analysis.getLastParagraph(true)
      const currentLastParagraphWithoutCodeBlocksAndUrlsAndMath = currentParagraph.formattingMarkers.withoutMath(
        options?.singleDollarTextMath,
      )
      const withoutDoubleAsterisk = currentLastParagraphWithoutCodeBlocksAndUrlsAndMath.replace(doubleAsteriskPattern, '')
      const singleAsteriskMatches = withoutDoubleAsterisk.match(singleAsteriskPattern)
      const singleAsteriskCount = singleAsteriskMatches ? singleAsteriskMatches.length : 0
      if (singleAsteriskCount % 2 === 1) {
        // Complete both ** and *, inserting before trailing whitespace
        return appendBeforeTrailingWhitespace(content, '***')
      }
    }
    // Only complete **, inserting before trailing whitespace
    return appendBeforeTrailingWhitespace(content, '**')
  }

  if (needsUnderscoreCompletion) {
    // Check if there's also an unclosed single _ that needs completion
    // But only if we didn't just remove a trailing single _
    if (!removedTrailingSingle) {
      const currentParagraph = analysis.getLastParagraph()
      const currentLastParagraphWithoutCodeBlocksAndUrlsAndMath = currentParagraph.formattingMarkers.withoutMath(
        options?.singleDollarTextMath,
      )
      const withoutDoubleUnderscore = maskInvalidUnderscoreMarkers(currentLastParagraphWithoutCodeBlocksAndUrlsAndMath).replace(doubleUnderscorePattern, '')
      const singleUnderscoreMatches = withoutDoubleUnderscore.match(singleUnderscorePattern)
      const singleUnderscoreCount = singleUnderscoreMatches ? singleUnderscoreMatches.length : 0
      if (singleUnderscoreCount % 2 === 1) {
        // Complete both __ and _, inserting before trailing whitespace
        return appendBeforeTrailingWhitespace(content, '___')
      }
    }
    // Only complete __, inserting before trailing whitespace
    return appendBeforeTrailingWhitespace(content, '__')
  }

  return content
}
