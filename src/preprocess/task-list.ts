import {
  incompleteTaskListPattern,
  quoteIncompleteTaskListPattern,
  quoteStandaloneDashPattern,
  quoteTaskListPattern,
  standaloneDashPattern,
  taskListPattern,
} from './pattern'
import { isInsideUnclosedCodeBlock } from './utils'

/**
 * Fix incomplete task list syntax in streaming markdown
 *
 * Removes standalone `-` that appears on the last line without `[ ]` or `[x]` syntax.
 * Also removes incomplete task list items like `- [` that are being typed incrementally.
 * This prevents AST parsing jitter when task list items are being typed incrementally.
 * Also handles quote blocks (lines starting with `>`) to prevent leaving `> ` which could
 * cause the previous line to be misparsed as a heading.
 *
 * @param content - Markdown content (potentially incomplete in stream mode)
 * @returns Content with standalone `-` or incomplete `- [` removed from the last line if incomplete
 *
 * @example
 * fixTaskList('- [ ] Task 1\n-')
 * // Returns: '- [ ] Task 1\n'
 *
 * @example
 * fixTaskList('- [ ] Task 1\n- [x] Task 2\n-')
 * // Returns: '- [ ] Task 1\n- [x] Task 2\n'
 *
 * @example
 * fixTaskList('- [ ] Task 1\n  - [')
 * // Returns: '- [ ] Task 1\n'
 *
 * @example
 * fixTaskList('> **Note**: Here\'s a quote with tasks:\n\n> -')
 * // Returns: '> **Note**: Here\'s a quote with tasks:\n\n'
 */
export function fixTaskList(content: string): string {
  // Don't process if we're inside a code block (unclosed)
  if (isInsideUnclosedCodeBlock(content)) {
    return content
  }

  // Check if the last line is inside a code block
  // Find all code block ranges
  const codeBlockRanges: Array<{ start: number, end: number }> = []
  let searchStart = 0
  while (true) {
    const codeBlockStart = content.indexOf('```', searchStart)
    if (codeBlockStart === -1)
      break
    const codeBlockEnd = content.indexOf('```', codeBlockStart + 3)
    if (codeBlockEnd === -1)
      break
    codeBlockRanges.push({ start: codeBlockStart, end: codeBlockEnd + 3 })
    searchStart = codeBlockEnd + 3
  }

  const lines = content.split('\n')

  // If content is empty or has no lines, return as is
  if (lines.length === 0)
    return content

  // Get the last line
  const lastLine = lines[lines.length - 1]
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
  const isLastLineInCodeBlock = codeBlockRanges.some(
    range => (lastLineStartPos >= range.start && lastLineStartPos < range.end)
      || (lastLineEndPos > range.start && lastLineEndPos <= range.end)
      || (lastLineStartPos < range.start && lastLineEndPos > range.end),
  )

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

  // Check for standalone dash in quote block
  if (quoteStandaloneDashPattern.test(lastLine) && !quoteTaskListPattern.test(lastLine)) {
    // Remove the last line (the standalone `> -`)
    const newLines = lines.slice(0, -1)
    return newLines.join('\n')
  }

  // Check if the last line is an incomplete task list item `- [` (with optional trailing whitespace)
  if (incompleteTaskListPattern.test(lastLine)) {
    // Remove the last line (the incomplete `- [`)
    const newLines = lines.slice(0, -1)
    return newLines.join('\n')
  }

  // Check if the last line is a standalone `-` (with optional trailing whitespace)
  // or `- ` (dash with space, which is a regular list item, not a task list)
  // but not `- [ ]` or `- [x]` or `- [X]`
  // If it matches standalone dash but not a task list, remove it
  if (standaloneDashPattern.test(lastLine) && !taskListPattern.test(lastLine)) {
    // Remove the last line (the standalone `-`)
    const newLines = lines.slice(0, -1)
    return newLines.join('\n')
  }

  // Check for `- ` (dash with space, regular list item, not a task list)
  // Pattern: starts with optional whitespace, then `- `, then optional trailing whitespace
  // But not a task list pattern
  if (/^\s*-\s+$/.test(lastLine) && !taskListPattern.test(lastLine)) {
    // Remove the last line (the `- `)
    const newLines = lines.slice(0, -1)
    return newLines.join('\n')
  }

  return content
}
