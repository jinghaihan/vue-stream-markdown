import { codeBlockPattern, doubleDollarPattern, tripleBacktickPattern } from './pattern'

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
  // Don't process if we're inside a code block
  // Count code block fences to check if we're inside one
  const codeBlockMatches = content.match(tripleBacktickPattern)
  const codeBlockCount = codeBlockMatches ? codeBlockMatches.length : 0

  // If odd number of code block fences, we're inside a code block - don't process math
  if (codeBlockCount % 2 === 1)
    return content

  // Find the last paragraph (after the last blank line)
  // A blank line is defined as a line with only whitespace
  const lines = content.split('\n')
  let paragraphStartIndex = 0

  // Find the last blank line
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]!
    if (line.trim() === '') {
      paragraphStartIndex = i + 1
      break
    }
  }

  // Get the last paragraph
  const lastParagraph = lines.slice(paragraphStartIndex).join('\n')

  // Remove code blocks and inline code from the last paragraph to avoid counting $$ inside them
  // First remove code blocks (```...```)
  let withoutCodeBlocks = lastParagraph.replace(codeBlockPattern, '')
  // Then remove inline code (`...`) but not triple backticks
  // Pattern: `...` where ... doesn't contain newlines or backticks
  const inlineCodePattern = /`[^`\n]+`/g
  withoutCodeBlocks = withoutCodeBlocks.replace(inlineCodePattern, '')

  // Count $$ in the last paragraph only (excluding code blocks and inline code)
  const dollarMatches = withoutCodeBlocks.match(doubleDollarPattern)
  const dollarCount = dollarMatches ? dollarMatches.length : 0

  // Only complete if odd number of $$ (unclosed)
  if (dollarCount % 2 === 1) {
    // Find the last $$ position in the original lastParagraph (not withoutCodeBlocks)
    // But we need to make sure it's not inside a code block
    const lastDollarPos = findLastDollarPairNotInCodeBlock(lastParagraph)

    if (lastDollarPos === -1)
      return content

    let afterLast = lastParagraph.substring(lastDollarPos + 2)

    // Check if afterLast is just a single $ with no content before it
    // This prevents cases like "$$$" from being completed
    const afterLastTrimmed = afterLast.trim()
    const isJustSingleDollar = afterLastTrimmed === '$'

    if (isJustSingleDollar) {
      // Don't complete if it's just a single $ with no content, as that's not inline math syntax
      return content
    }

    // If afterLast ends with a single $ (not $$), remove it first
    // This handles cases like "$$\int u \, dv = uv - \int v \, du$"
    // We should complete it to "$$\int u \, dv = uv - \int v \, du$$"
    let shouldRemoveTrailingDollar = false
    if (afterLast.endsWith('$') && !afterLast.endsWith('$$')) {
      shouldRemoveTrailingDollar = true
      // Remove the trailing single $ from afterLast
      afterLast = afterLast.slice(0, -1)
    }

    // Check if this is block math
    // Block math typically has $$ on its own line (possibly with whitespace)
    // or $$ followed immediately by newline
    const lineAfterDollar = afterLast.split('\n')[0] ?? ''
    const hasContentAfter = lineAfterDollar.trim().length > 0
    const isBlockMathByAfter = !hasContentAfter && afterLast.startsWith('\n')

    // Check if $$ is on its own line (block math indicator)
    // Find the line containing the last $$
    const linesInParagraph = lastParagraph.split('\n')
    let lineWithDollar = ''
    for (let i = linesInParagraph.length - 1; i >= 0; i--) {
      const line = linesInParagraph[i]!
      if (line.includes('$$')) {
        lineWithDollar = line
        break
      }
    }

    // If the line containing $$ has only $$ (with possible whitespace), it's block math
    // Remove all $$ from the line and check if only whitespace remains
    const lineWithoutDollar = lineWithDollar.replace(/\$\$/g, '')
    const isBlockMathByLine = lineWithoutDollar.trim() === '' && afterLast.startsWith('\n')

    // If it's block math ($$ on its own line followed by newline), don't complete it
    // (let subsequent preprocess handle it)
    if (isBlockMathByAfter || isBlockMathByLine) {
      return content
    }

    // If there's content after $$, complete it as inline math
    if (hasContentAfter) {
      // If we removed a trailing single $, we need to remove it from content first
      if (shouldRemoveTrailingDollar) {
        const beforeLastParagraph = lines.slice(0, paragraphStartIndex).join('\n')
        const offset = beforeLastParagraph.length > 0 ? beforeLastParagraph.length + 1 : 0
        const actualLastDollarPos = offset + lastDollarPos
        const contentBeforeMath = content.substring(0, actualLastDollarPos + 2)
        const contentAfterMath = lastParagraph.substring(lastDollarPos + 2, lastParagraph.length - 1)
        return `${contentBeforeMath}${contentAfterMath}$$`
      }
      return `${content}$$`
    }
    else {
      // Remove the trailing $$ to avoid showing it as plain text
      // Calculate the position in the full content
      const beforeLastParagraph = lines.slice(0, paragraphStartIndex).join('\n')
      const offset = beforeLastParagraph.length > 0 ? beforeLastParagraph.length + 1 : 0
      const actualLastDollarPos = offset + lastDollarPos
      return content.slice(0, actualLastDollarPos) + content.slice(actualLastDollarPos + 2)
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
