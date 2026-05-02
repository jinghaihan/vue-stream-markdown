import type {
  ParsedNode,
  TableCellNode,
  TableNode,
  TableRowNode,
} from '@markmend/ast'
import type { ControlDescriptor, SelectOption, TableData, TableFormat } from '../types'
import {
  getTableCellNodes,
  resolveTableAlign,
  tableDataToCSV,
  tableDataToMarkdown,
  tableDataToTSV,
} from '../utils'

export const TABLE_FORMAT_OPTIONS: SelectOption[] = [
  { label: 'CSV', value: 'csv' },
  { label: 'TSV', value: 'tsv' },
  { label: 'Markdown', value: 'markdown' },
]

export interface TableContent {
  content: string
  mimeType: string
  extension: string
}

export interface TableModelOptions {
  node: TableNode
  hasLoadingNode?: (nodes?: ParsedNode[]) => boolean
}

export function createTableModel(options: TableModelOptions) {
  const align = options.node.align || []
  const headerCells = options.node.children?.[0]?.children ?? []
  const bodyRows = options.node.children.slice(1)

  return {
    align,
    headerCells,
    bodyRows,
    loading: options.hasLoadingNode?.(options.node.children) ?? false,
    options: TABLE_FORMAT_OPTIONS,
    getAlign(index: number) {
      return resolveTableAlign(align, index)
    },
    getNodes(cell: ParsedNode | TableRowNode | TableCellNode) {
      return getTableCellNodes<ParsedNode>(cell as ParsedNode | { children?: ParsedNode[] })
    },
  }
}

export function getTableContent(format: TableFormat, tableData: TableData): TableContent {
  switch (format) {
    case 'markdown':
      return { content: tableDataToMarkdown(tableData), mimeType: 'text/markdown', extension: 'md' }
    case 'tsv':
      return { content: tableDataToTSV(tableData), mimeType: 'text/tsv', extension: 'tsv' }
    case 'csv':
    default:
      return { content: tableDataToCSV(tableData), mimeType: 'text/csv', extension: 'csv' }
  }
}

export interface TableControlDescriptorOptions {
  copied: boolean
  fullscreen: boolean
  showCopy: boolean
  showDownload: boolean
  showFullscreen: boolean
  options?: SelectOption[]
}

export function createTableControlDescriptors(
  options: TableControlDescriptorOptions,
): ControlDescriptor[] {
  return [
    {
      key: 'copy',
      labelKey: 'button.copy',
      icon: options.copied ? 'check' : 'copy',
      options: options.options,
      visible: options.showCopy,
    },
    {
      key: 'download',
      labelKey: 'button.download',
      icon: 'download',
      options: options.options,
      visible: options.showDownload,
    },
    {
      key: 'fullscreen',
      labelKey: options.fullscreen ? 'button.minimize' : 'button.maximize',
      icon: options.fullscreen ? 'minimize' : 'maximize',
      visible: options.showFullscreen,
    },
  ]
}
