import type { CompletionContext } from '../types'
import type { TextRange } from './utils'
import { getCompletionAnalysis } from './context'
import { incompleteFootnoteRefPattern } from './pattern'
import {
  calculateAbsolutePosition,
  findClosedCodeBlockRanges,
  findInlineCodeRanges,
  getLastParagraphWithIndex,
  isPositionInRanges,

} from './utils'

interface FootnoteScanContext {
  lines: string[]
  codeBlockRanges: TextRange[]
  inlineCodeRanges: TextRange[]
}

/**
 * Remove incomplete footnote references.
 *
 * @param content - Markdown content, potentially incomplete during streaming.
 * @param completionContext - Optional completion context.
 * @returns The content with the applicable completion applied.
 *
 * @example
 * completeFootnote('Text [^missing')
 * // Returns: 'Text'
 */
export function completeFootnote(content: string, completionContext?: CompletionContext): string {
  if (!content.includes('[^'))
    return content

  if (getCompletionAnalysis(content, completionContext).hasUnclosedCodeBlock) {
    return content
  }

  // Complete references may resolve to definitions later in the stream.
  return removeIncompleteReferenceInLastParagraph(content, buildScanContext(content))
}

function buildScanContext(content: string): FootnoteScanContext {
  const lines = content.split('\n')
  const codeBlockRanges = findClosedCodeBlockRanges(content)
  const inlineCodeRanges = findInlineCodeRanges(content, codeBlockRanges)

  return {
    lines,
    codeBlockRanges,
    inlineCodeRanges,
  }
}

function removeIncompleteReferenceInLastParagraph(
  content: string,
  context: FootnoteScanContext,
): string {
  const { lastParagraph, startIndex: lastParagraphStartIndex } = getLastParagraphWithIndex(content)

  if (!incompleteFootnoteRefPattern.test(lastParagraph)) {
    return content
  }

  const incompleteRefPos = lastParagraph.lastIndexOf('[^')
  if (incompleteRefPos === -1) {
    return content
  }

  const absolutePos = calculateAbsolutePosition(lastParagraphStartIndex, incompleteRefPos, context.lines)
  const isInCodeBlock = isPositionInRanges(absolutePos, context.codeBlockRanges)
  const isInInlineCode = isPositionInRanges(absolutePos, context.inlineCodeRanges)

  if (isInCodeBlock || isInInlineCode) {
    return content
  }

  const lineEnd = lastParagraph.indexOf('\n', incompleteRefPos)
  const refEnd = lineEnd !== -1 ? lineEnd : lastParagraph.length

  let refStart = incompleteRefPos
  if (refStart > 0 && lastParagraph[refStart - 1] === ' ') {
    refStart--
  }

  const absoluteStart = calculateAbsolutePosition(lastParagraphStartIndex, refStart, context.lines)
  const absoluteEnd = calculateAbsolutePosition(lastParagraphStartIndex, refEnd, context.lines)

  return content.substring(0, absoluteStart) + content.substring(absoluteEnd)
}
