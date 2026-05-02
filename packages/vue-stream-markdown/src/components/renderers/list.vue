<script setup lang="ts">
import type { ListNodeRendererProps } from '../../types'
import { createListModel } from '@stream-markdown/core'
import { computed } from 'vue'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<ListNodeRendererProps>(), {})

const model = computed(() => createListModel(props.node))
const tag = computed(() => model.value.tag)
const id = computed(() => model.value.id)
</script>

<template>
  <component
    :is="tag" :data-stream-markdown="id"
    class="leading-6 pl-5 whitespace-normal"
    :class="{
      'list-decimal': id === 'ordered-list',
      'list-disc': id !== 'ordered-list',
    }"
  >
    <NodeList v-bind="props" :parent-node="node" :nodes="node.children" :deep="deep + 1" />
  </component>
</template>
