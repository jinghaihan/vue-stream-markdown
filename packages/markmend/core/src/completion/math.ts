import type { CompletionContext } from '../types'
import { getCompletionAnalysis } from './context'

/**
 * Fix unclosed block math ($$) syntax in streaming markdown
 *
 * Block math is defined as $$ delimiters on separate lines:
 * $$
 * E = mc^2
 * $$
 *
 * This function processes the entire content (not just last paragraph)
 * because block math can span multiple paragraphs.
 *
 * @param content - Markdown content (potentially incomplete in stream mode)
 * @returns Content with auto-completed block math if needed
 *
 * @example
 * fixMath('$$\nE = mc^2')
 * // Returns: '$$\nE = mc^2\n$$'
 *
 * @example
 * fixMath('$$\nE = mc^2\n$$')
 * // Returns: '$$\nE = mc^2\n$$' (no change)
 */
export function fixMath(content: string, context?: CompletionContext): string {
  if (!content.includes('$'))
    return content

  const analysis = getCompletionAnalysis(content, context)
  // Don't process if we're inside a code block (unclosed)
  if (analysis.hasUnclosedCodeBlock) {
    return content
  }

  const { lines } = analysis
  const blockMathDelimiters = findBlockMathDelimiters(lines)

  // If we have an odd number of block math delimiters, we have an unclosed block math
  if (blockMathDelimiters.length % 2 === 1) {
    const lastDelimiterIndex = blockMathDelimiters.at(-1) as number

    // Check if there's content after the opening $$
    const hasContent = lines.slice(lastDelimiterIndex + 1).some((line) => {
      const trimmed = line.trim()
      return trimmed.length > 0 && trimmed !== '$$'
    })

    // If there's content, complete the block math
    if (hasContent) {
      // If content doesn't end with newline, add one before closing $$
      if (!content.endsWith('\n')) {
        return `${content}\n$$`
      }
      return `${content}$$`
    }
    else {
      // No content after $$, remove the trailing $$
      const beforeMath = lines.slice(0, lastDelimiterIndex).join('\n')
      return beforeMath
    }
  }

  return content
}

function findBlockMathDelimiters(lines: string[]): number[] {
  let inCodeBlock = false
  const delimiters: number[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? ''
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }

    if (!inCodeBlock && line.trim() === '$$')
      delimiters.push(index)
  }

  return delimiters
}
