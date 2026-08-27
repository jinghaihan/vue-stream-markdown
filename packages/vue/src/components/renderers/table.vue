<script setup lang="ts">
import type { TableFormat } from '@stream-markdown/core'
import type { Control, ParsedNode, SelectOption, TableNodeRendererProps } from '../../types'
import {
  createTableControlDescriptors,
  createTableModel,
  extractTableDataFromElement,
  getDownloadFilename,
  getTableContent as getSerializedTableContent,
  getTableCsvSeparator,
  handleTableControlAction,
  resolveNodeTextDirection,
  resolveScrollableMaxHeight,
  save,
} from '@stream-markdown/core'
import { useClipboard, useClipboardItems } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useContext, useControls, useI18n, usePinnedScroll } from '../../composables'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<TableNodeRendererProps>(), {})

const {
  beforeDownload,
  controls: controlsConfig,
  onCopied,
  tableOptions,
  dir,
  uiComponents: UI,
} = useContext()

const { t } = useI18n()

const { copy: copyText, copied: textCopied } = useClipboard({
  legacy: true,
})

const {
  copy: copyItems,
  copied: itemsCopied,
  isSupported: isClipboardItemsSupported,
} = useClipboardItems()

const copied = computed(() => textCopied.value || itemsCopied.value)

const { isControlEnabled, resolveControls } = useControls({
  controls: controlsConfig,
})

const showCopy = computed(() => isControlEnabled('table.copy'))
const showDownload = computed(() => isControlEnabled('table.download'))
const showFullscreen = computed(() => isControlEnabled('table.fullscreen'))

const tableRef = ref<{ $el?: HTMLElement }>()
const fullscreenTableRef = ref<{ $el?: HTMLElement }>()
const tableScrollRef = ref<HTMLElement>()
const fullscreenScrollRef = ref<HTMLElement>()
const fullscreen = ref(false)

const tableModel = computed(() => createTableModel({
  node: props.node,
  hasLoadingNode: nodes => props.markdownParser.hasLoadingNode(nodes),
}))

const headerCells = computed(() => tableModel.value.headerCells)
const bodyRows = computed(() => tableModel.value.bodyRows)
const loading = computed(() => tableModel.value.loading)
const options = computed(() => tableModel.value.options)
const downloadFilename = computed(() => getDownloadFilename(controlsConfig.value, 'table', 'table'))
const csvSeparator = computed(() => getTableCsvSeparator(controlsConfig.value))
const maxHeight = computed(() => resolveScrollableMaxHeight(tableOptions.value?.maxHeight))
const scrollTarget = computed(() => fullscreen.value ? fullscreenScrollRef.value : tableScrollRef.value)

usePinnedScroll({
  target: scrollTarget,
  active: loading,
  enabled: () => fullscreen.value || !!maxHeight.value,
  contentKey: () => props.node,
})

function getAlign(index: number) {
  return tableModel.value.getAlign(index)
}

function getDirection(cell: unknown) {
  return resolveNodeTextDirection(cell as ParsedNode, dir.value)
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
  return getSerializedTableContent(format, tableData, csvSeparator.value)
}

async function copyTableContent(content: string) {
  const tableElement = getTableElement()

  if (!tableElement || !isClipboardItemsSupported.value || typeof ClipboardItem === 'undefined') {
    await copyText(content)
    return
  }

  try {
    await copyItems([
      new ClipboardItem({
        'text/plain': new Blob([content], { type: 'text/plain' }),
        'text/html': new Blob([tableElement.outerHTML], { type: 'text/html' }),
      }),
    ])
  }
  catch {
    await copyText(content)
  }
}

const builtinControls = computed((): Control[] => createTableControlDescriptors({
  copied: copied.value,
  fullscreen: fullscreen.value,
  showCopy: showCopy.value,
  showDownload: showDownload.value,
  showFullscreen: showFullscreen.value,
  options: options.value,
}).map(item => ({
  ...item,
  name: t(item.labelKey ?? ''),
  announcement: item.key === 'copy' && copied.value ? t('button.copied') : undefined,
  onClick: (_event: MouseEvent, select?: SelectOption) => handleControlClick(item.key, select),
  visible: () => item.visible ?? true,
})))

const controls = computed(
  () => resolveControls<TableNodeRendererProps>('table', builtinControls.value, props),
)

const hasControls = computed(() => controls.value.length > 0)
const modalLabel = computed(() => t('dialog.fullscreen', 'button.maximize'))

function getNodes(cell: unknown) {
  return tableModel.value.getNodes(cell as ParsedNode)
}

async function handleControlClick(key: string, item?: SelectOption) {
  const state = await handleTableControlAction({
    key,
    select: item,
    filename: downloadFilename.value,
    state: {
      fullscreen: fullscreen.value,
    },
    getContent: getTableContent,
    beforeDownload,
    copyContent: copyTableContent,
    onCopied,
    saveFile: save,
  })

  fullscreen.value = state.fullscreen
}
</script>

<template>
  <div
    data-stream-markdown="table-wrapper"
    class="my-4 flex flex-col gap-2 items-center"
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
      ref="tableScrollRef"
      data-stream-markdown="table-inner-wrapper"
      class="w-full overflow-x-auto overflow-y-auto"
      :style="{ maxHeight }"
    >
      <component :is="UI.Table" ref="tableRef" :headers="headerCells" :rows="bodyRows" :get-align="getAlign" :get-direction="getDirection">
        <template #header-cell="{ cell }">
          <NodeList v-bind="props" :parent-node="node" :nodes="getNodes(cell)" :deep="deep + 1" hide-caret />
        </template>
        <template #body-cell="{ cell }">
          <NodeList v-bind="props" :parent-node="node" :nodes="getNodes(cell)" :deep="deep + 1" hide-caret />
        </template>
      </component>
    </div>

    <div
      v-if="loading"
      class="flex justify-center"
    >
      <component :is="UI.Spin" />
    </div>

    <component
      :is="UI.Modal"
      v-model:open="fullscreen"
      :aria-label="modalLabel"
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
        ref="fullscreenScrollRef"
        data-stream-markdown="table-fullscreen"
        class="p-4 h-full overflow-auto [&_thead]:top-0 [&_thead]:sticky [&_thead]:z-10"
        @click.self="fullscreen = false"
      >
        <component :is="UI.Table" ref="fullscreenTableRef" :headers="headerCells" :rows="bodyRows" :get-align="getAlign" :get-direction="getDirection">
          <template #header-cell="{ cell }">
            <NodeList v-bind="props" :parent-node="node" :nodes="getNodes(cell)" :deep="deep + 1" hide-caret />
          </template>
          <template #body-cell="{ cell }">
            <NodeList v-bind="props" :parent-node="node" :nodes="getNodes(cell)" :deep="deep + 1" hide-caret />
          </template>
        </component>
      </div>
    </component>
  </div>
</template>
