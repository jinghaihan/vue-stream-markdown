<script setup lang="ts">
import type { Control, ParsedNode, SelectOption, TableCellNode, TableNodeRendererProps, TableRowNode } from '../../types'
import { useClipboard } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useContext, useControls, useI18n } from '../../composables'
import {
  extractTableDataFromElement,
  save,
  tableDataToCSV,
  tableDataToMarkdown,
  tableDataToTSV,
} from '../../utils'
import Button from '../button.vue'
import NodeList from '../node-list.vue'
import Spin from '../spin.vue'
import Table from '../table.vue'

const props = withDefaults(defineProps<TableNodeRendererProps>(), {})

const { t } = useI18n()

const { beforeDownload, onCopied } = useContext()
const { copy, copied } = useClipboard({
  legacy: true,
})

const { isControlEnabled, resolveControls } = useControls({
  controls: props.controls,
})

const showCopy = computed(() => isControlEnabled('table.copy'))
const showDownload = computed(() => isControlEnabled('table.download'))

const tableRef = ref()
const align = computed(() => props.node.align || [])

const headerCells = computed(() => props.node.children?.[0]?.children ?? [])
const bodyRows = computed(() => props.node.children.slice(1))

const loading = computed(() => props.markdownParser.hasLoadingNode(props.node.children))

function getAlign(index: number) {
  return align.value[index] || 'left'
}

function getTableContent(format: 'csv' | 'tsv' | 'markdown'): {
  content: string
  mimeType: string
  extension: string
} | null {
  if (!tableRef.value?.$el)
    return null
  const tableData = extractTableDataFromElement(tableRef.value.$el)
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

const options: SelectOption[] = [
  { label: 'CSV', value: 'csv' },
  { label: 'TSV', value: 'tsv' },
  { label: 'Markdown', value: 'markdown' },
]

const builtinControls = computed((): Control[] => [
  {
    name: t('button.copy'),
    key: 'copy',
    icon: copied.value ? 'check' : 'copy',
    options,
    visible: () => showCopy.value,
    onClick: (_event: MouseEvent, item?: SelectOption) => {
      const format = (item?.value || 'csv') as 'csv' | 'tsv'
      const data = getTableContent(format)
      if (!data)
        return

      copy(data.content)
      onCopied(data.content)
    },
  },
  {
    name: t('button.download'),
    key: 'download',
    icon: 'download',
    options,
    visible: () => showDownload.value,
    onClick: async (_event: MouseEvent, item?: SelectOption) => {
      const format = (item?.value || 'csv') as 'csv' | 'tsv'
      const data = getTableContent(format)
      if (!data)
        return

      const result = await beforeDownload({
        type: 'table',
        content: data.content,
      })
      if (result)
        save(`table.${data.extension}`, data.content, data.mimeType)
    },
  },
])

const controls = computed(
  () => resolveControls<TableNodeRendererProps>('table', builtinControls.value, props),
)

function getNodes(cell: unknown) {
  const children = (cell as TableRowNode | TableCellNode).children
  if (children)
    return children
  return [cell] as ParsedNode[]
}
</script>

<template>
  <div data-stream-markdown="table-wrapper">
    <div data-stream-markdown="table-controls">
      <Button
        v-for="item in controls"
        v-bind="item"
        :key="item.key"
        @click="item.onClick"
      />
    </div>

    <div data-stream-markdown="table-inner-wrapper">
      <Table ref="tableRef" :headers="headerCells" :rows="bodyRows" :get-align="getAlign">
        <template #header-cell="{ cell }">
          <NodeList v-bind="props" :nodes="getNodes(cell)" />
        </template>
        <template #body-cell="{ cell }">
          <NodeList v-bind="props" :nodes="getNodes(cell)" />
        </template>
      </Table>
    </div>

    <Spin v-if="loading" />
  </div>
</template>

<style>
:is(.stream-markdown, .stream-markdown-overlay) {
  & [data-stream-markdown='table-wrapper'] {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 0.5rem;
    margin-block: 1rem;
  }

  & [data-stream-markdown='table-controls'] {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 0.25rem;
  }

  & [data-stream-markdown='table-inner-wrapper'] {
    width: 100%;
    overflow-x: auto;
  }
}
</style>
