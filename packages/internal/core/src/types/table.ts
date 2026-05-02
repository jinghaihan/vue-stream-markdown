export type TableFormat = 'csv' | 'tsv' | 'markdown'

export interface TableData {
  headers: string[]
  rows: string[][]
}
