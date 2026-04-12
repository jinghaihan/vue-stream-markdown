import { codeBlockPattern, doubleTildePattern } from './pattern'
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
  // Don't process if we're inside a code block (unclosed)
  if (isInsideUnclosedCodeBlock(content)) {
    return content
  }

  // Find the last paragraph (after the last blank line)
  // A blank line is defined as a line with only whitespace
  const { lastParagraph, startIndex: paragraphStartIndex } = getLastParagraphWithIndex(content)

  // Remove code blocks from the last paragraph to avoid processing ~~ inside them
  const lastParagraphWithoutCodeBlocks = lastParagraph.replace(codeBlockPattern, '')
  // Remove URLs to avoid counting markdown syntax inside URLs (URLs may contain _, *, ~)
  const lastParagraphWithoutCodeBlocksAndUrls = removeUrlsFromText(lastParagraphWithoutCodeBlocks)

  // Count ~~ in the last paragraph only (excluding code blocks and URLs)
  const matches = lastParagraphWithoutCodeBlocksAndUrls.match(doubleTildePattern)
  const count = matches ? matches.length : 0

  // Check if the content ends with a single ~ (not ~~)
  const endsWithSingleTilde = content.endsWith('~') && !content.endsWith('~~')

  // If ends with single ~, we need to check if it should be completed to ~~
  if (endsWithSingleTilde) {
    // Remove the trailing single ~ and check if we have odd number of ~~
    const contentWithoutLastTilde = content.slice(0, -1)
    const lastParagraphWithoutTilde = contentWithoutLastTilde.split('\n').slice(paragraphStartIndex).join('\n')
    const lastParagraphWithoutTildeAndCodeBlocks = lastParagraphWithoutTilde.replace(codeBlockPattern, '')
    const lastParagraphWithoutTildeAndCodeBlocksAndUrls = removeUrlsFromText(lastParagraphWithoutTildeAndCodeBlocks)
    const matchesWithoutTilde = lastParagraphWithoutTildeAndCodeBlocksAndUrls.match(doubleTildePattern)
    const countWithoutTilde = matchesWithoutTilde ? matchesWithoutTilde.length : 0

    if (countWithoutTilde % 2 === 1) {
      // Odd number of ~~ means we have an unclosed strikethrough
      // But we need to make sure there's actual content after the last ~~
      const lastTildePos = lastParagraphWithoutTildeAndCodeBlocksAndUrls.lastIndexOf('~~')
      if (lastTildePos >= 0) {
        const afterLastTilde = lastParagraphWithoutTildeAndCodeBlocksAndUrls.substring(lastTildePos + 2)
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
    // Find the last ~~ in original lastParagraph, skipping code blocks
    const lines = content.split('\n')
    let actualLastTildePos = -1
    let inCodeBlock = false
    for (let i = 0; i < lastParagraph.length - 1; i++) {
      // Check for code block fences
      if (lastParagraph.substring(i, i + 3) === '```') {
        inCodeBlock = !inCodeBlock
        i += 2 // Skip the next two backticks
        continue
      }
      // Skip if inside code block
      if (inCodeBlock) {
        continue
      }
      // Check for ~~
      if (lastParagraph.substring(i, i + 2) === '~~') {
        actualLastTildePos = i
        i += 1 // Skip the second ~
      }
    }
    if (actualLastTildePos === -1) {
      return content
    }
    const paragraphOffset = calculateParagraphOffset(paragraphStartIndex, lines)
    const absoluteLastTildePos = paragraphOffset + actualLastTildePos

    // Check if the tilde is in math block, link/image URL, or HTML tag
    if (isWithinMathBlock(content, absoluteLastTildePos) || isWithinLinkOrImageUrl(content, absoluteLastTildePos) || isWithinHtmlTag(content, absoluteLastTildePos)) {
      // Don't process if inside math block, link/image URL, or HTML tag
      return content
    }

    const afterLast = lastParagraphWithoutCodeBlocksAndUrls.substring(lastParagraphWithoutCodeBlocksAndUrls.lastIndexOf('~~') + 2)
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
