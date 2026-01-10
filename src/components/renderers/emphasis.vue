<script setup lang="ts">
import type { EmphasisNodeRendererProps } from '../../types'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<EmphasisNodeRendererProps>(), {})
</script>

<template>
  <em data-stream-markdown="emphasis">
    <NodeList v-bind="props" :nodes="node.children" />
  </em>
</template>

<style>
:is(.stream-markdown, .stream-markdown-overlay) {
  & [data-stream-markdown='emphasis'] {
    font-style: italic;
  }
}
</style>
