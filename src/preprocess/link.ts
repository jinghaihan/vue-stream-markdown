import { incompleteBracketPattern, incompleteLinkTextPattern, incompleteUrlPattern, trailingStandaloneBracketPattern } from './pattern'

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
  // Find the last paragraph (after the last blank line)
  const lines = content.split('\n')
  let paragraphStartIndex = 0

  // Find the last blank line
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]!
    if (line.trim() === '') {
      paragraphStartIndex = i + 1
      break
    }
  }

  // Get the last paragraph
  const lastParagraph = lines.slice(paragraphStartIndex).join('\n')

  // Check the last non-empty line for trailing standalone bracket
  // This handles cases where content ends with [\n or [ with trailing whitespace
  // Start from the last line and work backwards to find the last non-empty line
  let lastNonEmptyLineIndex = lines.length - 1
  while (lastNonEmptyLineIndex >= 0 && lines[lastNonEmptyLineIndex]?.trim() === '') {
    lastNonEmptyLineIndex--
  }

  // Process if we found a non-empty line (regardless of paragraph boundaries)
  // This ensures we remove trailing standalone brackets even when content ends with newline
  if (lastNonEmptyLineIndex >= 0) {
    const lastLine = lines[lastNonEmptyLineIndex]!

    // First, remove trailing standalone [ (without any content after)
    // This prevents showing incomplete brackets that would create empty links
    // Note: Only handles [ to avoid issues during streaming
    if (trailingStandaloneBracketPattern.test(lastLine)) {
      const bracketMatch = lastLine.match(trailingStandaloneBracketPattern)
      if (bracketMatch) {
        const bracket = bracketMatch[1]!
        const bracketPos = lastLine.lastIndexOf(bracket)
        // Check if there's any content after the bracket (excluding whitespace)
        const afterBracket = lastLine.substring(bracketPos + bracket.length).trim()
        // If bracket has no content after it (only whitespace or nothing), remove it
        if (afterBracket.length === 0) {
          // Remove the bracket and all trailing whitespace after it in this line
          // But keep any whitespace before the bracket
          const beforeBracket = lastLine.substring(0, bracketPos)
          const newLine = beforeBracket

          // Reconstruct content with the modified line
          const newLines = [...lines]
          newLines[lastNonEmptyLineIndex] = newLine

          // If the next line after the modified line is empty, remove it too
          // This handles cases like "Text [\n" where we want to remove both [ and the newline
          if (lastNonEmptyLineIndex + 1 < newLines.length && newLines[lastNonEmptyLineIndex + 1]!.trim() === '') {
            newLines.splice(lastNonEmptyLineIndex + 1, 1)
          }

          const result = newLines.join('\n')

          // Return immediately after removing standalone bracket
          return result
        }
      }
    }
  }

  // Check for unclosed link/image syntax at the end
  // Using multiple specific patterns to avoid backtracking issues

  // Pattern 1: [text - incomplete bracket (no closing ])
  if (incompleteBracketPattern.test(lastParagraph))
    return `${content}]()`

  // Pattern 2: [text] - missing URL part (has ] but no opening ())
  if (incompleteLinkTextPattern.test(lastParagraph))
    return `${content}()`

  // Pattern 3: [text]( or [text](url - incomplete URL (has ]( but no closing ))
  // Match link/image that has ]( but no closing )
  if (incompleteUrlPattern.test(lastParagraph))
    return `${content})`

  return content
}
