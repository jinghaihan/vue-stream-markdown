import type { CSVSeparator, TableData } from '../types'
import { getConfigValue } from './config'

export type TableAlign = 'left' | 'center' | 'right'

const CSV_QUOTE_PATTERN = /"/g

interface ExtractedTableCell {
  text: string
  markdown: string
}

// Keep real images separate from lookalike Markdown text without changing TableData.
const tableMarkdownCells = new WeakMap<TableData, {
  headers: ExtractedTableCell[]
  rows: ExtractedTableCell[][]
}>()

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

function imageToMarkdown(image: Element): string {
  const alt = (image.getAttribute('alt') ?? '').replace(/[\r\n]+/g, ' ')
  const escapedAlt = escapeMarkdownTableCell(alt)
  const src = (image.getAttribute('src') ?? '')
    .replace(/[\\\s()<>"'`|]/g, char => encodeURIComponent(char)
      .replace(/[()']/g, punctuation => `%${punctuation.charCodeAt(0).toString(16).toUpperCase()}`))
  // Comark keeps Markdown escapes/entities in image alt attributes verbatim.
  // Inline HTML preserves complex labels in both static and streaming mode.
  if (escapedAlt !== alt.replace(/\|/g, '\\|'))
    return `<img src="${escapeHtmlAttribute(src)}" alt="${escapeHtmlAttribute(alt)}">`
  return `![${escapedAlt}](${src.replace(/&/g, '\\&')})`
}

function escapeHtmlAttribute(value: string): string {
  return value.replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\|/g, '&#124;')
}

function extractTableCell(cell: Element): ExtractedTableCell {
  const parts: Array<string | Element> = []

  function appendText(value: string): void {
    const lastIndex = parts.length - 1
    const last = parts[lastIndex]
    if (typeof last === 'string')
      parts[lastIndex] = last + value
    else
      parts.push(value)
  }

  function visit(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      appendText(node.textContent ?? '')
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE)
      return

    const element = node as Element
    if (element.getAttribute('data-stream-markdown') === 'image-figure') {
      const image = element.querySelector('img')
      if (image)
        visit(image)
      return
    }
    if (element.tagName === 'IMG') {
      parts.push(element)
      return
    }
    if (element.tagName === 'BR') {
      appendText('\n')
      return
    }
    for (const child of element.childNodes)
      visit(child)
  }

  visit(cell)
  const first = parts[0]
  if (typeof first === 'string')
    parts[0] = first.trimStart()
  const lastIndex = parts.length - 1
  const last = parts[lastIndex]
  if (typeof last === 'string')
    parts[lastIndex] = last.trimEnd()

  return {
    text: parts.map(part => typeof part === 'string'
      ? part
      : part.getAttribute('alt') ?? '').join('').trim(),
    markdown: parts.map(part => typeof part === 'string'
      ? escapeMarkdownTableCell(part)
      : imageToMarkdown(part)).join('').trim(),
  }
}

export function extractTableDataFromElement(tableElement: HTMLElement): TableData {
  const headers = Array.from(tableElement.querySelectorAll(':scope > thead > tr > th, :scope > thead > tr > td'), extractTableCell)
  const rows = Array.from(tableElement.querySelectorAll(':scope > tbody > tr, :scope > tr'), row =>
    Array.from(row.querySelectorAll(':scope > th, :scope > td'), extractTableCell))
  const data: TableData = {
    headers: headers.map(cell => cell.text),
    rows: rows.map(row => row.map(cell => cell.text)),
  }
  tableMarkdownCells.set(data, { headers, rows })
  return data
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
  if (separator === 'auto') {
    resolvedSeparator = new Intl.NumberFormat().format(1.1).includes(',')
      ? ';'
      : ','
  }
  else {
    resolvedSeparator = separator
  }

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

  const totalRows = headers.length > 0
    ? rows.length + 1
    : rows.length
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

  const totalRows = headers.length > 0
    ? rows.length + 1
    : rows.length
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

const MARKDOWN_TABLE_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  // Backslash-bracket escapes are also LaTeX delimiters in streaming mode.
  '[': '&#91;',
  ']': '&#93;',
  '\r\n': '<br>',
  '\r': '<br>',
  '\n': '<br>',
}

export function escapeMarkdownTableCell(cell: string): string {
  return cell.replace(/\r\n|[\\|`*_~[\]$@&<>\r\n]|:(?=\/\/)|www\./gi, (value) => {
    if (value.toLowerCase() === 'www.')
      return `${value.slice(0, 3)}\\.`
    return MARKDOWN_TABLE_ENTITIES[value] ?? `\\${value}`
  })
}

export function tableDataToMarkdown(data: TableData) {
  const { headers, rows } = data
  let columnCount = headers.length
  for (const row of rows)
    columnCount = Math.max(columnCount, row.length)
  if (columnCount === 0)
    return ''

  const extracted = tableMarkdownCells.get(data)

  function serializeRow(row: string[], cells?: ExtractedTableCell[]): string {
    const values = Array.from({ length: columnCount }, (_, index) => {
      const text = row[index] ?? ''
      const cell = cells?.[index]
      return cell?.text === text
        ? cell.markdown
        : escapeMarkdownTableCell(text)
    })
    return `| ${values.join(' | ')} |`
  }

  return [
    serializeRow(headers, extracted?.headers),
    `| ${Array.from({ length: columnCount }).fill('---').join(' | ')} |`,
    ...rows.map((row, index) => serializeRow(row, extracted?.rows[index])),
  ].join('\n')
}
