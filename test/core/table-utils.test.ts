// @vitest-environment happy-dom
import {
  escapeMarkdownTableCell,
  extractTableDataFromElement,
  getTableCsvSeparator,
  save,
  tableDataToCSV,
  tableDataToMarkdown,
  tableDataToTSV,
} from '@stream-markdown/core'
import { afterEach, describe, expect, it, vi } from 'vitest'

const multilineTableData = {
  headers: ['Header\nwith break'],
  rows: [
    ['Line A\nLine B\nLine C'],
  ],
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

  it('trims cell edges before turning internal line breaks into Markdown', () => {
    const table = document.createElement('table')
    table.innerHTML = '<tbody><tr><td><br> A<br>B <br></td></tr></tbody>'

    expect(tableDataToMarkdown(extractTableDataFromElement(table))).toBe('|  |\n| --- |\n| A<br>B |')
  })

  it('keeps row headers in their original column', () => {
    const table = document.createElement('table')
    table.innerHTML = '<thead><tr><th>City</th><th>Temperature</th></tr></thead><tbody><tr><th scope="row">Beijing</th><td>25°C</td></tr></tbody>'
    const data = extractTableDataFromElement(table)

    expect(data.rows).toEqual([
      ['Beijing', '25°C'],
    ])
    expect(tableDataToCSV(data)).toBe('City,Temperature\nBeijing,25°C')
    expect(tableDataToMarkdown(data)).toContain('| Beijing | 25°C |')
  })

  it('exports real images as Markdown and their alt text as CSV and TSV', () => {
    const table = document.createElement('table')
    table.innerHTML = '<thead><tr><th>Asset</th></tr></thead><tbody><tr><td>Before <img alt="Logo" src="/logo.png"> after <img alt="" src="/icon.png"></td></tr></tbody>'
    const data = extractTableDataFromElement(table)

    expect(tableDataToMarkdown(data)).toBe('| Asset |\n| --- |\n| Before ![Logo](/logo.png) after ![](/icon.png) |')
    expect(tableDataToCSV(data)).toBe('Asset\nBefore Logo after')
    expect(tableDataToTSV(data)).toBe('Asset\nBefore Logo after')
  })

  it('escapes image labels and destinations without turning literal text into images', () => {
    const table = document.createElement('table')
    const cell = table.insertRow().insertCell()
    cell.append('![fake](/fake.png) ')
    const image = document.createElement('img')
    image.alt = 'A | [logo] **text**'
    image.setAttribute('src', '/my (logo)|图片.png?a=1&b=2')
    cell.append(image)
    const markdown = tableDataToMarkdown(extractTableDataFromElement(table))

    expect(markdown).toContain('!&#91;fake&#93;(/fake.png)')
    expect(markdown).toContain('<img src="/my%20%28logo%29%7C图片.png?a=1&amp;b=2" alt="A &#124; [logo] **text**">')
  })

  it('ignores image preview controls and captions when exporting the displayed image', () => {
    const table = document.createElement('table')
    table.innerHTML = '<tbody><tr><td><figure data-stream-markdown="image-figure"><button>Download</button><img alt="Logo" src="/logo.png"><figcaption>Caption</figcaption></figure></td></tr></tbody>'
    const data = extractTableDataFromElement(table)

    expect(data.rows).toEqual([
      ['Logo'],
    ])
    expect(tableDataToMarkdown(data)).toContain('| ![Logo](/logo.png) |')
  })

  it('does not reuse the image markup when an extracted cell is edited', () => {
    const table = document.createElement('table')
    table.innerHTML = '<tbody><tr><td><img alt="Logo" src="/logo.png"></td></tr></tbody>'
    const data = extractTableDataFromElement(table)
    data.rows[0]![0] = '**Changed**'

    expect(tableDataToMarkdown(data)).toContain('| \\*\\*Changed\\*\\* |')
    expect(tableDataToMarkdown(data)).not.toContain('/logo.png')
  })
})

describe('markdown table content preservation', () => {
  it('adds an empty header for headerless tables and preserves every column', () => {
    const table = document.createElement('table')
    table.innerHTML = '<tbody><tr><td>Beijing</td><td>25°C</td></tr><tr><td>Paris</td></tr></tbody>'

    expect(tableDataToMarkdown(extractTableDataFromElement(table))).toBe(
      '|  |  |\n| --- | --- |\n| Beijing | 25°C |\n| Paris |  |',
    )
  })

  it('pads headers when a body row has more columns', () => {
    expect(tableDataToMarkdown({
      headers: ['City'],
      rows: [
        ['Beijing', '25°C'],
      ],
    })).toBe(
      '| City |  |\n| --- | --- |\n| Beijing | 25°C |',
    )
    expect(tableDataToMarkdown({ headers: [], rows: [] })).toBe('')
  })

  it.each([
    ['**hello**', '\\*\\*hello\\*\\*'],
    ['_literal_', '\\_literal\\_'],
    ['~~deleted~~', '\\~\\~deleted\\~\\~'],
    ['`code`', '\\`code\\`'],
    ['[link](url)', '&#91;link&#93;(url)'],
    ['![image](url)', '!&#91;image&#93;(url)'],
    ['$math$', '\\$math\\$'],
    ['name@example.com', 'name\\@example.com'],
    ['https://example.com', 'https\\://example.com'],
    ['www.example.com', 'www\\.example.com'],
  ])(
    'preserves %s as literal Markdown table text',
    (text, escaped) => {
      expect(escapeMarkdownTableCell(text)).toBe(escaped)
    },
  )
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
    rows: [
      ['Ada', 'Paris; France'],
    ],
  }

  it('uses and escapes the configured separator', () => {
    expect(tableDataToCSV(tableData, ';')).toBe(
      'Name;Location\nAda;"Paris; France"',
    )
    expect(tableDataToCSV({
      headers: ['Name', 'Note'],
      rows: [
        ['Ada', 'A\tB'],
      ],
    }, '\t')).toBe(
      'Name\tNote\nAda\t"A\tB"',
    )
  })

  it('uses semicolons in auto mode for comma-decimal locales', () => {
    // eslint-disable-next-line prefer-arrow-callback
    vi.spyOn(Intl, 'NumberFormat').mockImplementation(function NumberFormatMock() {
      return {
        format: () => '1,1',
      } as unknown as Intl.NumberFormat
    })

    expect(tableDataToCSV(tableData, 'auto')).toBe(
      'Name;Location\nAda;"Paris; France"',
    )
  })

  it('escapes carriage returns in CSV fields', () => {
    expect(tableDataToCSV({
      headers: ['Text'],
      rows: [
        ['Line 1\rLine 2'],
      ],
    })).toBe(
      'Text\n"Line 1\rLine 2"',
    )
  })

  it('reads valid separators from table controls and falls back to comma', () => {
    expect(getTableCsvSeparator({
      table: { csvSeparator: ';' },
    })).toBe(';')
    expect(getTableCsvSeparator({
      table: { csvSeparator: '\t' },
    })).toBe('\t')
    expect(getTableCsvSeparator({
      table: { csvSeparator: 'auto' },
    })).toBe('auto')
    expect(getTableCsvSeparator({
      table: { csvSeparator: 'invalid' },
    })).toBe(',')
    expect(getTableCsvSeparator(false)).toBe(',')
  })
})

describe('csv downloads', () => {
  it('prefixes downloaded CSV text with a UTF-8 byte order mark', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:table')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    save('table.csv', '名称\n示例', 'text/csv')

    const blob = createObjectURL.mock.calls[0]?.[0] as Blob
    expect(await blob.text()).toBe('\uFEFF名称\n示例')
  })
})
