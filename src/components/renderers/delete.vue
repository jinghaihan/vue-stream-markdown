<script setup lang="ts">
import type { DeleteNodeRendererProps } from '../../types'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<DeleteNodeRendererProps>(), {})
</script>

<template>
  <del data-stream-markdown="delete">
    <NodeList v-bind="props" :nodes="node.children" />
  </del>
</template>

<style>
.stream-markdown [data-stream-markdown='delete'] {
  text-decoration: line-through;
}
</style>
