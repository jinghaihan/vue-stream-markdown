<script setup lang="ts">
import type { CodeNodeRendererProps } from '../../types'
import { createHtmlPreviewModel, getIframeBodyHeight } from '@stream-markdown/core'
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<CodeNodeRendererProps>(), {})

const iframeRef = ref<HTMLIFrameElement>()
const height = ref<number>(0)
const model = computed(() => createHtmlPreviewModel(props.node))
const code = computed(() => model.value.code)

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
      sandbox="allow-scripts allow-same-origin"
      :frameborder="0"
      @load="updateHeight"
    />
  </div>
</template>
