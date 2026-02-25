import { isInsideUnclosedCodeBlock } from './utils'

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
export function fixMath(content: string): string {
  // Don't process if we're inside a code block (unclosed)
  if (isInsideUnclosedCodeBlock(content)) {
    return content
  }

  const lines = content.split('\n')
  let inCodeBlock = false
  const blockMathDelimiters: number[] = [] // Store indices of $$ delimiters on separate lines

  // Find all block math delimiters ($$ on separate lines, excluding code blocks)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''

    // Check for code block fences (```)
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }

    // Skip if we're inside a code block
    if (inCodeBlock) {
      continue
    }

    // Check if this line is a block math delimiter ($$ on a separate line)
    // Block math delimiter is a line that contains only $$ (possibly with whitespace)
    const trimmedLine = line.trim()
    if (trimmedLine === '$$') {
      blockMathDelimiters.push(i)
    }
  }

  // If we have an odd number of block math delimiters, we have an unclosed block math
  if (blockMathDelimiters.length % 2 === 1) {
    const lastDelimiterIndex = blockMathDelimiters[blockMathDelimiters.length - 1] as number

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
