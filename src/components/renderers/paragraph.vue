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
:is(.stream-markdown, .stream-markdown-overlay) {
  & [data-stream-markdown='paragraph'] {
    margin-bottom: 1rem;
    vertical-align: middle;
    transition: height var(--default-transition-duration) ease;
  }
}
</style>
