<script setup lang="ts">
import type { CodeNodeRendererProps } from '../../types'
import {
  clampHtmlPreviewHeight,
  createHtmlPreviewModel,
  createHtmlPreviewSrcdoc,
  getHtmlPreviewMessageHeight,
  getIframeBodyHeight,
  resolveHtmlPreviewAutoHeight,
  resolveHtmlPreviewHeight,
  resolveHtmlPreviewMaxHeight,
  resolveHtmlPreviewMaxHeightValue,
  resolveHtmlPreviewMeasurementMode,
  resolveHtmlPreviewSandbox,
} from '@stream-markdown/core'
import { useEventListener, useResizeObserver } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useContext } from '../../composables'

const props = withDefaults(defineProps<CodeNodeRendererProps>(), {})
const { previewers } = useContext()

const iframeRef = ref<HTMLIFrameElement>()
const iframeDocumentElement = ref<HTMLElement>()
const iframeBody = ref<HTMLElement>()
const measuredHeight = ref<number>()
const model = computed(() => createHtmlPreviewModel(props.node))
const sandbox = computed(() => resolveHtmlPreviewSandbox(previewers.value))
const autoHeight = computed(() => resolveHtmlPreviewAutoHeight(previewers.value))
const fallbackHeight = computed(() => resolveHtmlPreviewHeight(previewers.value))
const maxHeight = computed(() => resolveHtmlPreviewMaxHeight(previewers.value))
const maxHeightValue = computed(() => resolveHtmlPreviewMaxHeightValue(previewers.value))
const measurementMode = computed(() => resolveHtmlPreviewMeasurementMode(sandbox.value, autoHeight.value))
const code = computed(() => {
  if (measurementMode.value === 'message')
    return createHtmlPreviewSrcdoc(model.value.code)
  return model.value.code
})

const height = computed(() => measuredHeight.value === undefined ? fallbackHeight.value : `${measuredHeight.value}px`)

function updateMeasuredHeight(nextHeight: number | undefined) {
  if (nextHeight === undefined || nextHeight <= 0)
    return

  const height = clampHtmlPreviewHeight(nextHeight, maxHeightValue.value)
  if (height === measuredHeight.value)
    return

  measuredHeight.value = height
}

function updateHeight() {
  iframeDocumentElement.value = undefined
  iframeBody.value = undefined

  if (measurementMode.value !== 'dom')
    return

  updateMeasuredHeight(getIframeBodyHeight(iframeRef.value, 0))

  let doc: Document | null | undefined
  try {
    doc = iframeRef.value?.contentDocument
  }
  catch {
    return
  }

  if (!doc)
    return

  iframeDocumentElement.value = doc.documentElement
  iframeBody.value = doc.body
}

function handleMessage(event: MessageEvent) {
  if (measurementMode.value !== 'message' || event.source !== iframeRef.value?.contentWindow)
    return

  updateMeasuredHeight(getHtmlPreviewMessageHeight(event.data, 0, maxHeightValue.value))
}

watch(measurementMode, () => {
  measuredHeight.value = undefined
  iframeDocumentElement.value = undefined
  iframeBody.value = undefined
})

useEventListener(
  typeof window === 'undefined' ? undefined : window,
  'message',
  handleMessage,
)

useResizeObserver(
  iframeDocumentElement,
  () => {
    updateMeasuredHeight(getIframeBodyHeight(iframeRef.value, 0))
  },
)

useResizeObserver(
  iframeBody,
  () => {
    updateMeasuredHeight(getIframeBodyHeight(iframeRef.value, 0))
  },
)
</script>

<template>
  <div
    class="html-previewer"
    :style="{ height, maxHeight }"
  >
    <iframe
      ref="iframeRef"
      data-stream-markdown="html-previewer"
      class="size-full"
      :srcdoc="code"
      :sandbox="sandbox"
      :frameborder="0"
      @load="updateHeight"
    />
  </div>
</template>
