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
