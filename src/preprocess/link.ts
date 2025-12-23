import { codeBlockPattern, incompleteBracketPattern, incompleteLinkTextPattern, incompleteUrlPattern } from './pattern'
import { findLastNonEmptyLineIndex, getLastParagraphWithIndex, isInsideUnclosedCodeBlock } from './utils'

/**
 * Fix unclosed link/image syntax in streaming markdown
 *
 * Link syntax: [text](url "title")
 * Image syntax: ![alt](url "title")
 *
 * Only processes the last paragraph (content after the last blank line).
 * This respects Markdown's rule that links cannot span across paragraphs.
 *
 * @param content - Markdown content (potentially incomplete in stream mode)
 * @returns Content with auto-completed link/image syntax if needed
 *
 * @example
 * fixLink('[Google](https://www.goo')
 * // Returns: '[Google](https://www.goo)'
 *
 * @example
 * fixLink('[text](')
 * // Returns: '[text]()'
 *
 * @example
 * fixLink('[text]')
 * // Returns: '[text]()'
 *
 * @example
 * fixLink('[text')
 * // Returns: '[text]()'
 *
 * @example
 * fixLink('![alt](https://image.png')
 * // Returns: '![alt](https://image.png)'
 *
 * @example
 * fixLink('Text [')
 * // Returns: 'Text '
 * // Removes trailing standalone [ without content
 *
 * @example
 * fixLink('Text [\n')
 * // Returns: 'Text '
 * // Removes trailing standalone bracket and trailing newline
 */
export function fixLink(content: string): string {
  // Don't process if we're inside a code block (unclosed)
  if (isInsideUnclosedCodeBlock(content)) {
    return content
  }

  // Find the last paragraph (after the last blank line)
  const lines = content.split('\n')
  const { lastParagraph } = getLastParagraphWithIndex(content)

  // Remove code blocks from the last paragraph to avoid processing links inside them
  const lastParagraphWithoutCodeBlocks = lastParagraph.replace(codeBlockPattern, '')

  // Check the last non-empty line for trailing standalone bracket
  // This handles cases where content ends with [\n or [ with trailing whitespace
  // Start from the last line and work backwards to find the last non-empty line
  const lastNonEmptyLineIndex = findLastNonEmptyLineIndex(lines)

  // Process if we found a non-empty line (regardless of paragraph boundaries)
  // This ensures we remove trailing standalone brackets even when content ends with newline
  if (lastNonEmptyLineIndex >= 0) {
    const lastLine = lines[lastNonEmptyLineIndex]
    if (!lastLine) {
      return content
    }

    // First, remove trailing standalone [ or ![ (without any content after)
    // This prevents showing incomplete brackets that would create empty links
    // Check for both [ and ![ patterns
    const standaloneBracketMatch = lastLine.match(/(!?\[)\s*$/)
    if (standaloneBracketMatch && standaloneBracketMatch[1]) {
      const bracket = standaloneBracketMatch[1]
      const bracketPos = lastLine.lastIndexOf(bracket)
      // Check if there's any content after the bracket (excluding whitespace)
      const afterBracket = lastLine.substring(bracketPos + bracket.length).trim()
      // If bracket has no content after it (only whitespace or nothing), remove it
      if (afterBracket.length === 0) {
        // Remove the bracket and all trailing whitespace after it in this line
        // But keep any whitespace before the bracket
        const beforeBracket = lastLine.substring(0, bracketPos).trimEnd()
        const newLine = beforeBracket

        // Reconstruct content with the modified line
        const newLines = [...lines]
        newLines[lastNonEmptyLineIndex] = newLine

        // If the next line after the modified line is empty, remove it too
        // This handles cases like "Text [\n" where we want to remove both [ and the newline
        // But only if the bracket was at the end of the line (no content after it on the same line)
        if (lastNonEmptyLineIndex + 1 < newLines.length) {
          const nextLine = newLines[lastNonEmptyLineIndex + 1]
          if (nextLine !== undefined && nextLine.trim() === '') {
            newLines.splice(lastNonEmptyLineIndex + 1, 1)
          }
        }

        const result = newLines.join('\n')

        // Return immediately after removing standalone bracket
        return result
      }
    }
  }

  // Check for unclosed link/image syntax at the end
  // Using multiple specific patterns to avoid backtracking issues
  // Use lastParagraphWithoutCodeBlocks to avoid matching inside code blocks

  // Pattern 1: [text or ![text - incomplete bracket (no closing ])
  if (incompleteBracketPattern.test(lastParagraphWithoutCodeBlocks)) {
    return `${content}]()`
  }

  // Pattern 2: [text] or ![text] - missing URL part (has ] but no opening ())
  if (incompleteLinkTextPattern.test(lastParagraphWithoutCodeBlocks)) {
    return `${content}()`
  }

  // Pattern 3: [text]( or [text](url or ![text]( or ![text](url - incomplete URL (has ]( but no closing ))
  // Match link/image that has ]( but no closing )
  // Note: We don't check for markdown syntax in URLs because URLs commonly contain
  // characters like _, *, ~ which should not be treated as markdown syntax
  if (incompleteUrlPattern.test(lastParagraphWithoutCodeBlocks)) {
    return `${content})`
  }

  return content
}
