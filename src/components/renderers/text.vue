<script setup lang="ts">
import type { TextNodeRendererProps } from '../../types'
import { computed } from 'vue'
import Caret from '../caret.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TextNodeRendererProps>(), {})

const loading = computed(() => props.node.loading)
</script>

<template>
  <span
    data-stream-markdown="text"
    class="whitespace-pre-wrap break-words"
  >
    {{ node.value }}
    <Caret v-if=" loading" />
  </span>
</template>
