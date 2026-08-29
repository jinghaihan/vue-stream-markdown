import type { CompletionContext } from '../types'
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

/**
 * Fix unclosed emphasis (* or _) syntax in streaming markdown
 *
 * Only processes the last paragraph (content after the last blank line).
 * This respects Markdown's rule that emphasis cannot span across paragraphs.
 */
export function fixEmphasis(
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
  const {
    codeBlockRanges,
    content: lastParagraph,
    inlineCodeRanges,
    startOffset: paragraphOffset,
  } = paragraph
  if (paragraph.isFullyCodeBlock)
    return content

  // Remove code blocks and mask Markdown markers inside inline code to avoid
  // treating code content as incomplete emphasis.
  const formattingMarkers = paragraph.formattingMarkers
  const sourceSingleAsteriskMarkers = formattingMarkers.singleAsteriskMarkers
  const sourceSingleUnderscoreMarkers = formattingMarkers.singleUnderscoreMarkers
  const lastParagraphForMarkerCounting = formattingMarkers.withoutCodeBlocksAndUrls

  // Check asterisk emphasis first (original behavior)
  // Mask complete pairs while preserving the source offsets of odd runs.
  const withoutDoubleAsterisk = lastParagraphForMarkerCounting === formattingMarkers.maskedContent
    ? sourceSingleAsteriskMarkers
    : maskPairedMarkerRuns(lastParagraphForMarkerCounting, '*')
  const asteriskMatches = withoutDoubleAsterisk.match(singleAsteriskPattern)
  const asteriskCount = asteriskMatches ? asteriskMatches.length : 0

  // Check underscore emphasis
  const withoutDoubleUnderscore = lastParagraphForMarkerCounting === formattingMarkers.maskedContent
    ? sourceSingleUnderscoreMarkers
    : maskPairedMarkerRuns(lastParagraphForMarkerCounting, '_')
  const underscoreMatches = withoutDoubleUnderscore.match(singleUnderscorePattern)
  const underscoreCount = underscoreMatches ? underscoreMatches.length : 0

  // Track if we need to complete asterisk and/or underscore
  let needsAsteriskCompletion = false
  let needsUnderscoreCompletion = false

  // Check asterisk
  if (asteriskCount % 2 === 1) {
    // Find the last * in the original lastParagraph, but skip those in URLs
    // We need to find the position in the original text, not in the URL-removed text
    let lastStarPos = -1

    // Search backwards in the original lastParagraph to find the last * that's not in a URL
    for (let i = lastParagraph.length - 1; i >= 0; i--) {
      if (isPositionInRanges(i, codeBlockRanges) || isPositionInRanges(i, inlineCodeRanges))
        continue

      if (lastParagraph[i] === '*') {
        if (sourceSingleAsteriskMarkers[i] !== '*')
          continue
        const absolutePos = paragraphOffset + i
        // Skip if it's in a URL, math block, or HTML tag
        if (!isWithinMathBlock(content, absolutePos) && !isWithinLinkOrImageUrl(content, absolutePos) && !isWithinHtmlTag(content, absolutePos)) {
          lastStarPos = i
          break
        }
      }
    }

    if (lastStarPos === -1) {
      return content
    }

    // Check if there's content after the last * in the original text (skipping URLs)
    let hasContentAfter = false
    for (let i = lastStarPos + 1; i < lastParagraph.length; i++) {
      const char = lastParagraph[i]
      if (char !== undefined && char.trim() !== '') {
        hasContentAfter = true
        break
      }
    }

    if (hasContentAfter) {
      needsAsteriskCompletion = true
    }
  }

  // Check underscore
  if (underscoreCount % 2 === 1) {
    // Find the last _ in the original lastParagraph, but skip those in URLs
    let lastUnderscorePos = -1

    // Search backwards in the original lastParagraph to find the last _ that's not in a URL
    for (let i = lastParagraph.length - 1; i >= 0; i--) {
      if (isPositionInRanges(i, codeBlockRanges) || isPositionInRanges(i, inlineCodeRanges))
        continue

      if (lastParagraph[i] === '_') {
        if (sourceSingleUnderscoreMarkers[i] !== '_')
          continue
        const absolutePos = paragraphOffset + i
        if (shouldIgnoreUnderscoreMarker(lastParagraph, i))
          continue
        // Skip if it's in a URL, math block, or HTML tag
        if (!isWithinMathBlock(content, absolutePos) && !isWithinLinkOrImageUrl(content, absolutePos) && !isWithinHtmlTag(content, absolutePos)) {
          lastUnderscorePos = i
          break
        }
      }
    }

    if (lastUnderscorePos === -1) {
      return content
    }

    // Check if there's content after the last _ in the original text (skipping URLs)
    let hasContentAfter = false
    for (let i = lastUnderscorePos + 1; i < lastParagraph.length; i++) {
      const char = lastParagraph[i]
      if (char !== undefined && char.trim() !== '') {
        hasContentAfter = true
        break
      }
    }

    if (hasContentAfter) {
      needsUnderscoreCompletion = true
    }
  }

  // Handle completions - if both need completion, complete based on which appears first in the string
  if (needsAsteriskCompletion && needsUnderscoreCompletion) {
    const firstStarPos = withoutDoubleAsterisk.indexOf('*')
    const firstUnderscorePos = withoutDoubleUnderscore.indexOf('_')

    // Complete the one that appears first in the string first
    if (firstStarPos < firstUnderscorePos) {
      // Asterisk appears first, complete underscore first, then asterisk
      return `${content}_*`
    }
    else {
      // Underscore appears first, complete asterisk first, then underscore
      return `${content}*_`
    }
  }

  if (needsAsteriskCompletion) {
    return `${content}*`
  }

  if (needsUnderscoreCompletion) {
    return `${content}_`
  }

  return content
}
