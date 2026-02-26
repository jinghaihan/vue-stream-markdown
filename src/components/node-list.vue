<script setup lang="ts">
import type { NodeRendererListProps, NodeType, ParsedNode } from '../types'
import { computed } from 'vue'
import { useContext } from '../composables'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<NodeRendererListProps>(), {
  nodes: () => [],
  blockIndex: 0,
})

const {
  enableAnimate,
  blocks,
  nodeRenderers: contextNodeRenderers,
  markdownParser: contextMarkdownParser,
} = useContext()

const activeNodeRenderers = computed(() => {
  if (props.nodeRenderers)
    return props.nodeRenderers
  return contextNodeRenderers.value
})

const activeMarkdownParser = computed(() => props.markdownParser ?? contextMarkdownParser)

const prevBlock = computed(() => {
  const find = (index: number) => {
    const data = blocks.value[index]
    if (data && !data.children.length)
      return find(index - 1)
    return data
  }
  return find(props.blockIndex - 1)
})

const nextBlock = computed(() => {
  const find = (index: number) => {
    const data = blocks.value[index]
    if (data && !data.children.length)
      return find(index + 1)
    return data
  }
  return find(props.blockIndex + 1)
})

const items = computed(() => props.nodes.map((node, index) => ({
  node,
  index,
  key: getNodeKey(node, index),
  component: getNodeComponent(node),
  prevNode: getPrevNode(index),
  nextNode: getNextNode(index),
})))

// exclude nodes that should not be transitioned
const excludeTransition: NodeType[] = ['code']

function getNodeComponent(node: ParsedNode) {
  return activeNodeRenderers.value[node.type] || null
}

function getPrevNode(index: number) {
  const current = props.nodes[index - 1]
  if (current)
    return current
  if (props.deep > 0)
    return undefined
  return prevBlock.value?.children[prevBlock.value.children.length - 1]
}

function getNextNode(index: number) {
  const current = props.nodes[index + 1]
  if (current)
    return current
  if (props.deep > 0)
    return undefined
  return nextBlock.value?.children[0]
}

function getNodeKey(node: ParsedNode, index: number) {
  const nodeKey = `${props.nodeKey || 'stream-markdown'}-${node.type}`
  if (node.type === 'footnoteReference' || node.type === 'footnoteDefinition')
    return `${nodeKey}-${node.identifier}`
  return `${nodeKey}-${index}`
}
</script>

<template>
  <template v-for="item in items" :key="item.key">
    <Transition
      v-if="enableAnimate && !excludeTransition.includes(item.node.type)"
      name="stream-markdown-typewriter"
      appear
    >
      <component
        :is="item.component"
        :markdown-parser="activeMarkdownParser"
        :node-renderers="activeNodeRenderers"
        :deep="deep"
        :node="item.node"
        :parent-node="parentNode"
        :prev-node="item.prevNode"
        :next-node="item.nextNode"
        :node-key="item.key"
      />
    </Transition>

    <component
      :is="item.component"
      v-else
      :markdown-parser="activeMarkdownParser"
      :node-renderers="activeNodeRenderers"
      :deep="deep"
      :node="item.node"
      :parent-node="parentNode"
      :prev-node="item.prevNode"
      :next-node="item.nextNode"
      :node-key="item.key"
    />
  </template>
</template>
