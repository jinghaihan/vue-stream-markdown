<script setup lang="ts">
import type { ListNodeRendererProps } from '../../types'
import { computed } from 'vue'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<ListNodeRendererProps>(), {})

const isTaskList = computed(() => props.node.children.some(child => typeof child.checked === 'boolean'))

const tag = computed(() => props.node.ordered ? 'ol' : 'ul')
const id = computed(() => isTaskList.value
  ? 'task-list'
  : props.node.ordered ? 'ordered-list' : 'unordered-list')
</script>

<template>
  <component :is="tag" :data-stream-markdown="id">
    <NodeList v-bind="props" :nodes="node.children" />
  </component>
</template>

<style>
.stream-markdown [data-stream-markdown='ordered-list'],
.stream-markdown [data-stream-markdown='unordered-list'],
.stream-markdown [data-stream-markdown='task-list'] {
  padding-left: 1.25rem;
  white-space: normal;
}

.stream-markdown [data-stream-markdown='ordered-list'] {
  list-style-type: decimal;
}

.stream-markdown [data-stream-markdown='unordered-list'],
.stream-markdown [data-stream-markdown='task-list'] {
  list-style-type: disc;
}
</style>
