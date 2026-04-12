<script setup lang="ts">
import type { TableFormat } from '@stream-markdown/shared'
import type { Control, ParsedNode, SelectOption, TableCellNode, TableNodeRendererProps, TableRowNode } from '../../types'
import {
  extractTableDataFromElement,
  save,
  tableDataToCSV,
  tableDataToMarkdown,
  tableDataToTSV,
} from '@stream-markdown/shared'
import { useClipboard } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useContext, useControls, useI18n } from '../../composables'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<TableNodeRendererProps>(), {})

const {
  beforeDownload,
  controls: controlsConfig,
  onCopied,
  uiComponents: UI,
} = useContext()

const { t } = useI18n()

const { copy, copied } = useClipboard({
  legacy: true,
})

const { isControlEnabled, resolveControls } = useControls({
  controls: controlsConfig,
})

const showCopy = computed(() => isControlEnabled('table.copy'))
const showDownload = computed(() => isControlEnabled('table.download'))
const showFullscreen = computed(() => isControlEnabled('table.fullscreen'))

const tableRef = ref<{ $el?: HTMLElement }>()
const fullscreenTableRef = ref<{ $el?: HTMLElement }>()
const fullscreen = ref(false)
const align = computed(() => props.node.align || [])

const headerCells = computed(() => props.node.children?.[0]?.children ?? [])
const bodyRows = computed(() => props.node.children.slice(1))

const loading = computed(() => props.markdownParser.hasLoadingNode(props.node.children))

function getAlign(index: number) {
  return align.value[index] || 'left'
}

function getTableElement() {
  const currentTable = fullscreen.value ? fullscreenTableRef.value : tableRef.value
  return currentTable?.$el ?? tableRef.value?.$el ?? fullscreenTableRef.value?.$el
}

function getTableContent(format: TableFormat): {
  content: string
  mimeType: string
  extension: string
} | null {
  const tableElement = getTableElement()
  if (!tableElement)
    return null
  const tableData = extractTableDataFromElement(tableElement)
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
      const format = (item?.value || 'csv') as TableFormat
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
      const format = (item?.value || 'csv') as TableFormat
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
  {
    name: fullscreen.value ? t('button.minimize') : t('button.maximize'),
    key: 'fullscreen',
    icon: fullscreen.value ? 'minimize' : 'maximize',
    visible: () => showFullscreen.value,
    onClick: () => fullscreen.value = !fullscreen.value,
  },
])

const controls = computed(
  () => resolveControls<TableNodeRendererProps>('table', builtinControls.value, props),
)

const hasControls = computed(() => controls.value.length > 0)

function getNodes(cell: unknown) {
  const children = (cell as TableRowNode | TableCellNode).children
  if (children)
    return children
  return [cell] as ParsedNode[]
}
</script>

<template>
  <div
    data-stream-markdown="table-wrapper"
    class="my-4 flex flex-col gap-2"
    :class="hasControls && 'p-2 border border-border rounded-lg bg-muted/20'"
  >
    <div
      v-if="hasControls"
      data-stream-markdown="table-controls"
      class="flex gap-1 w-full items-center justify-end"
    >
      <component
        :is="UI.Button"
        v-for="item in controls"
        v-bind="item"
        :key="item.key"
        @click="item.onClick"
      />
    </div>

    <div
      data-stream-markdown="table-inner-wrapper"
      class="w-full overflow-x-auto"
    >
      <component :is="UI.Table" ref="tableRef" :headers="headerCells" :rows="bodyRows" :get-align="getAlign">
        <template #header-cell="{ cell }">
          <NodeList v-bind="props" :parent-node="node" :nodes="getNodes(cell)" :deep="deep + 1" />
        </template>
        <template #body-cell="{ cell }">
          <NodeList v-bind="props" :parent-node="node" :nodes="getNodes(cell)" :deep="deep + 1" />
        </template>
      </component>
    </div>

    <component :is="UI.Spin" v-if="loading" />

    <component
      :is="UI.Modal"
      v-model:open="fullscreen"
      :header-style="{
        backgroundColor: 'color-mix(in oklab, var(--muted) 80%, transparent)',
        color: 'var(--muted-foreground)',
        borderBottom: '1px solid var(--border)',
      }"
    >
      <template #title>
        <div />
      </template>

      <template #actions>
        <div
          data-stream-markdown="table-controls"
          class="flex gap-1 items-center"
        >
          <component
            :is="UI.Button"
            v-for="item in controls"
            v-bind="item"
            :key="item.key"
            @click="item.onClick"
          />
        </div>
      </template>

      <div
        data-stream-markdown="table-fullscreen"
        class="p-4 h-full overflow-auto [&_thead]:top-0 [&_thead]:sticky [&_thead]:z-10"
        @click.self="fullscreen = false"
      >
        <component :is="UI.Table" ref="fullscreenTableRef" :headers="headerCells" :rows="bodyRows" :get-align="getAlign">
          <template #header-cell="{ cell }">
            <NodeList v-bind="props" :parent-node="node" :nodes="getNodes(cell)" :deep="deep + 1" />
          </template>
          <template #body-cell="{ cell }">
            <NodeList v-bind="props" :parent-node="node" :nodes="getNodes(cell)" :deep="deep + 1" />
          </template>
        </component>
      </div>
    </component>
  </div>
</template>
