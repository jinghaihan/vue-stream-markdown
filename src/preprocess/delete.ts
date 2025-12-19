import { doubleTildePattern } from './pattern'
import { getLastParagraphWithIndex } from './utils'

/**
 * Fix unclosed strikethrough (~~) syntax in streaming markdown
 *
 * Only processes the last paragraph (content after the last blank line).
 * This respects Markdown's rule that ~~ cannot span across paragraphs.
 *
 * @param content - Markdown content (potentially incomplete in stream mode)
 * @returns Content with auto-completed ~~ if needed
 *
 * @example
 * fixDelete('Hello ~~world')
 * // Returns: 'Hello ~~world~~'
 *
 * @example
 * fixDelete('Para1 ~~deleted~~\n\nPara2 ~~text')
 * // Returns: 'Para1 ~~deleted~~\n\nPara2 ~~text~~'
 *
 * @example
 * fixDelete('List item\n\n~~')
 * // Returns: 'List item\n\n~~' (no completion, ~~ has no content)
 */
export function fixDelete(content: string): string {
  // Find the last paragraph (after the last blank line)
  // A blank line is defined as a line with only whitespace
  const { lastParagraph, startIndex: paragraphStartIndex } = getLastParagraphWithIndex(content)

  // Count ~~ in the last paragraph only
  const matches = lastParagraph.match(doubleTildePattern)
  const count = matches ? matches.length : 0

  // Check if the content ends with a single ~ (not ~~)
  const endsWithSingleTilde = content.endsWith('~') && !content.endsWith('~~')

  // If ends with single ~, we need to check if it should be completed to ~~
  if (endsWithSingleTilde) {
    // Remove the trailing single ~ and check if we have odd number of ~~
    const contentWithoutLastTilde = content.slice(0, -1)
    const lastParagraphWithoutTilde = contentWithoutLastTilde.split('\n').slice(paragraphStartIndex).join('\n')
    const matchesWithoutTilde = lastParagraphWithoutTilde.match(doubleTildePattern)
    const countWithoutTilde = matchesWithoutTilde ? matchesWithoutTilde.length : 0

    if (countWithoutTilde % 2 === 1) {
      // Odd number of ~~ means we have an unclosed strikethrough
      // But we need to make sure there's actual content after the last ~~
      const lastTildePos = lastParagraphWithoutTilde.lastIndexOf('~~')
      if (lastTildePos >= 0) {
        const afterLastTilde = lastParagraphWithoutTilde.substring(lastTildePos + 2)
        // Only complete if there's actual content (including whitespace, but not empty)
        if (afterLastTilde.length > 0) {
          return `${content}~`
        }
      }
    }
    else {
      // Return the content without the last ~
      return contentWithoutLastTilde
    }
  }

  // Only complete if:
  // 1. Odd number of ~~ (unclosed)
  // 2. There's actual content after the last ~~ (not just `~~` alone)
  if (count % 2 === 1) {
    const lastTildePos = lastParagraph.lastIndexOf('~~')
    const afterLast = lastParagraph.substring(lastTildePos + 2)
    const afterLastTrimmed = afterLast.trim()

    // If there's content after ~~, complete it
    if (afterLastTrimmed.length > 0) {
      return `${content}~~`
    }
    else {
      // Remove the trailing ~~ and any whitespace before and after it
      const beforeTilde = content.substring(0, content.length - afterLast.length - 2)
      // Remove trailing whitespace from the result
      return beforeTilde.trimEnd()
    }
  }

  return content
}
