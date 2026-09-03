import type { CompletionContext } from '../types'
import { getCompletionAnalysis } from './context'
import {
  separatorPattern,
  tableRowPattern,
  whitespaceCharacterPattern,
  whitespaceGlobalPattern,
} from './pattern'
import {
  isEscapedCharacter,
  isRangeOverlappingRanges,
} from './utils'

type TableAlignment = 'center' | 'left' | 'right' | undefined

interface TableHeader {
  index: number
  row: string
}

interface TableHeaderState {
  row: string
  completedRow: string
  isComplete: boolean
  columns: number
}

function countTablePipes(row: string): number {
  let count = 0
  for (let index = 0; index < row.length; index += 1) {
    if (row[index] === '|' && !isEscapedCharacter(row, index))
      count += 1
  }
  return count
}

function parseIncompleteSeparatorAlignments(row: string): TableAlignment[] | undefined {
  const trimmedRow = row.trim()
  if (!trimmedRow.startsWith('|'))
    return undefined

  const markerCharacters = [...trimmedRow].filter(character => character !== '|' && !whitespaceCharacterPattern.test(character))
  if (markerCharacters.length === 0
    || markerCharacters.some(character => character !== '-' && character !== ':')) {
    return undefined
  }

  const cells = trimmedRow.split('|')
  if (cells[0] === '')
    cells.shift()
  if (cells.at(-1)?.trim() === '')
    cells.pop()

  return cells.map((cell) => {
    const marker = cell.replace(whitespaceGlobalPattern, '')
    const startsWithColon = marker.startsWith(':')
    const endsWithColon = marker.length > 1 && marker.endsWith(':')

    if (startsWithColon && endsWithColon)
      return 'center'
    if (startsWithColon)
      return 'left'
    if (endsWithColon)
      return 'right'
    return undefined
  })
}

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
export function fixTable(content: string, context?: CompletionContext): string {
  if (!content.includes('|'))
    return content

  const analysis = getCompletionAnalysis(content, context)
  // Don't process if we're inside a code block (unclosed)
  if (analysis.hasUnclosedCodeBlock)
    return content

  // Find all code block ranges to check if table is inside a closed code block
  const { codeBlockRanges } = analysis

  // Find the last paragraph (after the last blank line)
  const lastParagraph = analysis.getLastParagraph(true).content
  const paragraphLines = lastParagraph.split('\n').filter(line => line.trim() !== '')

  const header = findTableHeader(paragraphLines)
  if (header === undefined)
    return content

  // Check if the header row is inside a code block
  const headerRowPos = content.lastIndexOf(header.row)
  if (headerRowPos !== -1) {
    const headerRowEndPos = headerRowPos + header.row.length
    const isHeaderRowInCodeBlock = isRangeOverlappingRanges(headerRowPos, headerRowEndPos, codeBlockRanges)

    if (isHeaderRowInCodeBlock)
      return content
  }

  const headerState = getTableHeaderState(header.row)
  const separator = generateSeparator(headerState.columns)

  // Use the headerRowPos we already found above
  const beforeHeaderRow = content.substring(0, headerRowPos)
  const afterHeaderRow = content.substring(headerRowPos + header.row.length)

  // Case 1: Header row is the last line in paragraph - complete header and add separator
  if (header.index === paragraphLines.length - 1)
    return completeLastTableHeader(content, beforeHeaderRow, afterHeaderRow, headerState, separator)

  // Case 2: There's a line after the header row
  const nextLineRaw = paragraphLines[header.index + 1]
  const nextLine = (nextLineRaw || '').trim()

  const matchingSeparatorResult = completeMatchingSeparator(
    content,
    beforeHeaderRow,
    afterHeaderRow,
    headerState,
    nextLine,
  )
  if (matchingSeparatorResult !== undefined)
    return matchingSeparatorResult

  // Case 3: Next line is incomplete separator or data row - complete header, replace/insert separator
  // Split the content after header row to find the next line
  const afterLines = afterHeaderRow.split('\n')
  const nextLineInContent = afterLines[1] || ''
  const newHeader = headerState.isComplete ? header.row : headerState.completedRow

  const partialSeparatorAlignments = parseIncompleteSeparatorAlignments(nextLineInContent)
  if (partialSeparatorAlignments !== undefined) {
    // Replace incomplete separator
    const completedSeparator = generateSeparator(headerState.columns, partialSeparatorAlignments)
    const remainingLines = afterLines.slice(2).join('\n')
    if (remainingLines.length > 0) {
      return `${beforeHeaderRow}${newHeader}\n${completedSeparator}\n${remainingLines}`
    }
    else {
      return `${beforeHeaderRow}${newHeader}\n${completedSeparator}`
    }
  }

  // Insert separator before the next line (which might be data row)
  const remainingContent = afterLines.slice(1).join('\n')
  return `${beforeHeaderRow}${newHeader}\n${separator}\n${remainingContent}`
}

function findTableHeader(lines: string[]): TableHeader | undefined {
  for (let index = 0; index < lines.length; index += 1) {
    const row = (lines[index] || '').trim()
    if (tableRowPattern.test(row) || (row.startsWith('|') && row.length > 1))
      return { index, row }
  }

  return undefined
}

function getTableHeaderState(row: string): TableHeaderState {
  const trimmedRow = row.trim()
  const isComplete = trimmedRow.endsWith('|')
    && !isEscapedCharacter(trimmedRow, trimmedRow.length - 1)
  const completedRow = isComplete ? row : `${trimmedRow} |`

  return {
    row,
    completedRow,
    isComplete,
    columns: countTablePipes(completedRow) - 1,
  }
}

function completeLastTableHeader(
  content: string,
  beforeHeaderRow: string,
  afterHeaderRow: string,
  header: TableHeaderState,
  separator: string,
): string {
  const newContent = header.isComplete
    ? content
    : `${beforeHeaderRow}${header.completedRow}${afterHeaderRow}`
  return newContent.endsWith('\n') ? `${newContent}${separator}` : `${newContent}\n${separator}`
}

function completeMatchingSeparator(
  content: string,
  beforeHeaderRow: string,
  afterHeaderRow: string,
  header: TableHeaderState,
  nextLine: string,
): string | undefined {
  if (!separatorPattern.test(nextLine) || countTablePipes(nextLine) - 1 !== header.columns)
    return undefined

  return header.isComplete
    ? content
    : `${beforeHeaderRow}${header.completedRow}${afterHeaderRow}`
}

/**
 * Generate a table separator row with the specified number of columns
 * Format: | --- | --- | ... |
 */
function generateSeparator(columns: number, alignments: TableAlignment[] = []): string {
  const parts: string[] = []
  for (let i = 0; i < columns; i++) {
    const marker = alignments[i] === 'left'
      ? ':---'
      : alignments[i] === 'center'
        ? ':---:'
        : alignments[i] === 'right'
          ? '---:'
          : '---'
    parts.push(` ${marker} `)
  }
  return `|${parts.join('|')}|`
}
