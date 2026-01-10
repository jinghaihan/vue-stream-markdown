<script setup lang="ts">
import type { BlockquoteNodeRendererProps } from '../../types'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<BlockquoteNodeRendererProps>(), {})
</script>

<template>
  <blockquote data-stream-markdown="blockquote">
    <NodeList v-bind="props" :nodes="node.children" />
  </blockquote>
</template>

<style>
:is(.stream-markdown, .stream-markdown-overlay) {
  & [data-stream-markdown='blockquote'] {
    position: relative;
    margin-inline: 0;
    margin-block: 1rem;
    padding-left: 1rem;
    border-left: 4px solid color-mix(in oklab, var(--muted-foreground) 30%, transparent);
    font-style: italic;
    color: var(--muted-foreground);

    & p {
      margin-bottom: 0;
    }
  }
}
</style>
