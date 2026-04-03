import type { TableData } from '../types'

const CSV_QUOTE_PATTERN = /"/g

export function extractTableDataFromElement(tableElement: HTMLElement): TableData {
  const headers: string[] = []
  const rows: string[][] = []

  const headerCells = Array.from(tableElement.querySelectorAll('thead th'))
  for (const cell of headerCells)
    headers.push(cell.textContent?.trim() || '')

  const bodyRows = Array.from(tableElement.querySelectorAll('tbody tr'))
  for (const row of bodyRows) {
    const rowData: string[] = []
    const cells = Array.from(row.querySelectorAll('td'))
    for (const cell of cells)
      rowData.push(cell.textContent?.trim() || '')

    rows.push(rowData)
  }

  return { headers, rows }
}

export function tableDataToCSV(data: TableData): string {
  const { headers, rows } = data

  const escapeCSV = (value: string): string => {
    let needsEscaping = false
    let hasQuote = false

    // biome-ignore lint/style/useForOf: "Need index access to check character codes for performance"
    for (let i = 0; i < value.length; i += 1) {
      const char = value[i]
      if (char === '"') {
        needsEscaping = true
        hasQuote = true
        break
      }
      if (char === ',' || char === '\n')
        needsEscaping = true
    }

    if (!needsEscaping)
      return value

    if (hasQuote)
      return `"${value.replace(CSV_QUOTE_PATTERN, '""')}"`

    return `"${value}"`
  }

  const totalRows = headers.length > 0 ? rows.length + 1 : rows.length
  const csvRows: string[] = Array.from({ length: totalRows })
  let rowIndex = 0

  if (headers.length > 0) {
    csvRows[rowIndex] = headers.map(escapeCSV).join(',')
    rowIndex += 1
  }

  for (const row of rows) {
    csvRows[rowIndex] = row.map(escapeCSV).join(',')
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
    if (char === '\\' || char === '|') {
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
