/**
 * Utility functions for preprocessing markdown content
 */

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
 * Check if a position is within a math block (between $ or $$)
 *
 * @param text - The text to check
 * @param position - The position to check
 * @returns True if the position is within a math block
 */
export function isWithinMathBlock(text: string, position: number): boolean {
  // Count dollar signs before this position
  let inInlineMath = false
  let inBlockMath = false

  for (let i = 0; i < text.length && i < position; i += 1) {
    // Skip escaped dollar signs
    if (text[i] === '\\' && text[i + 1] === '$') {
      i += 1 // Skip the next character
      continue
    }

    if (text[i] === '$') {
      // Check for block math ($$)
      if (text[i + 1] === '$') {
        inBlockMath = !inBlockMath
        i += 1 // Skip the second $
        inInlineMath = false // Block math takes precedence
      }
      else if (!inBlockMath) {
        // Only toggle inline math if not in block math
        inInlineMath = !inInlineMath
      }
    }
  }

  return inInlineMath || inBlockMath
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
        // We're potentially inside a link/image URL
        // Check if we're before the closing )
        return isBeforeClosingParen(text, position)
      }
      return false
    }
    if (text[i] === '\n') {
      return false
    }
  }

  return false
}
