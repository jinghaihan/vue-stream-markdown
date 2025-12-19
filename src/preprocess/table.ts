import { separatorPattern, tableRowPattern, tripleBacktickPattern } from './pattern'
import { getLastParagraphWithIndex } from './utils'

/**
 * Fix incomplete table syntax in streaming markdown
 *
 * Handles markdown tables by detecting the header row and ensuring
 * a separator row exists. Only processes the last paragraph for streaming.
 *
 * Table format:
 * | Header 1 | Header 2 |
 * | -------- | -------- |
 * | Cell 1   | Cell 2   |
 *
 * @param content - Markdown content (potentially incomplete in stream mode)
 * @returns Content with auto-completed table separator if needed
 *
 * @example
 * fixTable('| a | b |\n')
 * // Returns: '| a | b |\n| --- | --- |'
 *
 * @example
 * fixTable('| a | b |\n| ---')
 * // Returns: '| a | b |\n| --- | --- |'
 *
 * @example
 * fixTable('| a | b |\n| --- | --- |')
 * // Returns: '| a | b |\n| --- | --- |' (no change, already complete)
 */
export function fixTable(content: string): string {
  // Don't process if we're inside a code block (unclosed)
  const codeBlockMatches = content.match(tripleBacktickPattern)
  const codeBlockCount = codeBlockMatches ? codeBlockMatches.length : 0

  // If odd number of code block fences, we're inside a code block
  if (codeBlockCount % 2 === 1)
    return content

  // Find all code block ranges to check if table is inside a closed code block
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

  // Find the last paragraph (after the last blank line)
  const { lastParagraph } = getLastParagraphWithIndex(content, true)
  const paragraphLines = lastParagraph.split('\n').filter(line => line.trim() !== '')

  // Check if any line in the last paragraph is a table header row
  if (paragraphLines.length === 0)
    return content

  // Find potential table header row (first table row in the paragraph)
  // Also check for lines starting with | that might be incomplete table headers
  let headerRowIndex = -1
  let headerRow = ''

  for (let i = 0; i < paragraphLines.length; i++) {
    const line = paragraphLines[i]
    if (!line) {
      continue
    }
    const trimmedLine = line.trim()
    // Check if it matches table row pattern or starts with | (might be incomplete)
    if (tableRowPattern.test(trimmedLine) || (trimmedLine.startsWith('|') && trimmedLine.length > 1)) {
      headerRowIndex = i
      headerRow = trimmedLine
      break
    }
  }

  // No table header row found
  if (headerRowIndex === -1)
    return content

  // Check if the header row is inside a code block
  const headerRowPos = content.lastIndexOf(headerRow)
  if (headerRowPos !== -1) {
    const headerRowEndPos = headerRowPos + headerRow.length
    const isHeaderRowInCodeBlock = codeBlockRanges.some(
      range => (headerRowPos >= range.start && headerRowPos < range.end)
        || (headerRowEndPos > range.start && headerRowEndPos <= range.end)
        || (headerRowPos < range.start && headerRowEndPos > range.end),
    )

    if (isHeaderRowInCodeBlock) {
      return content
    }
  }

  // Check if header row is complete (ends with |)
  // This ensures we complete incomplete headers during streaming to avoid flickering
  const trimmedHeader = headerRow.trim()
  const isHeaderComplete = trimmedHeader.endsWith('|')

  // Complete the header row if it's incomplete
  let completedHeaderRow = headerRow
  if (!isHeaderComplete) {
    // Add closing | to make it a valid table row
    completedHeaderRow = `${trimmedHeader} |`
  }

  // Count columns in the completed header row
  const headerColumns = (completedHeaderRow.match(/\|/g) || []).length - 1
  if (headerColumns < 1)
    return content

  const separator = generateSeparator(headerColumns)

  // Use the headerRowPos we already found above
  const beforeHeaderRow = content.substring(0, headerRowPos)
  const afterHeaderRow = content.substring(headerRowPos + headerRow.length)

  // Case 1: Header row is the last line in paragraph - complete header and add separator
  if (headerRowIndex === paragraphLines.length - 1) {
    const newContent = isHeaderComplete ? content : `${beforeHeaderRow}${completedHeaderRow}${afterHeaderRow}`
    if (newContent.endsWith('\n'))
      return `${newContent}${separator}`
    else
      return `${newContent}\n${separator}`
  }

  // Case 2: There's a line after the header row
  const nextLineRaw = paragraphLines[headerRowIndex + 1]
  if (!nextLineRaw) {
    return content
  }
  const nextLine = nextLineRaw.trim()

  // Check if next line is already a valid separator with correct column count
  if (separatorPattern.test(nextLine)) {
    const separatorColumns = (nextLine.match(/\|/g) || []).length - 1
    if (separatorColumns === headerColumns) {
      // Separator matches, but we might still need to complete the header
      if (!isHeaderComplete) {
        return `${beforeHeaderRow}${completedHeaderRow}${afterHeaderRow}`
      }
      return content // Already complete
    }
  }

  // Case 3: Next line is incomplete separator or data row - complete header, replace/insert separator
  // Split the content after header row to find the next line
  const afterLines = afterHeaderRow.split('\n')

  if (afterLines.length > 1) {
    // There is a next line
    const nextLineInContent = afterLines[1]
    if (!nextLineInContent) {
      return content
    }

    if (nextLineInContent.startsWith('|') && nextLineInContent.includes('-')) {
      // Replace incomplete separator
      const remainingLines = afterLines.slice(2).join('\n')
      const newHeader = isHeaderComplete ? headerRow : completedHeaderRow
      if (remainingLines.length > 0) {
        return `${beforeHeaderRow}${newHeader}\n${separator}\n${remainingLines}`
      }
      else {
        return `${beforeHeaderRow}${newHeader}\n${separator}`
      }
    }
    else {
      // Insert separator before the next line (which might be data row)
      const remainingContent = afterLines.slice(1).join('\n')
      const newHeader = isHeaderComplete ? headerRow : completedHeaderRow
      return `${beforeHeaderRow}${newHeader}\n${separator}\n${remainingContent}`
    }
  }
  else {
    // No next line, complete header and add separator
    const newHeader = isHeaderComplete ? headerRow : completedHeaderRow
    return `${beforeHeaderRow}${newHeader}\n${separator}`
  }
}

/**
 * Generate a table separator row with the specified number of columns
 * Format: | --- | --- | ... |
 */
function generateSeparator(columns: number): string {
  const parts: string[] = []
  for (let i = 0; i < columns; i++) {
    parts.push(' --- ')
  }
  return `|${parts.join('|')}|`
}
