// @vitest-environment happy-dom
import {
  escapeMarkdownTableCell,
  extractTableDataFromElement,
  tableDataToCSV,
  tableDataToMarkdown,
  tableDataToTSV,
} from '@stream-markdown/core'
import { describe, expect, it } from 'vitest'

const multilineTableData = {
  headers: ['Header\nwith break'],
  rows: [['Line A\nLine B\nLine C']],
}

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
