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
import { incompleteTaskListPattern, quoteIncompleteTaskListPattern, quoteStandaloneDashPattern, quoteTaskListPattern, standaloneDashPattern, taskListPattern } from './pattern'

export function fixTaskList(content: string): string {
  const lines = content.split('\n')

  // If content is empty or has no lines, return as is
  if (lines.length === 0)
    return content

  // Get the last line
  const lastLine = lines[lines.length - 1]!

  // Check if the last line is in a quote block (starts with `>`)
  // First check for incomplete task list in quote block `> - [`
  if (quoteIncompleteTaskListPattern.test(lastLine)) {
    // Remove the last line (the incomplete `> - [`)
    const newLines = lines.slice(0, -1)
    const result = newLines.join('\n')
    // If we had multiple lines, preserve the newline structure
    // (the removed line was preceded by a newline)
    if (lines.length > 1) {
      return `${result}\n`
    }
    return result
  }

  // Check for standalone dash in quote block
  if (quoteStandaloneDashPattern.test(lastLine) && !quoteTaskListPattern.test(lastLine)) {
    // Remove the last line (the standalone `> -`)
    // This prevents leaving `> ` which could cause parsing issues
    const newLines = lines.slice(0, -1)
    const result = newLines.join('\n')
    // If we had multiple lines, preserve the newline structure
    // (the removed line was preceded by a newline)
    if (lines.length > 1) {
      return `${result}\n`
    }
    return result
  }

  // Check if the last line is an incomplete task list item `- [` (with optional trailing whitespace)
  if (incompleteTaskListPattern.test(lastLine)) {
    // Remove the last line (the incomplete `- [`)
    const newLines = lines.slice(0, -1)
    const result = newLines.join('\n')
    // If we had multiple lines, preserve the newline structure
    // (the removed line was preceded by a newline)
    if (lines.length > 1) {
      return `${result}\n`
    }
    return result
  }

  // Check if the last line is a standalone `-` (with optional trailing whitespace)
  // but not `- [ ]` or `- [x]` or `- [X]`
  // If it matches standalone dash but not a task list, remove it
  if (standaloneDashPattern.test(lastLine) && !taskListPattern.test(lastLine)) {
    // Remove the last line (the standalone `-`)
    const newLines = lines.slice(0, -1)
    const result = newLines.join('\n')
    // If we had multiple lines, preserve the newline structure
    // (the removed line was preceded by a newline)
    if (lines.length > 1) {
      return `${result}\n`
    }
    return result
  }

  return content
}
