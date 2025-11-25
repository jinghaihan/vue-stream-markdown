<script setup lang="ts">
import type { NodeRendererListProps, ParsedNode } from '../types'
import { computed } from 'vue'
import Markdown from './markdown.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<NodeRendererListProps>(), {
  nodes: () => [],
})

const nodes = computed(() => props.nodes?.map((node, index) => ({ node, index })))

// exclude nodes that should not be transitioned
const excludeTransition = ['code']

function getNodeComponent(node: ParsedNode) {
  return props.nodeRenderers[node.type] || Markdown
}

function getNodeBindings(node: ParsedNode) {
  return { ...props, node, nodes: undefined }
}

function getNodeIndexKey(index: number) {
  return `${props.indexKey || 'stream-markdown'}-${index}`
}
</script>

<template>
  <template v-for="item in nodes" :key="item.index">
    <Transition
      v-if="!excludeTransition.includes(item.node.type)"
      name="typewriter"
      appear
    >
      <component
        :is="getNodeComponent(item.node)"
        v-bind="getNodeBindings(item.node)"
        :index-key="getNodeIndexKey(item.index)"
      />
    </Transition>

    <component
      :is="getNodeComponent(item.node)"
      v-else
      v-bind="getNodeBindings(item.node)"
      :index-key="getNodeIndexKey(item.index)"
    />
  </template>
</template>

<style>
.stream-markdown .typewriter-enter-from {
  opacity: 0;
}
.stream-markdown .typewriter-enter-active {
  transition: opacity var(--typewriter-transition-duration) ease-out;
  will-change: opacity;
}
.stream-markdown .typewriter-enter-to {
  opacity: 1;
}
</style>
