import type { CompletionContext } from '../types'
import { getCompletionAnalysis } from './context'
import {
  incompleteTaskListPattern,
  orderedListItemPattern,
  quoteIncompleteTaskListPattern,
} from './pattern'
import { isRangeOverlappingRanges } from './utils'

const zeroWidthSpace = '\u200B'

/**
 * Stabilize incomplete task list syntax.
 *
 * @param content - Markdown content, potentially incomplete during streaming.
 * @param context - Optional completion context.
 * @returns The content with the applicable completion applied.
 *
 * @example
 * completeTaskList('Task\n- [')
 * // Returns: 'Task\n'
 */
export function completeTaskList(content: string, context?: CompletionContext): string {
  if (!content.includes('[') && !content.includes('\n'))
    return content

  const analysis = getCompletionAnalysis(content, context)
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

function isListItem(line: string): boolean {
  const trimmed = line.trimStart()
  const firstCharacter = trimmed[0]
  if ((firstCharacter === '-' || firstCharacter === '+' || firstCharacter === '*')
    && (trimmed[1] === ' ' || trimmed[1] === '\t')) {
    return true
  }

  return orderedListItemPattern.test(trimmed)
}

function isPartialSetextUnderline(line: string): boolean {
  const trimmed = line.trim()
  if (trimmed.length === 0 || trimmed.length > 2)
    return false

  return [...trimmed].every(character => character === trimmed[0]
    && (character === '-' || character === '='))
}
