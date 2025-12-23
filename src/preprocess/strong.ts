import { codeBlockPattern, doubleAsteriskPattern, doubleUnderscorePattern, singleAsteriskPattern, singleUnderscorePattern, trailingStandaloneDashWithNewlinesPattern } from './pattern'
import { calculateParagraphOffset, getLastParagraphWithIndex, isInsideUnclosedCodeBlock } from './utils'

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
 * // Returns: 'List item\n\n**' (no completion, ** has no content)
 */
export function fixStrong(content: string): string {
  // Handle bare single * or _ first
  if (content === '*' || content === '_') {
    return ''
  }

  // Don't process if we're inside a code block (unclosed)
  if (isInsideUnclosedCodeBlock(content)) {
    return content
  }

  // Find the last paragraph (after the last blank line)
  const { lastParagraph } = getLastParagraphWithIndex(content)

  // Remove code blocks from the last paragraph to avoid processing strong inside them
  const lastParagraphWithoutCodeBlocks = lastParagraph.replace(codeBlockPattern, '')

  // Check if content ends with a single * or _ (not ** or __)
  const endsWithSingleAsterisk = content.endsWith('*') && !content.endsWith('**')
  const endsWithSingleUnderscore = content.endsWith('_') && !content.endsWith('__')

  // Count ** in the last paragraph only (excluding code blocks)
  const asteriskMatches = lastParagraphWithoutCodeBlocks.match(doubleAsteriskPattern)
  const asteriskCount = asteriskMatches ? asteriskMatches.length : 0

  // Count __ in the last paragraph only (excluding code blocks)
  const underscoreMatches = lastParagraphWithoutCodeBlocks.match(doubleUnderscorePattern)
  const underscoreCount = underscoreMatches ? underscoreMatches.length : 0

  // Track what needs to be done
  let needsAsteriskCompletion = false
  let needsUnderscoreCompletion = false
  let needsAsteriskRemoval = false
  let needsUnderscoreRemoval = false

  // Check asterisk
  if (asteriskCount % 2 === 1) {
    const lastStarPos = lastParagraphWithoutCodeBlocks.lastIndexOf('**')
    const afterLast = lastParagraphWithoutCodeBlocks.substring(lastStarPos + 2).trim()

    if (afterLast.length > 0) {
      needsAsteriskCompletion = true
    }
    else {
      needsAsteriskRemoval = true
    }
  }

  // Check underscore
  if (underscoreCount % 2 === 1) {
    const lastUnderscorePos = lastParagraphWithoutCodeBlocks.lastIndexOf('__')
    const afterLast = lastParagraphWithoutCodeBlocks.substring(lastUnderscorePos + 2).trim()

    if (afterLast.length > 0) {
      needsUnderscoreCompletion = true
    }
    else {
      needsUnderscoreRemoval = true
    }
  }

  // Handle trailing single * or _ when there's an unclosed ** or __
  let removedTrailingSingle = false
  if (endsWithSingleAsterisk && (needsAsteriskCompletion || needsAsteriskRemoval)) {
    // Remove the trailing single * first
    content = content.slice(0, -1)
    removedTrailingSingle = true
    // Recalculate after removal
    const { lastParagraph: newLastParagraph } = getLastParagraphWithIndex(content)
    const newLastParagraphWithoutCodeBlocks = newLastParagraph.replace(codeBlockPattern, '')
    const newAsteriskMatches = newLastParagraphWithoutCodeBlocks.match(doubleAsteriskPattern)
    const newAsteriskCount = newAsteriskMatches ? newAsteriskMatches.length : 0
    if (newAsteriskCount % 2 === 1) {
      const lastStarPos = newLastParagraphWithoutCodeBlocks.lastIndexOf('**')
      const afterLast = newLastParagraphWithoutCodeBlocks.substring(lastStarPos + 2).trim()
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
    // Recalculate after removal
    const { lastParagraph: newLastParagraph } = getLastParagraphWithIndex(content)
    const newLastParagraphWithoutCodeBlocks = newLastParagraph.replace(codeBlockPattern, '')
    const newUnderscoreMatches = newLastParagraphWithoutCodeBlocks.match(doubleUnderscorePattern)
    const newUnderscoreCount = newUnderscoreMatches ? newUnderscoreMatches.length : 0
    if (newUnderscoreCount % 2 === 1) {
      const lastUnderscorePos = newLastParagraphWithoutCodeBlocks.lastIndexOf('__')
      const afterLast = newLastParagraphWithoutCodeBlocks.substring(lastUnderscorePos + 2).trim()
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
    const { lastParagraph: newLastParagraph, startIndex: newParagraphStartIndex } = getLastParagraphWithIndex(content)
    const lastUnderscorePos = newLastParagraph.lastIndexOf('__')
    const paragraphOffset = calculateParagraphOffset(newParagraphStartIndex, content.split('\n'))
    const absoluteLastUnderscorePos = paragraphOffset + lastUnderscorePos
    let result = content.substring(0, absoluteLastUnderscorePos).trimEnd()
    if (trailingStandaloneDashWithNewlinesPattern.test(result)) {
      result = result.replace(trailingStandaloneDashWithNewlinesPattern, '$1')
    }
    return result
  }

  // Handle completions - check for both ** and __, and also check for single * or _
  if (needsAsteriskCompletion && needsUnderscoreCompletion) {
    // Both need completion - complete the one that appears first
    const firstAsteriskPos = lastParagraphWithoutCodeBlocks.indexOf('**')
    const firstUnderscorePos = lastParagraphWithoutCodeBlocks.indexOf('__')
    if (firstAsteriskPos < firstUnderscorePos) {
      // Asterisk appears first, complete underscore first, then asterisk
      return `${content}__**`
    }
    else {
      // Underscore appears first, complete asterisk first, then underscore
      return `${content}**__`
    }
  }

  if (needsAsteriskCompletion) {
    // Check if there's also an unclosed single * that needs completion
    // But only if we didn't just remove a trailing single *
    if (!removedTrailingSingle) {
      const { lastParagraph: currentLastParagraph } = getLastParagraphWithIndex(content)
      const currentLastParagraphWithoutCodeBlocks = currentLastParagraph.replace(codeBlockPattern, '')
      const withoutDoubleAsterisk = currentLastParagraphWithoutCodeBlocks.replace(doubleAsteriskPattern, '')
      const singleAsteriskMatches = withoutDoubleAsterisk.match(singleAsteriskPattern)
      const singleAsteriskCount = singleAsteriskMatches ? singleAsteriskMatches.length : 0
      if (singleAsteriskCount % 2 === 1) {
        // Complete both ** and *
        return `${content}***`
      }
    }
    return `${content}**`
  }

  if (needsUnderscoreCompletion) {
    // Check if there's also an unclosed single _ that needs completion
    // But only if we didn't just remove a trailing single _
    if (!removedTrailingSingle) {
      const { lastParagraph: currentLastParagraph } = getLastParagraphWithIndex(content)
      const currentLastParagraphWithoutCodeBlocks = currentLastParagraph.replace(codeBlockPattern, '')
      const withoutDoubleUnderscore = currentLastParagraphWithoutCodeBlocks.replace(doubleUnderscorePattern, '')
      const singleUnderscoreMatches = withoutDoubleUnderscore.match(singleUnderscorePattern)
      const singleUnderscoreCount = singleUnderscoreMatches ? singleUnderscoreMatches.length : 0
      if (singleUnderscoreCount % 2 === 1) {
        // Complete both __ and _
        return `${content}___`
      }
    }
    return `${content}__`
  }

  return content
}
