import { doubleAsteriskPattern, doubleUnderscorePattern, singleAsteriskPattern, singleUnderscorePattern, trailingStandaloneDashWithNewlinesPattern } from './pattern'
import { calculateParagraphOffset, getLastParagraphWithIndex } from './utils'

/**
 * Fix unclosed emphasis (* or _) syntax in streaming markdown
 *
 * Only processes the last paragraph (content after the last blank line).
 * This respects Markdown's rule that emphasis cannot span across paragraphs.
 */
export function fixEmphasis(content: string): string {
  // Find the last paragraph
  const lines = content.split('\n')
  const { lastParagraph, startIndex: paragraphStartIndex } = getLastParagraphWithIndex(content)

  // Check asterisk emphasis first (original behavior)
  // Remove ** to count only single *
  const withoutDoubleAsterisk = lastParagraph.replace(doubleAsteriskPattern, '')
  const asteriskMatches = withoutDoubleAsterisk.match(singleAsteriskPattern)
  const asteriskCount = asteriskMatches ? asteriskMatches.length : 0

  // Check underscore emphasis
  // Remove __ to count only single _
  const withoutDoubleUnderscore = lastParagraph.replace(doubleUnderscorePattern, '')
  const underscoreMatches = withoutDoubleUnderscore.match(singleUnderscorePattern)
  const underscoreCount = underscoreMatches ? underscoreMatches.length : 0

  // Track if we need to complete asterisk and/or underscore
  let needsAsteriskCompletion = false
  let needsUnderscoreCompletion = false
  let needsAsteriskRemoval = false
  let needsUnderscoreRemoval = false

  // Check asterisk
  if (asteriskCount % 2 === 1) {
    const lastStarPos = withoutDoubleAsterisk.lastIndexOf('*')
    const afterLast = withoutDoubleAsterisk.substring(lastStarPos + 1).trim()

    if (afterLast.length > 0) {
      needsAsteriskCompletion = true
    }
    else {
      needsAsteriskRemoval = true
    }
  }

  // Check underscore
  if (underscoreCount % 2 === 1) {
    const lastUnderscorePos = withoutDoubleUnderscore.lastIndexOf('_')
    const afterLast = withoutDoubleUnderscore.substring(lastUnderscorePos + 1).trim()

    if (afterLast.length > 0) {
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
    const paragraphOffset = calculateParagraphOffset(paragraphStartIndex, lines)
    const lastUnderscorePos = withoutDoubleUnderscore.lastIndexOf('_')
    const absoluteLastUnderscorePos = paragraphOffset + lastUnderscorePos
    let result = content.substring(0, absoluteLastUnderscorePos).trimEnd()
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
