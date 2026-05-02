<script setup lang="ts">
import type { NodeRendererListProps } from '../types'
import { createNodeListModel } from '@stream-markdown/core'
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
  animation,
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

const model = computed(() => createNodeListModel({
  nodes: props.nodes,
  blocks: blocks.value,
  blockIndex: props.blockIndex,
  deep: props.deep,
  nodeKey: props.nodeKey,
  nodeRenderers: activeNodeRenderers.value,
  enableAnimate: enableAnimate.value,
  animation: animation.value,
}))

const items = computed(() => model.value.items)
const transitionName = computed(() => model.value.transitionName)
</script>

<template>
  <template v-for="item in items" :key="item.key">
    <Transition
      v-if="item.shouldTransition"
      :name="transitionName"
      appear
    >
      <component
        :is="item.renderer"
        :markdown-parser="activeMarkdownParser"
        :node-renderers="activeNodeRenderers"
        :deep="deep"
        :node="item.node"
        :parent-node="parentNode"
        :prev-node="item.prevNode"
        :next-node="item.nextNode"
        :node-key="item.key"
        :hide-caret="hideCaret"
      />
    </Transition>

    <component
      :is="item.renderer"
      v-else
      :markdown-parser="activeMarkdownParser"
      :node-renderers="activeNodeRenderers"
      :deep="deep"
      :node="item.node"
      :parent-node="parentNode"
      :prev-node="item.prevNode"
      :next-node="item.nextNode"
      :node-key="item.key"
      :hide-caret="hideCaret"
    />
  </template>
</template>
