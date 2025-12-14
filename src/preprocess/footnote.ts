import {
  codeBlockPattern,
  footnoteDefLabelPattern,
  footnoteDefLinePattern,
  footnoteDefPattern,
  footnoteRefLabelPattern,
  footnoteRefPattern,
  incompleteFootnoteRefPattern,
  tripleBacktickPattern,
} from './pattern'

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
  // Don't process if we're inside a code block
  // Count code block fences to check if we're inside one
  const codeBlockMatches = content.match(tripleBacktickPattern)
  const codeBlockCount = codeBlockMatches ? codeBlockMatches.length : 0

  // If odd number of code block fences, we're inside a code block - don't process footnotes
  if (codeBlockCount % 2 === 1)
    return content

  // Get all footnote definitions from the entire content (excluding code blocks)
  const contentWithoutCodeBlocks = content.replace(codeBlockPattern, '')
  const defMatches = contentWithoutCodeBlocks.match(footnoteDefPattern)
  const definedLabels = new Set<string>()

  if (defMatches) {
    for (const def of defMatches) {
      // Extract label from [^label]:
      const labelMatch = def.match(footnoteDefLabelPattern)
      if (labelMatch && labelMatch[1])
        definedLabels.add(labelMatch[1])
    }
  }

  const isFootnoteDefLine = (line: string) => footnoteDefLinePattern.test(line)

  // Process the entire content to find and remove incomplete references
  const lines = content.split('\n')

  // Track code block ranges in the entire content
  // Pair up code block fences in order (first with second, third with fourth, etc.)
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

  // Track inline code ranges in the entire content
  const inlineCodeRanges: Array<{ start: number, end: number }> = []
  const backtickPositions: number[] = []

  // Find all backticks in the content (excluding those in code blocks)
  for (let i = 0; i < content.length; i++) {
    // Skip code blocks
    if (content.substring(i).startsWith('```')) {
      const codeBlockEnd = content.indexOf('```', i + 3)
      if (codeBlockEnd !== -1) {
        i = codeBlockEnd + 2 // Skip to after closing ```
        continue
      }
    }

    if (content[i] === '`') {
      // Check if it's part of ``` (triple backticks)
      const before = content[i - 1] || ''
      const before2 = content[i - 2] || ''
      const after = content[i + 1] || ''
      const after2 = content[i + 2] || ''

      // Skip if this backtick is part of ```
      const isPartOfTriple = (before === '`' && before2 === '`') // third of ```
        || (before === '`' && after === '`') // middle of ```
        || (after === '`' && after2 === '`') // first of ```

      if (!isPartOfTriple)
        backtickPositions.push(i)
    }
  }

  // Pair up backticks to find inline code ranges
  for (let i = 0; i < backtickPositions.length; i += 2) {
    if (i + 1 < backtickPositions.length) {
      const start = backtickPositions[i]!
      const end = backtickPositions[i + 1]! + 1
      inlineCodeRanges.push({ start, end })
    }
  }

  // Track footnote definition line ranges to skip them
  const footnoteDefRanges: Array<{ start: number, end: number }> = []
  let lineOffset = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (isFootnoteDefLine(line)) {
      const lineEnd = lineOffset + line.length
      footnoteDefRanges.push({ start: lineOffset, end: lineEnd })
    }
    lineOffset += line.length + 1 // +1 for newline
  }

  // First, handle incomplete footnote references (e.g., [^1 without closing ])
  // These should be removed immediately, similar to how incomplete links are handled
  // Only process the last paragraph for incomplete references
  let lastParagraphStartIndex = 0

  // Find the last paragraph (after the last blank line)
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]!
    if (line.trim() === '') {
      lastParagraphStartIndex = i + 1
      break
    }
  }

  const lastParagraph = lines.slice(lastParagraphStartIndex).join('\n')
  let result = content

  // Check for incomplete footnote reference in the last paragraph
  if (incompleteFootnoteRefPattern.test(lastParagraph)) {
    // Find the position of [^ in the last paragraph
    const incompleteRefPos = lastParagraph.lastIndexOf('[^')
    if (incompleteRefPos !== -1) {
      // Check if it's inside a code block or inline code
      const absolutePos = lastParagraphStartIndex > 0
        ? lines.slice(0, lastParagraphStartIndex).join('\n').length + 1 + incompleteRefPos
        : incompleteRefPos

      const isInCodeBlock = codeBlockRanges.some(
        range => absolutePos >= range.start && absolutePos < range.end,
      )

      const isInInlineCode = inlineCodeRanges.some(
        range => absolutePos >= range.start && absolutePos < range.end,
      )

      if (!isInCodeBlock && !isInInlineCode) {
        // Find where the incomplete reference ends (until end of line or end of content)
        const lineEnd = lastParagraph.indexOf('\n', incompleteRefPos)
        const refEnd = lineEnd !== -1 ? lineEnd : lastParagraph.length

        // Calculate absolute position in full content
        const beforeLastParagraph = lines.slice(0, lastParagraphStartIndex).join('\n')
        const paragraphOffset = beforeLastParagraph.length > 0 ? beforeLastParagraph.length + 1 : 0
        const absoluteStart = paragraphOffset + incompleteRefPos
        const absoluteEnd = paragraphOffset + refEnd

        // Remove the incomplete reference (from [^ to end of line or end of content)
        result = result.substring(0, absoluteStart) + result.substring(absoluteEnd)
        // Update content for further processing
        content = result
        // Recalculate code blocks and inline code ranges after removing incomplete reference
        // This is important because positions may have shifted
        codeBlockRanges.length = 0
        searchStart = 0
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
        // Recalculate inline code ranges
        inlineCodeRanges.length = 0
        backtickPositions.length = 0
        for (let i = 0; i < content.length; i++) {
          if (content.substring(i).startsWith('```')) {
            const codeBlockEnd = content.indexOf('```', i + 3)
            if (codeBlockEnd !== -1) {
              i = codeBlockEnd + 2
              continue
            }
          }
          if (content[i] === '`') {
            const before = content[i - 1] || ''
            const before2 = content[i - 2] || ''
            const after = content[i + 1] || ''
            const after2 = content[i + 2] || ''
            const isPartOfTriple = (before === '`' && before2 === '`')
              || (before === '`' && after === '`')
              || (after === '`' && after2 === '`')
            if (!isPartOfTriple)
              backtickPositions.push(i)
          }
        }
        for (let i = 0; i < backtickPositions.length; i += 2) {
          if (i + 1 < backtickPositions.length) {
            const start = backtickPositions[i]!
            const end = backtickPositions[i + 1]! + 1
            inlineCodeRanges.push({ start, end })
          }
        }
      }
    }
  }

  // Now find all complete footnote references in the entire content
  const refPositions: Array<{ start: number, end: number, label: string }> = []
  let refMatch: RegExpExecArray | null = footnoteRefPattern.exec(content)

  while (refMatch !== null) {
    const absolutePos = refMatch.index!
    const refText = refMatch[0]

    // Check if this reference is inside a code block
    const isInCodeBlock = codeBlockRanges.some(
      range => absolutePos >= range.start && absolutePos < range.end,
    )

    // Check if this reference is inside inline code
    const isInInlineCode = inlineCodeRanges.some(
      range => absolutePos >= range.start && absolutePos < range.end,
    )

    // Check if this reference is inside a footnote definition line
    const isInFootnoteDef = footnoteDefRanges.some(
      range => absolutePos >= range.start && absolutePos < range.end,
    )

    if (!isInCodeBlock && !isInInlineCode && !isInFootnoteDef) {
      // Extract label from [^label]
      const labelMatch = refText.match(footnoteRefLabelPattern)
      if (labelMatch && labelMatch[1]) {
        refPositions.push({
          start: absolutePos,
          end: absolutePos + refText.length,
          label: labelMatch[1],
        })
      }
    }
    refMatch = footnoteRefPattern.exec(content)
  }

  // If no references to process, return original content
  if (refPositions.length === 0)
    return content

  // Remove references that don't have corresponding definitions
  // Process from end to start to avoid index shifting issues
  for (let i = refPositions.length - 1; i >= 0; i--) {
    const ref = refPositions[i]!
    if (!definedLabels.has(ref.label)) {
      // Remove the reference
      result = result.substring(0, ref.start) + result.substring(ref.end)
    }
  }

  return result
}
