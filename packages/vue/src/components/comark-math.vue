<script setup lang="ts">
import type { ElementNode } from 'comark'
import type {
  InlineMathNode,
  MarkdownAstParser,
  MathNode,
  NodeRenderers,
} from '../types'
import { computed } from 'vue'
import InlineMathRenderer from './renderers/inline-math.vue'
import MathRenderer from './renderers/math.vue'

const props = defineProps<{
  node: ElementNode
  nodeKey: string
}>()

const markdownParser = {} as MarkdownAstParser
const nodeRenderers: NodeRenderers = {}

const inline = computed(() => String(props.node[1].class ?? '').split(/\s+/).includes('inline'))
const mathNode = computed<InlineMathNode | MathNode>(() => ({
  type: inline.value ? 'inlineMath' : 'math',
  value: String(props.node[1].content ?? props.node[2] ?? ''),
}))
</script>

<template>
  <InlineMathRenderer
    v-if="inline"
    :node="mathNode as InlineMathNode"
    :node-key="nodeKey"
    :deep="0"
    :markdown-parser="markdownParser"
    :node-renderers="nodeRenderers"
  />
  <MathRenderer
    v-else
    :node="mathNode as MathNode"
    :node-key="nodeKey"
    :deep="0"
    :markdown-parser="markdownParser"
    :node-renderers="nodeRenderers"
  />
</template>
