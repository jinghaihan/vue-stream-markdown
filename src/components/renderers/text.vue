<script setup lang="ts">
import type { TextNodeRendererProps } from '../../types'
import { computed } from 'vue'
import { useContext } from '../../composables'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TextNodeRendererProps>(), {})

const { caret, enableAnimate } = useContext()

const loading = computed(() => props.node.loading)
</script>

<template>
  <span data-stream-markdown="text">
    {{ node.value }}
    <span v-if="enableAnimate && loading" data-stream-markdown="caret">{{ caret }}</span>
  </span>
</template>

<style>
:where(.stream-markdown, .stream-markdown-overlay) {
  & [data-stream-markdown='text'] {
    white-space: pre-wrap;
    overflow-wrap: break-word;
  }
}
</style>
