export type TableFormat = 'csv' | 'tsv' | 'markdown'
export type CSVSeparator = ',' | ';' | '\t' | 'auto'

export interface TableData {
  headers: string[]
  rows: string[][]
}
