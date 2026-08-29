<script setup lang="ts">
import type { TableFormat } from '@stream-markdown/core'
import type { ElementNode } from 'comark'
import type { Control, SelectOption } from '../../types'
import {
  createTableControlDescriptors,
  extractTableDataFromElement,
  getDownloadFilename,
  getTableContent,
  getTableCsvSeparator,
  handleTableControlAction,
  resolveScrollableMaxHeight,
  save,
} from '@stream-markdown/core'
import { useClipboard, useClipboardItems } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useContext, useControls, useI18n, usePinnedScroll } from '../../composables'

const props = defineProps<{
  loading?: boolean
  node: ElementNode
  nodeKey: string
}>()

const {
  beforeDownload,
  controls: controlsConfig,
  onCopied,
  tableOptions,
  uiComponents: UI,
} = useContext()
const { t } = useI18n()
const { copy: copyText, copied: textCopied } = useClipboard({ legacy: true })
const {
  copy: copyItems,
  copied: itemsCopied,
  isSupported: isClipboardItemsSupported,
} = useClipboardItems()
const copied = computed(() => textCopied.value || itemsCopied.value)
const { isControlEnabled, resolveControls } = useControls({ controls: controlsConfig })

const tableScrollRef = ref<HTMLElement>()
const fullscreenScrollRef = ref<HTMLElement>()
const fullscreen = ref(false)
const modalMounted = ref(false)
const maxHeight = computed(() => resolveScrollableMaxHeight(tableOptions.value?.maxHeight))
const scrollTarget = computed(() => fullscreen.value ? fullscreenScrollRef.value : tableScrollRef.value)

usePinnedScroll({
  target: scrollTarget,
  active: () => props.loading,
  enabled: () => fullscreen.value || !!maxHeight.value,
  contentKey: () => props.node,
})

function getTableElement(): HTMLTableElement | null {
  const root = fullscreen.value ? fullscreenScrollRef.value : tableScrollRef.value
  return root?.querySelector('table') ?? tableScrollRef.value?.querySelector('table') ?? null
}

function serializeTable(format: TableFormat) {
  const table = getTableElement()
  if (!table)
    return null
  return getTableContent(format, extractTableDataFromElement(table), getTableCsvSeparator(controlsConfig.value))
}

async function copyTableContent(content: string) {
  const table = getTableElement()
  if (!table || !isClipboardItemsSupported.value || typeof ClipboardItem === 'undefined') {
    await copyText(content)
    return
  }

  try {
    await copyItems([new ClipboardItem({
      'text/plain': new Blob([content], { type: 'text/plain' }),
      'text/html': new Blob([table.outerHTML], { type: 'text/html' }),
    })])
  }
  catch {
    await copyText(content)
  }
}

const descriptors = computed(() => createTableControlDescriptors({
  copied: copied.value,
  fullscreen: fullscreen.value,
  showCopy: isControlEnabled('table.copy'),
  showDownload: isControlEnabled('table.download'),
  showFullscreen: isControlEnabled('table.fullscreen'),
  options: [
    { label: 'CSV', value: 'csv' },
    { label: 'TSV', value: 'tsv' },
    { label: 'Markdown', value: 'markdown' },
  ],
}))

const builtinControls = computed((): Control[] => descriptors.value.map(item => ({
  ...item,
  name: t(item.labelKey ?? ''),
  announcement: item.key === 'copy' && copied.value ? t('button.copied') : undefined,
  onClick: (_event: MouseEvent, select?: SelectOption) => handleControlClick(item.key, select),
  visible: () => item.visible ?? true,
})))

const controls = computed(() => resolveControls('table', builtinControls.value, props))
const modalLabel = computed(() => t('dialog.fullscreen', 'button.maximize'))

async function handleControlClick(key: string, item?: SelectOption) {
  const state = await handleTableControlAction({
    key,
    select: item,
    filename: getDownloadFilename(controlsConfig.value, 'table', 'table'),
    state: { fullscreen: fullscreen.value },
    getContent: serializeTable,
    beforeDownload,
    copyContent: copyTableContent,
    onCopied,
    saveFile: save,
  })

  if (state.fullscreen)
    modalMounted.value = true
  fullscreen.value = state.fullscreen
}
</script>

<template>
  <div data-stream-markdown="table-wrapper" class="my-4 flex flex-col gap-2 items-center">
    <div v-if="controls.length" data-stream-markdown="table-controls" class="flex gap-1 w-full items-center justify-end">
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
      <slot />
    </div>

    <div v-if="loading" class="flex justify-center">
      <component :is="UI.Spin" />
    </div>

    <component
      :is="UI.Modal"
      v-if="modalMounted"
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
        <div data-stream-markdown="table-controls" class="flex gap-1 items-center">
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
        <slot />
      </div>
    </component>
  </div>
</template>
