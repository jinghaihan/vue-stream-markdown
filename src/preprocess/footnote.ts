import type { TextRange } from './utils'
import {
  codeBlockPattern,
  footnoteDefLabelPattern,
  footnoteDefLinePattern,
  footnoteDefPattern,
  footnoteRefLabelPattern,
  footnoteRefPattern,
  incompleteFootnoteRefPattern,
} from './pattern'
import {
  calculateAbsolutePosition,
  findClosedCodeBlockRanges,
  findInlineCodeRanges,
  getLastParagraphWithIndex,
  isInsideUnclosedCodeBlock,
  isPositionInRanges,

} from './utils'

interface FootnoteReference {
  start: number
  end: number
  label: string
}

interface FootnoteScanContext {
  lines: string[]
  codeBlockRanges: TextRange[]
  inlineCodeRanges: TextRange[]
  footnoteDefRanges: TextRange[]
}

function getDefinedFootnoteLabels(content: string): Set<string> {
  const contentWithoutCodeBlocks = content.replace(codeBlockPattern, '')
  const defMatches = contentWithoutCodeBlocks.match(footnoteDefPattern)
  const definedLabels = new Set<string>()

  if (!defMatches) {
    return definedLabels
  }

  for (const def of defMatches) {
    const labelMatch = def.match(footnoteDefLabelPattern)
    if (labelMatch && labelMatch[1]) {
      definedLabels.add(labelMatch[1])
    }
  }

  return definedLabels
}

function getFootnoteDefinitionLineRanges(lines: string[]): TextRange[] {
  const ranges: TextRange[] = []
  let lineOffset = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] || ''
    if (footnoteDefLinePattern.test(line)) {
      ranges.push({ start: lineOffset, end: lineOffset + line.length })
    }

    lineOffset += line.length
    if (i < lines.length - 1) {
      lineOffset += 1
    }
  }

  return ranges
}

function buildScanContext(content: string): FootnoteScanContext {
  const lines = content.split('\n')
  const codeBlockRanges = findClosedCodeBlockRanges(content)
  const inlineCodeRanges = findInlineCodeRanges(content, codeBlockRanges)
  const footnoteDefRanges = getFootnoteDefinitionLineRanges(lines)

  return {
    lines,
    codeBlockRanges,
    inlineCodeRanges,
    footnoteDefRanges,
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

function collectCompleteReferences(
  content: string,
  context: FootnoteScanContext,
): FootnoteReference[] {
  const references: FootnoteReference[] = []
  footnoteRefPattern.lastIndex = 0
  let match: RegExpExecArray | null = footnoteRefPattern.exec(content)

  while (match !== null) {
    const absolutePos = match.index ?? 0
    const refText = match[0] || ''

    const isInCodeBlock = isPositionInRanges(absolutePos, context.codeBlockRanges)
    const isInInlineCode = isPositionInRanges(absolutePos, context.inlineCodeRanges)
    const isInFootnoteDef = isPositionInRanges(absolutePos, context.footnoteDefRanges)

    if (!isInCodeBlock && !isInInlineCode && !isInFootnoteDef) {
      const labelMatch = refText.match(footnoteRefLabelPattern)
      if (labelMatch && labelMatch[1]) {
        references.push({
          start: absolutePos,
          end: absolutePos + refText.length,
          label: labelMatch[1],
        })
      }
    }

    match = footnoteRefPattern.exec(content)
  }

  return references
}

/**
 * Remove incomplete footnote references ([^...]) in streaming markdown
 *
 * Processes the entire content to remove footnote references that don't have
 * corresponding definitions. This is necessary because footnote references can
 * appear anywhere in the document, while definitions typically appear at the end.
 *
 * A footnote reference is considered incomplete if there's no corresponding
 * footnote definition ([^...]:) in the entire content.
 *
 * @param content - Markdown content (potentially incomplete in stream mode)
 * @returns Content with incomplete footnote references removed
 *
 * @example
 * fixFootnote('Text [^1] and [^2]')
 * // Returns: 'Text [^1] and [^2]' (if [^1]: and [^2]: exist)
 * // Returns: 'Text  and ' (if definitions don't exist)
 *
 * @example
 * fixFootnote('Para1 [^1]\n\nPara2 [^2]')
 * // Removes [^1] and [^2] if their definitions don't exist
 *
 * @example
 * fixFootnote('```\n[^1]\n```\n\nText [^1]')
 * // Code block content is ignored, only processes Text [^1]
 */
export function fixFootnote(content: string): string {
  if (isInsideUnclosedCodeBlock(content)) {
    return content
  }

  const definedLabels = getDefinedFootnoteLabels(content)
  let context = buildScanContext(content)

  let result = removeIncompleteReferenceInLastParagraph(content, context)
  if (result !== content) {
    content = result
    context = buildScanContext(content)
  }

  const references = collectCompleteReferences(content, context)
  if (references.length === 0) {
    return content
  }

  for (let i = references.length - 1; i >= 0; i--) {
    const ref = references[i]
    if (!ref || definedLabels.has(ref.label)) {
      continue
    }

    let refStart = ref.start
    if (refStart > 0 && result[refStart - 1] === ' ') {
      refStart--
    }

    result = result.substring(0, refStart) + result.substring(ref.end)
  }

  return result
}
