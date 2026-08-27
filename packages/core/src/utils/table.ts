import type { CSVSeparator, TableData } from '../types'
import { getConfigValue } from './config'

export type TableAlign = 'left' | 'center' | 'right'

const CSV_QUOTE_PATTERN = /"/g

export function resolveTableAlign(
  align: Array<TableAlign | null | undefined> | undefined,
  index: number,
): TableAlign {
  return align?.[index] || 'left'
}

export function getTableCellNodes<TNode = unknown>(
  cell: TNode | { children?: TNode[] },
): TNode[] {
  const children = (cell as { children?: TNode[] }).children
  if (Array.isArray(children))
    return children
  return [cell as TNode]
}

function extractTableCellText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE)
    return node.textContent ?? ''

  if (node.nodeType !== Node.ELEMENT_NODE)
    return ''

  const element = node as HTMLElement
  if (element.tagName === 'BR')
    return '\n'

  return Array.from(element.childNodes).map(extractTableCellText).join('')
}

export function extractTableDataFromElement(tableElement: HTMLElement): TableData {
  const headers: string[] = []
  const rows: string[][] = []

  const headerCells = Array.from(tableElement.querySelectorAll('thead th'))
  for (const cell of headerCells)
    headers.push(extractTableCellText(cell).trim())

  const bodyRows = Array.from(tableElement.querySelectorAll('tbody tr'))
  for (const row of bodyRows) {
    const rowData: string[] = []
    const cells = Array.from(row.querySelectorAll('td'))
    for (const cell of cells)
      rowData.push(extractTableCellText(cell).trim())

    rows.push(rowData)
  }

  return { headers, rows }
}

export function getTableCsvSeparator(config: unknown): CSVSeparator {
  const separator = getConfigValue<unknown>(config, 'table.csvSeparator')
  if (separator === ';' || separator === '\t' || separator === 'auto')
    return separator
  return ','
}

export function tableDataToCSV(
  data: TableData,
  separator: CSVSeparator = ',',
): string {
  let resolvedSeparator: Exclude<CSVSeparator, 'auto'>
  if (separator === 'auto')
    resolvedSeparator = new Intl.NumberFormat().format(1.1).includes(',') ? ';' : ','
  else
    resolvedSeparator = separator

  const { headers, rows } = data

  const escapeCSV = (value: string): string => {
    let needsEscaping = false

    // biome-ignore lint/style/useForOf: "Need index access to check character codes for performance"
    for (let i = 0; i < value.length; i += 1) {
      const char = value[i]
      if (char === resolvedSeparator || char === '"' || char === '\n' || char === '\r') {
        needsEscaping = true
        break
      }
    }

    if (!needsEscaping)
      return value

    return `"${value.replace(CSV_QUOTE_PATTERN, '""')}"`
  }

  const totalRows = headers.length > 0 ? rows.length + 1 : rows.length
  const csvRows: string[] = Array.from({ length: totalRows })
  let rowIndex = 0

  if (headers.length > 0) {
    csvRows[rowIndex] = headers.map(escapeCSV).join(resolvedSeparator)
    rowIndex += 1
  }

  for (const row of rows) {
    csvRows[rowIndex] = row.map(escapeCSV).join(resolvedSeparator)
    rowIndex += 1
  }

  return csvRows.join('\n')
}

export function tableDataToTSV(data: TableData): string {
  const { headers, rows } = data

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: "TSV escaping requires character-by-character inspection"
  const escapeTSV = (value: string): string => {
    let needsEscaping = false

    // biome-ignore lint/style/useForOf: "Need index access to check character codes for performance"
    for (let i = 0; i < value.length; i += 1) {
      const char = value[i]
      if (char === '\t' || char === '\n' || char === '\r') {
        needsEscaping = true
        break
      }
    }

    if (!needsEscaping)
      return value

    const parts: string[] = []

    // biome-ignore lint/style/useForOf: "Need index access to check character codes for performance"
    for (let i = 0; i < value.length; i += 1) {
      const char = value[i]!
      if (char === '\t')
        parts.push('\\t')
      else if (char === '\n')
        parts.push('\\n')
      else if (char === '\r')
        parts.push('\\r')
      else
        parts.push(char)
    }

    return parts.join('')
  }

  const totalRows = headers.length > 0 ? rows.length + 1 : rows.length
  const tsvRows: string[] = Array.from({ length: totalRows })
  let rowIndex = 0

  if (headers.length > 0) {
    tsvRows[rowIndex] = headers.map(escapeTSV).join('\t')
    rowIndex += 1
  }

  for (const row of rows) {
    tsvRows[rowIndex] = row.map(escapeTSV).join('\t')
    rowIndex += 1
  }

  return tsvRows.join('\n')
}

export function escapeMarkdownTableCell(cell: string): string {
  let needsEscaping = false

  // biome-ignore lint/style/useForOf: "Need index access to check character codes for performance"
  for (let i = 0; i < cell.length; i += 1) {
    const char = cell[i]
    if (char === '\\' || char === '|' || char === '\n') {
      needsEscaping = true
      break
    }
  }

  if (!needsEscaping)
    return cell

  const parts: string[] = []

  // biome-ignore lint/style/useForOf: "Need index access to check character codes for performance"
  for (let i = 0; i < cell.length; i += 1) {
    const char = cell[i]!
    if (char === '\\')
      parts.push('\\\\')
    else if (char === '|')
      parts.push('\\|')
    else if (char === '\n')
      parts.push('<br>')
    else
      parts.push(char)
  }

  return parts.join('')
}

export function tableDataToMarkdown(data: TableData) {
  const { headers, rows } = data

  if (headers.length === 0)
    return ''

  const markdownRows: string[] = Array.from({ length: rows.length + 2 })
  let rowIndex = 0

  const escapedHeaders = headers.map(h => escapeMarkdownTableCell(h))
  markdownRows[rowIndex] = `| ${escapedHeaders.join(' | ')} |`
  rowIndex += 1

  const separatorParts = Array.from({ length: headers.length })
  for (let i = 0; i < headers.length; i += 1)
    separatorParts[i] = '---'

  markdownRows[rowIndex] = `| ${separatorParts.join(' | ')} |`
  rowIndex += 1

  for (const row of rows) {
    if (row.length < headers.length) {
      const paddedRow = Array.from({ length: headers.length })
      for (let i = 0; i < headers.length; i += 1)
        paddedRow[i] = i < row.length ? escapeMarkdownTableCell(row[i]!) : ''

      markdownRows[rowIndex] = `| ${paddedRow.join(' | ')} |`
      rowIndex += 1
      continue
    }

    const escapedRow = row.map(cell => escapeMarkdownTableCell(cell))
    markdownRows[rowIndex] = `| ${escapedRow.join(' | ')} |`
    rowIndex += 1
  }

  return markdownRows.join('\n')
}
