import type { CompletionContext } from '../types'
import type { CompletionParagraphAnalysis } from './context'
import { getCompletionAnalysis } from './context'
import { codeBlockPattern, doubleDollarPattern, inlineCodePattern } from './pattern'

/**
 * Fix unclosed inline math ($$) syntax in streaming markdown
 *
 * Only processes the last paragraph (content after the last blank line).
 * This respects Markdown's rule that inline math cannot span across paragraphs.
 *
 * Note: This function only handles inline math ($$...$$). Block math ($$ on separate lines)
 * is handled by subsequent completion steps and should not be completed here.
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
export function fixInlineMath(content: string, context?: CompletionContext): string {
  // Handle bare single $ first
  if (content === '$') {
    return ''
  }

  if (!content.includes('$'))
    return content

  // Don't process if we're inside a code block (unclosed)
  const analysis = getCompletionAnalysis(content, context)
  if (analysis.hasUnclosedCodeBlock)
    return content

  // Find the last paragraph (after the last blank line)
  const paragraph = analysis.getLastParagraph()
  const lastParagraph = paragraph.content

  // Remove code blocks and inline code from the last paragraph to avoid counting $$ inside them
  let withoutCodeBlocks = lastParagraph.replace(codeBlockPattern, '')
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

    return completeInlineMathContent(content, paragraph, lastParagraph, lastDollarPos)
  }

  return content
}

function completeInlineMathContent(
  content: string,
  paragraph: CompletionParagraphAnalysis,
  lastParagraph: string,
  lastDollarPos: number,
): string {
  let afterLast = lastParagraph.substring(lastDollarPos + 2)

  // Inline math cannot contain newlines.
  if (afterLast.includes('\n'))
    return content

  // A single trailing dollar is not content for an inline math expression.
  if (afterLast.trim() === '$')
    return content

  // Remove a single trailing dollar before adding the closing delimiter.
  const shouldRemoveTrailingDollar = afterLast.endsWith('$') && !afterLast.endsWith('$$')
  if (shouldRemoveTrailingDollar)
    afterLast = afterLast.slice(0, -1)

  if (afterLast.trim().length === 0) {
    const actualLastDollarPos = paragraph.startOffset + lastDollarPos
    return content.slice(0, actualLastDollarPos).trimEnd()
  }

  if (!shouldRemoveTrailingDollar)
    return `${content}$$`

  const actualLastDollarPos = paragraph.startOffset + lastDollarPos
  const contentBeforeMath = content.substring(0, actualLastDollarPos + 2)
  const contentAfterMath = lastParagraph.substring(lastDollarPos + 2, lastParagraph.length - 1)
  return `${contentBeforeMath}${contentAfterMath}$$`
}

/**
 * Find the last $$ pair that is not inside a code block or inline code
 */
function findLastDollarPairNotInCodeBlock(text: string): number {
  const state: DollarScanState = {
    lastPos: -1,
    inCodeBlock: false,
    inInlineCode: false,
  }

  for (let i = 0; i < text.length; i++) {
    if (consumeCodeFence(text, i, state)) {
      i += 2
      continue
    }

    if (consumeInlineCodeDelimiter(text, i, state))
      continue

    if (state.inCodeBlock || state.inInlineCode || !text.startsWith('$$', i))
      continue

    state.lastPos = i
    i += 1 // Skip the second $
  }

  return state.lastPos
}

interface DollarScanState {
  lastPos: number
  inCodeBlock: boolean
  inInlineCode: boolean
}

function consumeCodeFence(text: string, index: number, state: DollarScanState): boolean {
  if (!text.startsWith('```', index))
    return false

  state.inCodeBlock = !state.inCodeBlock
  state.inInlineCode = false
  return true
}

function consumeInlineCodeDelimiter(text: string, index: number, state: DollarScanState): boolean {
  if (state.inCodeBlock || text[index] !== '`')
    return false

  if (!isPartOfTripleBacktick(text, index))
    state.inInlineCode = !state.inInlineCode

  return true
}

function isPartOfTripleBacktick(text: string, index: number): boolean {
  const before = index > 0 ? text[index - 1] : ''
  const before2 = index > 1 ? text[index - 2] : ''
  const after = index < text.length - 1 ? text[index + 1] : ''
  const after2 = index < text.length - 2 ? text[index + 2] : ''

  return (before === '`' && before2 === '`')
    || (before === '`' && after === '`')
    || (after === '`' && after2 === '`')
}
