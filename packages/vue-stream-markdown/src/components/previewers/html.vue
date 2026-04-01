<script setup lang="ts">
import type { CodeNodeRendererProps } from '../../types'
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<CodeNodeRendererProps>(), {})

const iframeRef = ref<HTMLIFrameElement>()
const height = ref<number>(0)
const code = computed(() => props.node.value.trim())

function updateHeight() {
  const doc = iframeRef.value?.contentDocument
  if (!doc)
    return
  height.value = doc.body.scrollHeight + 16
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
