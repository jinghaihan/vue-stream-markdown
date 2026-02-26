<script setup lang="ts">
import type { ListItemNodeRendererProps } from '../../types'
import { computed } from 'vue'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<ListItemNodeRendererProps>(), {})

const isTaskListItem = computed(() => typeof props.node.checked === 'boolean')
const checked = computed(() => !!props.node.checked)
</script>

<template>
  <li
    data-stream-markdown="list-item"
    class="py-1 pl-1 [&_p]:m-0"
  >
    <p
      v-if="isTaskListItem" data-stream-markdown="task-list-item"
      class="[&_p]:inline-block"
    >
      <input
        data-stream-markdown="task-list-item-checkbox"
        class="mr-2 align-middle"
        type="checkbox"
        :checked="checked"
        disabled
      >
      <NodeList v-bind="props" :parent-node="node" :nodes="node.children" :deep="deep + 1" />
    </p>

    <NodeList v-else v-bind="props" :parent-node="node" :nodes="node.children" :deep="deep + 1" />
  </li>
</template>
