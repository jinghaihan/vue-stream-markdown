<script setup lang="ts">
import type { StrongNodeRendererProps } from '../../types'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<StrongNodeRendererProps>(), {})
</script>

<template>
  <strong data-stream-markdown="strong">
    <NodeList v-bind="props" :nodes="node.children" />
  </strong>
</template>

<style>
:is(.stream-markdown, .stream-markdown-overlay) {
  & [data-stream-markdown='strong'] {
    font-weight: 600;
  }
}
</style>
