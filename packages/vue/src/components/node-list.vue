<script setup lang="ts">
import type { NodeListProps } from '../types'
import MarkdownNodes from './renderers/markdown'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NodeListProps>(), {
  nodes: () => [],
  nodeKey: 'root',
  loading: false,
  hideCaret: false,
})
</script>

<template>
  <MarkdownNodes v-bind="props" />
</template>
