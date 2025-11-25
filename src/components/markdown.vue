<script setup lang="ts">
import type { NodeRendererProps } from '../types'
import { computed } from 'vue'

const props = withDefaults(defineProps<NodeRendererProps>(), {})

const html = computed(() => {
  const content = props.markdownParser.astToMarkdown(props.node)
  return props.markdownParser.markdownToHtml(content)
})
</script>

<template>
  <span v-html="html" />
</template>
