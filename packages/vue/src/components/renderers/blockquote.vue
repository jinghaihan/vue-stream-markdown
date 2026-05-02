<script setup lang="ts">
import type { BlockquoteNodeRendererProps } from '../../types'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<BlockquoteNodeRendererProps>(), {})
</script>

<template>
  <blockquote
    data-stream-markdown="blockquote"
    class="text-muted-foreground mx-0 my-4 pl-4 border-l-4 border-l-muted-foreground/30 italic relative [&_p]:mb-0"
  >
    <NodeList v-bind="props" :parent-node="node" :nodes="node.children" :deep="deep + 1" />
  </blockquote>
</template>
