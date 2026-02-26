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
const listClass = computed(() => {
  const shared = 'pl-5 leading-6 whitespace-normal'
  if (id.value === 'ordered-list')
    return `${shared} list-decimal`
  return `${shared} list-disc`
})
</script>

<template>
  <component
    :is="tag" :data-stream-markdown="id"
    :class="listClass"
  >
    <NodeList v-bind="props" :parent-node="node" :nodes="node.children" :deep="deep + 1" />
  </component>
</template>
