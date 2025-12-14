import { doubleAsteriskPattern, doubleUnderscorePattern, trailingStandaloneDashWithNewlinesPattern } from './pattern'

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
  // Find the last paragraph (after the last blank line)
  // A blank line is defined as a line with only whitespace
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

  // Check asterisk strong formatting first (original behavior)
  // Count ** in the last paragraph only
  const asteriskMatches = lastParagraph.match(doubleAsteriskPattern)
  const asteriskCount = asteriskMatches ? asteriskMatches.length : 0

  // Only complete if:
  // 1. Odd number of ** (unclosed)
  // 2. There's actual content after the last ** (not just `**` alone)
  if (asteriskCount % 2 === 1) {
    const lastStarPos = lastParagraph.lastIndexOf('**')
    const afterLast = lastParagraph.substring(lastStarPos + 2).trim()

    // If there's content after **, complete it
    if (afterLast.length > 0) {
      return `${content}**`
    }
    else {
      // Remove the trailing ** to avoid showing it as plain text
      let result = content.slice(0, -2)
      // If after removing **, we're left with a line ending in `- ` or `-\t`, remove the standalone dash line
      // This prevents leaving standalone list markers that could cause parsing issues
      if (trailingStandaloneDashWithNewlinesPattern.test(result)) {
        result = result.replace(trailingStandaloneDashWithNewlinesPattern, '$1')
      }
      return result
    }
  }

  // If no asterisk strong to complete, check underscore strong formatting
  // Count __ in the last paragraph only
  const underscoreMatches = lastParagraph.match(doubleUnderscorePattern)
  const underscoreCount = underscoreMatches ? underscoreMatches.length : 0

  // Only complete if:
  // 1. Odd number of __ (unclosed)
  // 2. There's actual content after the last __ (not just `__` alone)
  if (underscoreCount % 2 === 1) {
    const lastUnderscorePos = lastParagraph.lastIndexOf('__')
    const afterLast = lastParagraph.substring(lastUnderscorePos + 2).trim()

    // If there's content after __, complete it
    if (afterLast.length > 0) {
      return `${content}__`
    }
    else {
      // Remove the trailing __ to avoid showing it as plain text
      let result = content.slice(0, -2)
      // If after removing __, we're left with a line ending in `- ` or `-\t`, remove the standalone dash line
      // This prevents leaving standalone list markers that could cause parsing issues
      if (trailingStandaloneDashWithNewlinesPattern.test(result)) {
        result = result.replace(trailingStandaloneDashWithNewlinesPattern, '$1')
      }
      return result
    }
  }

  return content
}
