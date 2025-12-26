import {
  codeBlockPattern,
  doubleAsteriskPattern,
  doubleUnderscorePattern,
  singleAsteriskPattern,
  singleUnderscorePattern,
  trailingStandaloneDashWithNewlinesPattern,
} from './pattern'
import {
  calculateParagraphOffset,
  getLastParagraphWithIndex,
  isInsideUnclosedCodeBlock,
  isWithinHtmlTag,
  isWithinLinkOrImageUrl,
  isWithinMathBlock,
  removeUrlsFromText,
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

  // Remove code blocks from the last paragraph to avoid processing emphasis inside them
  const lastParagraphWithoutCodeBlocks = lastParagraph.replace(codeBlockPattern, '')
  // Remove URLs to avoid counting markdown syntax inside URLs (URLs may contain _, *, ~)
  const lastParagraphWithoutCodeBlocksAndUrls = removeUrlsFromText(lastParagraphWithoutCodeBlocks)

  // Check asterisk emphasis first (original behavior)
  // Remove ** to count only single *
  const withoutDoubleAsterisk = lastParagraphWithoutCodeBlocksAndUrls.replace(doubleAsteriskPattern, '')
  const asteriskMatches = withoutDoubleAsterisk.match(singleAsteriskPattern)
  const asteriskCount = asteriskMatches ? asteriskMatches.length : 0

  // Check underscore emphasis
  // Remove __ to count only single _
  const withoutDoubleUnderscore = lastParagraphWithoutCodeBlocksAndUrls.replace(doubleUnderscorePattern, '')
  const underscoreMatches = withoutDoubleUnderscore.match(singleUnderscorePattern)
  const underscoreCount = underscoreMatches ? underscoreMatches.length : 0

  // Track if we need to complete asterisk and/or underscore
  let needsAsteriskCompletion = false
  let needsUnderscoreCompletion = false
  let needsAsteriskRemoval = false
  let needsUnderscoreRemoval = false

  // Check asterisk
  if (asteriskCount % 2 === 1) {
    // Find the last * in the original lastParagraph, but skip those in URLs
    // We need to find the position in the original text, not in the URL-removed text
    const paragraphOffset = calculateParagraphOffset(paragraphStartIndex, lines)
    let lastStarPos = -1

    // Search backwards in the original lastParagraph to find the last * that's not in a URL
    for (let i = lastParagraph.length - 1; i >= 0; i--) {
      if (lastParagraph[i] === '*') {
        const absolutePos = paragraphOffset + i
        // Skip if it's part of ** (we already removed those)
        if (i > 0 && lastParagraph[i - 1] === '*') {
          continue
        }
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
      const absolutePos = paragraphOffset + i
      // Skip if it's in a URL, math block, or HTML tag
      if (isWithinMathBlock(content, absolutePos) || isWithinLinkOrImageUrl(content, absolutePos) || isWithinHtmlTag(content, absolutePos)) {
        continue
      }
      const char = lastParagraph[i]
      if (char !== undefined && char.trim() !== '') {
        hasContentAfter = true
        break
      }
    }

    if (hasContentAfter) {
      needsAsteriskCompletion = true
    }
    else {
      needsAsteriskRemoval = true
    }
  }

  // Check underscore
  if (underscoreCount % 2 === 1) {
    // Find the last _ in the original lastParagraph, but skip those in URLs
    const paragraphOffset = calculateParagraphOffset(paragraphStartIndex, lines)
    let lastUnderscorePos = -1

    // Search backwards in the original lastParagraph to find the last _ that's not in a URL
    for (let i = lastParagraph.length - 1; i >= 0; i--) {
      if (lastParagraph[i] === '_') {
        const absolutePos = paragraphOffset + i
        // Skip if it's part of __ (we already removed those)
        if (i > 0 && lastParagraph[i - 1] === '_') {
          continue
        }
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
      const absolutePos = paragraphOffset + i
      // Skip if it's in a URL, math block, or HTML tag
      if (isWithinMathBlock(content, absolutePos) || isWithinLinkOrImageUrl(content, absolutePos) || isWithinHtmlTag(content, absolutePos)) {
        continue
      }
      const char = lastParagraph[i]
      if (char !== undefined && char.trim() !== '') {
        hasContentAfter = true
        break
      }
    }

    if (hasContentAfter) {
      needsUnderscoreCompletion = true
    }
    else {
      needsUnderscoreRemoval = true
    }
  }

  // Handle removals first (they take precedence)
  if (needsAsteriskRemoval) {
    // Remove the trailing * to avoid showing it as plain text
    let result = content.slice(0, -1).trimEnd()
    // If after removing *, we're left with a line ending in `- ` or `-\t`, remove the standalone dash line
    if (trailingStandaloneDashWithNewlinesPattern.test(result)) {
      result = result.replace(trailingStandaloneDashWithNewlinesPattern, '$1')
    }
    return result
  }

  if (needsUnderscoreRemoval) {
    // Remove the trailing _ and all whitespace after it
    // Find the last _ position in original text (already calculated above)
    const paragraphOffset = calculateParagraphOffset(paragraphStartIndex, lines)
    let lastUnderscorePosInOriginal = -1
    for (let i = lastParagraph.length - 1; i >= 0; i--) {
      if (lastParagraph[i] === '_' && (i === 0 || lastParagraph[i - 1] !== '_')) {
        const absolutePos = paragraphOffset + i
        if (!isWithinMathBlock(content, absolutePos) && !isWithinLinkOrImageUrl(content, absolutePos) && !isWithinHtmlTag(content, absolutePos)) {
          lastUnderscorePosInOriginal = absolutePos
          break
        }
      }
    }
    if (lastUnderscorePosInOriginal === -1) {
      return content
    }
    let result = content.substring(0, lastUnderscorePosInOriginal).trimEnd()
    // If after removing _, we're left with a line ending in `- ` or `-\t`, remove the standalone dash line
    if (trailingStandaloneDashWithNewlinesPattern.test(result)) {
      result = result.replace(trailingStandaloneDashWithNewlinesPattern, '$1')
    }
    return result
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
