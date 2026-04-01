<script setup lang="ts">
import type { StrongNodeRendererProps } from '../../types'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<StrongNodeRendererProps>(), {})
</script>

<template>
  <strong
    data-stream-markdown="strong"
    class="font-semibold"
  >
    <NodeList v-bind="props" :parent-node="node" :nodes="node.children" :deep="deep + 1" />
  </strong>
</template>
