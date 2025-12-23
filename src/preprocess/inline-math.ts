import { codeBlockPattern, doubleDollarPattern } from './pattern'
import { calculateParagraphOffset, getLastParagraphWithIndex, isInsideUnclosedCodeBlock } from './utils'

/**
 * Fix unclosed inline math ($$) syntax in streaming markdown
 *
 * Only processes the last paragraph (content after the last blank line).
 * This respects Markdown's rule that inline math cannot span across paragraphs.
 *
 * Note: This function only handles inline math ($$...$$). Block math ($$ on separate lines)
 * is handled by subsequent preprocess steps and should not be completed here.
 *
 * @param content - Markdown content (potentially incomplete in stream mode)
 * @returns Content with auto-completed $$ if needed
 *
 * @example
 * fixInlineMath('The formula is $$x = 1')
 * // Returns: 'The formula is $$x = 1$$'
 *
 * @example
 * fixInlineMath('Para1 $$x$$\n\nPara2 $$y')
 * // Returns: 'Para1 $$x$$\n\nPara2 $$y$$'
 *
 * @example
 * fixInlineMath('$$\nE = mc^2')
 * // Returns: '$$\nE = mc^2' (no completion, this is block math)
 *
 * @example
 * fixInlineMath('$$\n')
 * // Returns: '$$\n' (no completion, this is block math)
 */
export function fixInlineMath(content: string): string {
  // Handle bare single $ first
  if (content === '$') {
    return ''
  }

  // Don't process if we're inside a code block (unclosed)
  if (isInsideUnclosedCodeBlock(content))
    return content

  // Find the last paragraph (after the last blank line)
  const lines = content.split('\n')
  const { lastParagraph, startIndex: paragraphStartIndex } = getLastParagraphWithIndex(content)

  // Remove code blocks and inline code from the last paragraph to avoid counting $$ inside them
  let withoutCodeBlocks = lastParagraph.replace(codeBlockPattern, '')
  const inlineCodePattern = /`[^`\n]+`/g
  withoutCodeBlocks = withoutCodeBlocks.replace(inlineCodePattern, '')

  // Count $$ in the last paragraph only (excluding code blocks and inline code)
  const dollarMatches = withoutCodeBlocks.match(doubleDollarPattern)
  const dollarCount = dollarMatches ? dollarMatches.length : 0

  // Only complete if odd number of $$ (unclosed)
  if (dollarCount % 2 === 1) {
    // Find the last $$ position in the original lastParagraph (not inside code blocks)
    const lastDollarPos = findLastDollarPairNotInCodeBlock(lastParagraph)
    if (lastDollarPos === -1)
      return content

    let afterLast = lastParagraph.substring(lastDollarPos + 2)

    // Inline math cannot contain newlines - if $$ is followed immediately by \n, don't process
    // Also, if $$ is followed by content that contains \n, it's not inline math
    if (afterLast.startsWith('\n') || afterLast.includes('\n')) {
      return content
    }

    // Check if afterLast is just a single $ with no content
    const afterLastTrimmed = afterLast.trim()
    if (afterLastTrimmed === '$') {
      return content
    }

    // If afterLast ends with a single $ (not $$), remove it first
    // This handles cases like "$$\int u \, dv = uv - \int v \, du$"
    let shouldRemoveTrailingDollar = false
    if (afterLast.endsWith('$') && !afterLast.endsWith('$$')) {
      shouldRemoveTrailingDollar = true
      afterLast = afterLast.slice(0, -1)
    }

    // Check if there's content after $$ (on the same line, since inline math can't span lines)
    const hasContentAfter = afterLast.trim().length > 0

    if (hasContentAfter) {
      // For math expressions, we should be more conservative about detecting unclosed markdown
      // LaTeX uses underscores and other symbols that could be mistaken for markdown
      // Only block completion if there are clear markdown patterns that would conflict

      // Complete inline math - LaTeX content should not be treated as markdown
      if (shouldRemoveTrailingDollar) {
        const offset = calculateParagraphOffset(paragraphStartIndex, lines)
        const actualLastDollarPos = offset + lastDollarPos
        const contentBeforeMath = content.substring(0, actualLastDollarPos + 2)
        const contentAfterMath = lastParagraph.substring(lastDollarPos + 2, lastParagraph.length - 1)
        return `${contentBeforeMath}${contentAfterMath}$$`
      }
      return `${content}$$`
    }
    else {
      // Remove the trailing $$ and any trailing whitespace
      const offset = calculateParagraphOffset(paragraphStartIndex, lines)
      const actualLastDollarPos = offset + lastDollarPos
      return content.slice(0, actualLastDollarPos).trimEnd()
    }
  }

  return content
}

/**
 * Find the last $$ pair that is not inside a code block or inline code
 */
function findLastDollarPairNotInCodeBlock(text: string): number {
  let lastPos = -1
  let inCodeBlock = false
  let inInlineCode = false

  for (let i = 0; i < text.length; i++) {
    // Check for code block fences (```)
    if (text.substring(i, i + 3) === '```') {
      inCodeBlock = !inCodeBlock
      inInlineCode = false // Code blocks take precedence
      i += 2 // Skip the next 2 backticks
      continue
    }

    // Only check for inline code if not in code block
    if (!inCodeBlock && text[i] === '`') {
      // Check if it's part of ``` (triple backticks)
      const before = i > 0 ? text[i - 1] : ''
      const before2 = i > 1 ? text[i - 2] : ''
      const after = i < text.length - 1 ? text[i + 1] : ''
      const after2 = i < text.length - 2 ? text[i + 2] : ''

      // Skip if this backtick is part of ```
      const isPartOfTriple = (before === '`' && before2 === '`') // third of ```
        || (before === '`' && after === '`') // middle of ```
        || (after === '`' && after2 === '`') // first of ```

      if (!isPartOfTriple) {
        // Toggle inline code state
        inInlineCode = !inInlineCode
      }
      continue
    }

    // Only look for $$ if not in code block or inline code
    if (!inCodeBlock && !inInlineCode && text.substring(i, i + 2) === '$$') {
      lastPos = i
      i += 1 // Skip the second $
      continue
    }
  }

  return lastPos
}
