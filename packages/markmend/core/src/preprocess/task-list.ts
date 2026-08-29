import type { PreprocessContext } from '../types'
import { getPreprocessAnalysis } from './context'
import {
  incompleteTaskListPattern,
  quoteIncompleteTaskListPattern,
} from './pattern'
import { isRangeOverlappingRanges } from './utils'

const zeroWidthSpace = '\u200B'

function isListItem(line: string): boolean {
  const trimmed = line.trimStart()
  const firstCharacter = trimmed[0]
  if ((firstCharacter === '-' || firstCharacter === '+' || firstCharacter === '*')
    && (trimmed[1] === ' ' || trimmed[1] === '\t')) {
    return true
  }

  return /^\d+[.)][ \t]/.test(trimmed)
}

function isPartialSetextUnderline(line: string): boolean {
  const trimmed = line.trim()
  if (trimmed.length === 0 || trimmed.length > 2)
    return false

  return [...trimmed].every(character => character === trimmed[0]
    && (character === '-' || character === '='))
}

/**
 * Fix incomplete task list syntax in streaming markdown
 *
 * Removes incomplete task list items like `- [` that are being typed incrementally.
 * Standalone list markers are preserved. A short `-` or `=` underline after
 * prose receives a zero-width suffix so it cannot temporarily turn that prose
 * into a Setext heading while streaming.
 * This prevents rendering jitter when task list items are being typed incrementally.
 * Also handles quote blocks (lines starting with `>`) to prevent leaving `> ` which could
 * cause the previous line to be misparsed as a heading.
 *
 * @param content - Markdown content (potentially incomplete in stream mode)
 * @returns Content with incomplete task markers hidden and partial Setext syntax stabilized
 *
 * @example
 * fixTaskList('Paragraph\n-')
 * // Returns: 'Paragraph\n-\u200B'
 *
 * @example
 * fixTaskList('- [ ] Task 1\n-')
 * // Returns: '- [ ] Task 1\n-'
 *
 * @example
 * fixTaskList('- [ ] Task 1\n  - [')
 * // Returns: '- [ ] Task 1\n'
 *
 * @example
 * fixTaskList('> **Note**: Here\'s a quote with tasks:\n\n> -')
 * // Returns: '> **Note**: Here\'s a quote with tasks:\n\n> -'
 */
export function fixTaskList(content: string, context?: PreprocessContext): string {
  if (!content.includes('[') && !content.includes('\n'))
    return content

  const analysis = getPreprocessAnalysis(content, context)
  // Don't process if we're inside a code block (unclosed)
  if (analysis.hasUnclosedCodeBlock) {
    return content
  }

  if (analysis.isFullyCodeBlock)
    return content

  // Check if the last line is inside a code block
  // Find all code block ranges
  const { codeBlockRanges, lines } = analysis

  // Get the last line
  const lastLine = lines.at(-1)
  if (!lastLine) {
    return content
  }

  // Calculate the position of the last line in the content
  let lastLineStartPos = 0
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i]
    if (line !== undefined) {
      lastLineStartPos += line.length + 1 // +1 for newline
    }
  }
  const lastLineEndPos = lastLineStartPos + lastLine.length

  // Check if the last line is inside a code block
  const isLastLineInCodeBlock = isRangeOverlappingRanges(lastLineStartPos, lastLineEndPos, codeBlockRanges)

  if (isLastLineInCodeBlock) {
    return content
  }

  // Check if the last line is in a quote block (starts with `>`)
  // First check for incomplete task list in quote block `> - [`
  if (quoteIncompleteTaskListPattern.test(lastLine)) {
    // Remove the last line (the incomplete `> - [`)
    const newLines = lines.slice(0, -1)
    return newLines.join('\n')
  }

  // Check if the last line is an incomplete task list item `- [` (with optional trailing whitespace)
  if (incompleteTaskListPattern.test(lastLine)) {
    // Remove the last line (the incomplete `- [`)
    const newLines = lines.slice(0, -1)
    return newLines.join('\n')
  }

  const previousLine = lines.at(-2)
  if (previousLine !== undefined
    && previousLine.trim() !== ''
    && !isListItem(previousLine)
    && isPartialSetextUnderline(lastLine)) {
    return `${content.trimEnd()}${zeroWidthSpace}`
  }

  return content
}
