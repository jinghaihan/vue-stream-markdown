// @vitest-environment happy-dom
import {
  escapeMarkdownTableCell,
  extractTableDataFromElement,
  getTableCsvSeparator,
  tableDataToCSV,
  tableDataToMarkdown,
  tableDataToTSV,
} from '@stream-markdown/core'
import { afterEach, describe, expect, it, vi } from 'vitest'

const multilineTableData = {
  headers: ['Header\nwith break'],
  rows: [['Line A\nLine B\nLine C']],
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('table cell text extraction', () => {
  it('preserves nested and repeated br elements as newlines', () => {
    const table = document.createElement('table')
    table.innerHTML = `
      <thead>
        <tr><th>Header<br>with break</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Line A</strong><br>Line B<br><em>Line C</em></td></tr>
      </tbody>
    `

    expect(extractTableDataFromElement(table)).toEqual(multilineTableData)
  })
})

describe('multiline table serialization', () => {
  it('quotes multiline CSV fields', () => {
    expect(tableDataToCSV(multilineTableData)).toBe(
      '"Header\nwith break"\n"Line A\nLine B\nLine C"',
    )
  })

  it('escapes multiline TSV fields', () => {
    expect(tableDataToTSV(multilineTableData)).toBe(
      'Header\\nwith break\nLine A\\nLine B\\nLine C',
    )
  })

  it('uses br elements to keep Markdown table rows on one line', () => {
    expect(escapeMarkdownTableCell('Line A\nLine B')).toBe('Line A<br>Line B')
    expect(tableDataToMarkdown(multilineTableData)).toBe(
      '| Header<br>with break |\n| --- |\n| Line A<br>Line B<br>Line C |',
    )
  })
})

describe('csv separators', () => {
  const tableData = {
    headers: ['Name', 'Location'],
    rows: [['Ada', 'Paris; France']],
  }

  it('uses and escapes the configured separator', () => {
    expect(tableDataToCSV(tableData, ';')).toBe(
      'Name;Location\nAda;"Paris; France"',
    )
    expect(tableDataToCSV({ headers: ['Name', 'Note'], rows: [['Ada', 'A\tB']] }, '\t')).toBe(
      'Name\tNote\nAda\t"A\tB"',
    )
  })

  it('uses semicolons in auto mode for comma-decimal locales', () => {
    // eslint-disable-next-line prefer-arrow-callback
    vi.spyOn(Intl, 'NumberFormat').mockImplementation(function NumberFormatMock() {
      return { format: () => '1,1' } as unknown as Intl.NumberFormat
    })

    expect(tableDataToCSV(tableData, 'auto')).toBe(
      'Name;Location\nAda;"Paris; France"',
    )
  })

  it('escapes carriage returns in CSV fields', () => {
    expect(tableDataToCSV({ headers: ['Text'], rows: [['Line 1\rLine 2']] })).toBe(
      'Text\n"Line 1\rLine 2"',
    )
  })

  it('reads valid separators from table controls and falls back to comma', () => {
    expect(getTableCsvSeparator({ table: { csvSeparator: ';' } })).toBe(';')
    expect(getTableCsvSeparator({ table: { csvSeparator: '\t' } })).toBe('\t')
    expect(getTableCsvSeparator({ table: { csvSeparator: 'auto' } })).toBe('auto')
    expect(getTableCsvSeparator({ table: { csvSeparator: 'invalid' } })).toBe(',')
    expect(getTableCsvSeparator(false)).toBe(',')
  })
})
