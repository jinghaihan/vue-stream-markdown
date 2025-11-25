import { incompleteBracketPattern, incompleteLinkTextPattern, incompleteUrlPattern } from './pattern'

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
 */
export function fixLink(content: string): string {
  // Find the last paragraph (after the last blank line)
  const lines = content.split('\n')
  let paragraphStartIndex = 0

  // Find the last blank line
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === '') {
      paragraphStartIndex = i + 1
      break
    }
  }

  // Get the last paragraph
  const lastParagraph = lines.slice(paragraphStartIndex).join('\n')

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
