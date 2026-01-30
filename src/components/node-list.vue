<script setup lang="ts">
import type { NodeRendererListProps, NodeType, ParsedNode } from '../types'
import { computed } from 'vue'
import { useContext } from '../composables'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<NodeRendererListProps>(), {
  nodes: () => [],
  parsedNodes: () => [],
  blocks: () => [],
  blockIndex: 0,
})

const { enableAnimate } = useContext()

const prevBlock = computed(() => {
  const find = (index: number) => {
    const data = props.blocks?.[index]
    if (data && !data.children.length)
      return find(index - 1)
    return data
  }
  return find(props.blockIndex - 1)
})
const nextBlock = computed(() => {
  const find = (index: number) => {
    const data = props.blocks?.[index]
    if (data && !data.children.length)
      return find(index + 1)
    return data
  }
  return find(props.blockIndex + 1)
})

const nodes = computed(() => props.nodes.map((node, index) => ({
  node,
  index,
  key: getNodeKey(node, index),
})))

// exclude nodes that should not be transitioned
const excludeTransition: NodeType[] = ['code']

function getNodeComponent(node: ParsedNode) {
  return props.nodeRenderers[node.type] || null
}

function getNodeBindings(node: ParsedNode, index: number) {
  const prevNode = props.nodes[index - 1] || prevBlock.value?.children[prevBlock.value.children.length - 1]
  const nextNode = props.nodes[index + 1] || nextBlock.value?.children[0]

  return {
    ...props,
    node,
    parentNode: props.parentNode,
    prevNode,
    nextNode,
    nodes: undefined,
  }
}

function getNodeKey(node: ParsedNode, index: number) {
  const nodeKey = `${props.nodeKey || 'stream-markdown'}-${node.type}`
  if (node.type === 'footnoteReference' || node.type === 'footnoteDefinition')
    return `${nodeKey}-${node.identifier}`
  return `${nodeKey}-${index}`
}
</script>

<template>
  <template v-for="(item, index) in nodes" :key="item.key">
    <Transition
      v-if="enableAnimate && !excludeTransition.includes(item.node.type)"
      name="stream-markdown-typewriter"
      appear
    >
      <component
        :is="getNodeComponent(item.node)"
        v-bind="getNodeBindings(item.node, index)"
        :node-key="item.key"
      />
    </Transition>

    <component
      :is="getNodeComponent(item.node)"
      v-else
      v-bind="getNodeBindings(item.node, index)"
      :node-key="item.key"
    />
  </template>
</template>
