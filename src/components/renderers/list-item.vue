<script setup lang="ts">
import type { ListItemNodeRendererProps } from '../../types'
import { computed } from 'vue'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<ListItemNodeRendererProps>(), {})

const isTaskListItem = computed(() => typeof props.node.checked === 'boolean')
const checked = computed(() => !!props.node.checked)
</script>

<template>
  <li data-stream-markdown="list-item">
    <p v-if="isTaskListItem" data-stream-markdown="task-list-item">
      <input
        data-stream-markdown="task-list-item-checkbox"
        type="checkbox"
        :checked="checked"
        disabled
      >
      <NodeList v-bind="props" :nodes="node.children" />
    </p>

    <NodeList v-else v-bind="props" :nodes="node.children" />
  </li>
</template>

<style>
:is(.stream-markdown, .stream-markdown-overlay) {
  & [data-stream-markdown='list-item'] {
    padding-block: 0.25rem;
    padding-left: 0.25rem;

    & p {
      margin: 0;
    }
  }

  & [data-stream-markdown='task-list-item'] {
    & p {
      display: inline-block;
    }
  }

  & [data-stream-markdown='task-list-item-checkbox'] {
    margin-right: 0.5rem;
    vertical-align: middle;
  }
}
</style>
