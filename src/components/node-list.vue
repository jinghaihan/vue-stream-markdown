<script setup lang="ts">
import type { NodeRendererListProps, NodeType, ParsedNode } from '../types'
import { computed } from 'vue'
import Markdown from './markdown.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<NodeRendererListProps>(), {
  nodes: () => [],
})

const nodes = computed(() => props.nodes?.map((node, index) => ({
  node,
  index,
  key: getNodeIndexKey(node, index),
})))

// exclude nodes that should not be transitioned
const excludeTransition: NodeType[] = ['code']

function getNodeComponent(node: ParsedNode) {
  return props.nodeRenderers[node.type] || Markdown
}

function getNodeBindings(node: ParsedNode) {
  return { ...props, node, nodes: undefined }
}

function getNodeIndexKey(node: ParsedNode, index: number) {
  const indexKey = `${props.indexKey || 'stream-markdown'}`

  if (node.type === 'footnoteReference' || node.type === 'footnoteDefinition')
    return `${indexKey}-${node.identifier}`

  return `${indexKey}-${index}`
}
</script>

<template>
  <template v-for="item in nodes" :key="item.key">
    <Transition
      v-if="!excludeTransition.includes(item.node.type)"
      name="typewriter"
      appear
    >
      <component
        :is="getNodeComponent(item.node)"
        v-bind="getNodeBindings(item.node)"
        :index-key="item.key"
      />
    </Transition>

    <component
      :is="getNodeComponent(item.node)"
      v-else
      v-bind="getNodeBindings(item.node)"
      :index-key="item.key"
    />
  </template>
</template>
