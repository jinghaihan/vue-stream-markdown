<script setup lang="ts">
import type { ParagraphNodeRendererProps } from '../../types'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<ParagraphNodeRendererProps>(), {})
</script>

<template>
  <p data-stream-markdown="paragraph">
    <NodeList v-bind="props" :nodes="node.children" />
  </p>
</template>

<style>
:is(.stream-markdown, .stream-markdown-overlay) [data-stream-markdown='paragraph'] {
  vertical-align: middle;
  transition: height var(--default-transition-duration) ease;
}

:is(.stream-markdown, .stream-markdown-overlay) [data-stream-markdown='paragraph']:not(:last-child) {
  margin-bottom: 1rem;
}
</style>
