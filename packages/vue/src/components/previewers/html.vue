<script setup lang="ts">
import type { CodeNodeRendererProps } from '../../types'
import { createHtmlPreviewModel, getIframeBodyHeight, resolveHtmlPreviewSandbox } from '@stream-markdown/core'
import { computed, ref } from 'vue'
import { useContext } from '../../composables'

const props = withDefaults(defineProps<CodeNodeRendererProps>(), {})
const { previewers } = useContext()

const iframeRef = ref<HTMLIFrameElement>()
const height = ref<number>(0)
const model = computed(() => createHtmlPreviewModel(props.node))
const code = computed(() => model.value.code)
const sandbox = computed(() => resolveHtmlPreviewSandbox(previewers.value))

function updateHeight() {
  height.value = getIframeBodyHeight(iframeRef.value)
}
</script>

<template>
  <div
    class="html-previewer"
    :style="{ height: `${height}px` }"
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
