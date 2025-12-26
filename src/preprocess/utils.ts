import type { PreprocessContext } from '../types'
import { codeBlockPattern, incompleteLinkImageUrlPattern, linkImagePattern } from './pattern'

/**
 * Find the start index of the last paragraph in content
 * A paragraph is defined as content after the last blank line
 *
 * @param lines - Array of lines from content.split('\n')
 * @param skipTrailingEmpty - If true, skip the last element if it's empty (from trailing \n)
 * @returns The start index of the last paragraph
 */
export function findLastParagraphStart(lines: string[], skipTrailingEmpty = false): number {
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]
    // Handle undefined (shouldn't happen, but be safe)
    if (line === undefined) {
      continue
    }

    // Skip the last element if it's empty (from trailing \n)
    if (skipTrailingEmpty && i === lines.length - 1 && line.trim() === '') {
      continue
    }

    if (line.trim() === '') {
      return i + 1
    }
  }
  return 0
}

/**
 * Get the last paragraph from content
 *
 * @param content - Markdown content
 * @param skipTrailingEmpty - If true, skip trailing empty line when finding paragraph start
 * @returns The last paragraph content
 */
export function getLastParagraph(content: string, skipTrailingEmpty = false): string {
  const lines = content.split('\n')
  const startIndex = findLastParagraphStart(lines, skipTrailingEmpty)
  return lines.slice(startIndex).join('\n')
}

/**
 * Get the last paragraph and its start index
 *
 * @param content - Markdown content
 * @param skipTrailingEmpty - If true, skip trailing empty line when finding paragraph start
 * @returns Object with lastParagraph and startIndex
 */
export function getLastParagraphWithIndex(
  content: string,
  skipTrailingEmpty = false,
): { lastParagraph: string, startIndex: number } {
  const lines = content.split('\n')
  const startIndex = findLastParagraphStart(lines, skipTrailingEmpty)
  return {
    lastParagraph: lines.slice(startIndex).join('\n'),
    startIndex,
  }
}

/**
 * Find the index of the last non-empty line
 *
 * @param lines - Array of lines
 * @returns The index of the last non-empty line, or -1 if all lines are empty
 */
export function findLastNonEmptyLineIndex(lines: string[]): number {
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]
    if (line && line.trim() !== '') {
      return i
    }
  }
  return -1
}

/**
 * Get the last non-empty line
 *
 * @param lines - Array of lines
 * @returns The last non-empty line, or undefined if all lines are empty
 */
export function getLastNonEmptyLine(lines: string[]): string | undefined {
  const index = findLastNonEmptyLineIndex(lines)
  return index >= 0 ? lines[index] : undefined
}

/**
 * Calculate the absolute position in content from a relative position in a paragraph
 *
 * @param paragraphStartIndex - The line index where the paragraph starts
 * @param relativePos - The position relative to the paragraph start
 * @param lines - All lines from content.split('\n')
 * @returns The absolute position in the full content
 */
export function calculateAbsolutePosition(
  paragraphStartIndex: number,
  relativePos: number,
  lines: string[],
): number {
  if (paragraphStartIndex === 0) {
    return relativePos
  }

  const beforeParagraph = lines.slice(0, paragraphStartIndex).join('\n')
  return beforeParagraph.length > 0 ? beforeParagraph.length + 1 + relativePos : relativePos
}

/**
 * Calculate the paragraph offset for absolute position calculations
 *
 * @param paragraphStartIndex - The line index where the paragraph starts
 * @param lines - All lines from content.split('\n')
 * @returns The offset to add to relative positions
 */
export function calculateParagraphOffset(paragraphStartIndex: number, lines: string[]): number {
  if (paragraphStartIndex === 0) {
    return 0
  }

  const beforeParagraph = lines.slice(0, paragraphStartIndex).join('\n')
  return beforeParagraph.length > 0 ? beforeParagraph.length + 1 : 0
}

/**
 * Check if a position is within a code block (between ``` markers)
 *
 * @param text - The text to check
 * @param position - The position to check
 * @returns True if the position is within a code block
 */
export function isWithinCodeBlock(text: string, position: number): boolean {
  let inCodeBlock = false

  for (let i = 0; i < position; i += 1) {
    // Check for triple backticks
    if (text[i] === '`' && text[i + 1] === '`' && text[i + 2] === '`') {
      inCodeBlock = !inCodeBlock
      i += 2 // Skip the next two backticks
    }
  }

  return inCodeBlock
}

/**
 * Check if content is inside an unclosed code block
 * This is equivalent to checking if the end of content is within a code block
 *
 * @param content - The content to check
 * @returns True if content is inside an unclosed code block
 */
export function isInsideUnclosedCodeBlock(content: string): boolean {
  return isWithinCodeBlock(content, content.length)
}

/**
 * Check if a position is within a math block (between $ or $$ delimiters)
 *
 * Note: we intentionally ignore single `$` here so that currency values
 * like `$7,000` do not toggle "math mode" and accidentally suppress
 * other preprocessors (e.g. strong/emphasis completion) later in the
 * document. All math-related features in this project use `$$` as the
 * delimiter (see math/inline-math tests), so this behavior is safe.
 *
 * @param text - The text to check
 * @param position - The position to check
 * @returns True if the position is within a math block
 */
export function isWithinMathBlock(
  text: string,
  position: number,
  options?: Pick<PreprocessContext, 'singleDollarTextMath'>,
): boolean {
  let inBlockMath = false
  let inInlineMath = false
  const singleDollarEnabled = options?.singleDollarTextMath === true

  for (let i = 0; i < text.length && i < position; i += 1) {
    // Skip escaped dollar signs
    if (text[i] === '\\' && text[i + 1] === '$') {
      i += 1 // Skip the next character
      continue
    }

    // Only treat `$$` as block math delimiters
    if (text[i] === '$' && text[i + 1] === '$') {
      inBlockMath = !inBlockMath
      i += 1 // Skip the second $
      continue
    }

    // Treat single `$` as inline math when enabled
    if (singleDollarEnabled && !inBlockMath && text[i] === '$') {
      inInlineMath = !inInlineMath
    }
  }

  return inBlockMath || inInlineMath
}

/**
 * Helper to check if position is before closing paren on same line
 *
 * @param text - The text to check
 * @param position - The position to check
 * @returns True if there's a closing paren on the same line after the position
 */
function isBeforeClosingParen(text: string, position: number): boolean {
  for (let j = position; j < text.length; j += 1) {
    if (text[j] === ')') {
      return true
    }
    if (text[j] === '\n') {
      return false
    }
  }
  return false
}

/**
 * Check if a position is within a link or image URL
 * Links and images have the format [text](url) or ![alt](url)
 *
 * @param text - The text to check
 * @param position - The position to check
 * @returns True if the position is within a link or image URL
 */
export function isWithinLinkOrImageUrl(
  text: string,
  position: number,
): boolean {
  // Search backwards from position to find if we're inside a (url) part
  for (let i = position - 1; i >= 0; i -= 1) {
    if (text[i] === ')') {
      return false
    }
    if (text[i] === '(') {
      // Check if there's a ] immediately before the (
      if (i > 0 && text[i - 1] === ']') {
        // We're inside a link/image URL
        // If there's a closing ) on the same line after position, we're before it
        // If there's no closing ), we're still in the URL (unclosed)
        const hasClosingParen = isBeforeClosingParen(text, position)
        // If we found ]( and haven't found ), we're in an unclosed URL
        // Check if there's a ) after position on the same line
        if (!hasClosingParen) {
          // Check if we're on the same line (no newline between ( and position)
          for (let j = i + 1; j < position; j += 1) {
            if (text[j] === '\n') {
              return false
            }
          }
          // No newline found, we're in an unclosed URL
          return true
        }
        return true
      }
      return false
    }
    if (text[i] === '\n') {
      return false
    }
  }

  return false
}

/**
 * Check if a position is within an HTML tag (between < and >)
 *
 * @param text - The text to check
 * @param position - The position to check
 * @returns True if the position is within an HTML tag
 */
export function isWithinHtmlTag(text: string, position: number): boolean {
  let inHtmlTag = false

  for (let i = 0; i < position; i += 1) {
    if (text[i] === '<') {
      // Check if it's not escaped and looks like an HTML tag
      if (i === 0 || text[i - 1] !== '\\') {
        inHtmlTag = true
      }
    }
    else if (text[i] === '>') {
      if (inHtmlTag && i > 0 && text[i - 1] !== '\\') {
        inHtmlTag = false
      }
    }
  }

  return inHtmlTag
}

/**
 * Remove link/image URLs and HTML tag content from text
 * This is used to exclude URL content from markdown syntax counting
 * (e.g., URLs may contain _, *, ~ which should not be counted as markdown syntax)
 *
 * @param text - The text to process
 * @returns Text with link/image URLs and HTML tags removed (keeping only [text] or ![alt] part)
 */
export function removeUrlsFromText(text: string): string {
  // First, remove code blocks to avoid processing URLs inside them
  const withoutCodeBlocks = text.replace(codeBlockPattern, '')

  // Remove HTML tags (including their attributes which may contain URLs)
  // This handles cases like <file url="http://example.com/path_with_underscore">
  let result = withoutCodeBlocks.replace(/<[^>]*>/g, '')

  // Remove complete link/image URLs: [text](url) or ![alt](url)
  // Replace the URL part with empty string, keep the [text] or ![alt] part
  result = result.replace(linkImagePattern, (match) => {
    return match.replace(/\]\([^)]*\)/, ']()')
  })

  // Remove incomplete link/image URLs: [text](url or ![alt](url
  // Replace the incomplete URL part with empty string
  result = result.replace(incompleteLinkImageUrlPattern, (match) => {
    return match.replace(/\]\([^)]*$/, '](')
  })

  return result
}

/**
 * Remove math blocks from text (both $$ block math and optionally $ inline math)
 * This is used to exclude math content from markdown syntax counting
 *
 * @param text - The text to process
 * @param options - Options including singleDollarTextMath
 * @returns Text with math blocks removed
 */
export function removeMathBlocksFromText(
  text: string,
  options?: Pick<PreprocessContext, 'singleDollarTextMath'>,
): string {
  const singleDollarEnabled = options?.singleDollarTextMath === true
  let result = text
  let i = 0

  while (i < result.length) {
    // Skip escaped dollar signs
    if (result[i] === '\\' && result[i + 1] === '$') {
      i += 2
      continue
    }

    // Check for block math ($$)
    if (result[i] === '$' && result[i + 1] === '$') {
      // Find the closing $$ and remove everything in between (including the delimiters)
      const closingPos = result.indexOf('$$', i + 2)
      if (closingPos !== -1) {
        // Remove the entire block math including delimiters
        result = result.slice(0, i) + result.slice(closingPos + 2)
        // Don't increment i since we removed content, check the same position again
        continue
      }
      else {
        // Unclosed block math - remove from here to end
        result = result.slice(0, i)
        break
      }
    }

    // Check for inline math ($) when enabled
    if (singleDollarEnabled && result[i] === '$') {
      // Find the closing $ (not escaped) and remove everything in between (including the delimiters)
      let closingPos = -1
      for (let j = i + 1; j < result.length; j++) {
        if (result[j] === '$' && result[j - 1] !== '\\') {
          closingPos = j
          break
        }
      }
      if (closingPos !== -1) {
        // Remove the entire inline math including delimiters
        result = result.slice(0, i) + result.slice(closingPos + 1)
        // Don't increment i since we removed content, check the same position again
        continue
      }
      else {
        // Unclosed inline math - remove from here to end
        result = result.slice(0, i)
        break
      }
    }

    i += 1
  }

  return result
}

/**
 * Append a suffix (e.g. closing ** or __) before any trailing whitespace.
 * This ensures that when users have typed a newline or spaces after their
 * content, we still close the strong markers immediately after the last
 * non-whitespace character instead of placing the markers on a new line.
 *
 * @param content - The original content
 * @param suffix - The suffix to append before trailing whitespace
 * @returns The content with the suffix appended before trailing whitespace
 */
export function appendBeforeTrailingWhitespace(content: string, suffix: string): string {
  const match = content.match(/\s*$/)
  const trailing = match ? match[0] : ''
  const withoutTrailing = trailing.length > 0 ? content.slice(0, -trailing.length) : content
  return `${withoutTrailing}${suffix}${trailing}`
}
