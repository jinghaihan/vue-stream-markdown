<script setup lang="ts">
import type { DeleteNodeRendererProps } from '../../types'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<DeleteNodeRendererProps>(), {})
</script>

<template>
  <del
    data-stream-markdown="delete"
    class="line-through"
  >
    <NodeList v-bind="props" :parent-node="node" :nodes="node.children" :deep="deep + 1" />
  </del>
</template>
