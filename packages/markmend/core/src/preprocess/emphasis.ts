import {
  codeBlockPattern,
  singleAsteriskPattern,
  singleUnderscorePattern,
} from './pattern'
import {
  calculateParagraphOffset,
  findClosedCodeBlockRanges,
  findInlineCodeRanges,
  getLastParagraphWithIndex,
  isInsideUnclosedCodeBlock,
  isPositionInRanges,
  isWithinHtmlTag,
  isWithinLinkOrImageUrl,
  isWithinMathBlock,
  maskInlineCodeMarkdownMarkers,
  maskInvalidAsteriskMarkers,
  maskInvalidUnderscoreMarkers,
  maskPairedMarkerRuns,
  maskThematicBreakMarkers,
  removeUrlsFromText,
  shouldIgnoreUnderscoreMarker,
} from './utils'

/**
 * Fix unclosed emphasis (* or _) syntax in streaming markdown
 *
 * Only processes the last paragraph (content after the last blank line).
 * This respects Markdown's rule that emphasis cannot span across paragraphs.
 */
export function fixEmphasis(content: string): string {
  // Don't process if we're inside a code block (unclosed)
  if (isInsideUnclosedCodeBlock(content)) {
    return content
  }

  // Find the last paragraph
  const lines = content.split('\n')
  const { lastParagraph, startIndex: paragraphStartIndex } = getLastParagraphWithIndex(content)
  const codeBlockRanges = findClosedCodeBlockRanges(lastParagraph)
  const inlineCodeRanges = findInlineCodeRanges(lastParagraph, codeBlockRanges)

  // Remove code blocks and mask Markdown markers inside inline code to avoid
  // treating code content as incomplete emphasis.
  const lastParagraphWithoutInlineCodeMarkers = maskInlineCodeMarkdownMarkers(lastParagraph, inlineCodeRanges)
  const lastParagraphWithoutThematicBreakMarkers = maskThematicBreakMarkers(lastParagraphWithoutInlineCodeMarkers)
  const lastParagraphWithoutInvalidAsterisks = maskInvalidAsteriskMarkers(lastParagraphWithoutThematicBreakMarkers)
  const lastParagraphWithoutInvalidMarkers = maskInvalidUnderscoreMarkers(lastParagraphWithoutInvalidAsterisks)
  const sourceSingleAsteriskMarkers = maskPairedMarkerRuns(lastParagraphWithoutInvalidMarkers, '*')
  const sourceSingleUnderscoreMarkers = maskPairedMarkerRuns(lastParagraphWithoutInvalidMarkers, '_')
  const lastParagraphWithoutCodeBlocks = lastParagraphWithoutInvalidMarkers.replace(codeBlockPattern, '')
  // Remove URLs to avoid counting markdown syntax inside URLs (URLs may contain _, *, ~)
  const lastParagraphWithoutCodeBlocksAndUrls = removeUrlsFromText(lastParagraphWithoutCodeBlocks)
  const lastParagraphForMarkerCounting = lastParagraphWithoutCodeBlocksAndUrls

  // Check asterisk emphasis first (original behavior)
  // Mask complete pairs while preserving the source offsets of odd runs.
  const withoutDoubleAsterisk = maskPairedMarkerRuns(lastParagraphForMarkerCounting, '*')
  const asteriskMatches = withoutDoubleAsterisk.match(singleAsteriskPattern)
  const asteriskCount = asteriskMatches ? asteriskMatches.length : 0

  // Check underscore emphasis
  const withoutDoubleUnderscore = maskPairedMarkerRuns(lastParagraphForMarkerCounting, '_')
  const underscoreMatches = withoutDoubleUnderscore.match(singleUnderscorePattern)
  const underscoreCount = underscoreMatches ? underscoreMatches.length : 0

  // Track if we need to complete asterisk and/or underscore
  let needsAsteriskCompletion = false
  let needsUnderscoreCompletion = false

  // Check asterisk
  if (asteriskCount % 2 === 1) {
    // Find the last * in the original lastParagraph, but skip those in URLs
    // We need to find the position in the original text, not in the URL-removed text
    const paragraphOffset = calculateParagraphOffset(paragraphStartIndex, lines)
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
    const paragraphOffset = calculateParagraphOffset(paragraphStartIndex, lines)
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
