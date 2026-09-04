import type { CompletionContext } from '../types'
import { getCompletionAnalysis } from './context'

/**
 * Complete incomplete block math syntax.
 *
 * @param content - Markdown content, potentially incomplete during streaming.
 * @param context - Optional completion context.
 * @returns The content with the applicable completion applied.
 *
 * @example
 * completeMath('$$\nx')
 * // Returns: '$$\nx\n$$'
 */
export function completeMath(content: string, context?: CompletionContext): string {
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
