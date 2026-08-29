<script setup lang="ts">
import type { ElementNode } from 'comark'
import type { MathRenderNode } from '../types'
import { computed } from 'vue'
import InlineMathRenderer from './renderers/inline-math.vue'
import MathRenderer from './renderers/math.vue'

const props = defineProps<{
  node: ElementNode
  nodeKey: string
}>()

const inline = computed(() => String(props.node[1].class ?? '').split(/\s+/).includes('inline'))
const mathNode = computed<MathRenderNode>(() => ({
  display: !inline.value,
  value: String(props.node[1].content ?? props.node[2] ?? ''),
}))
</script>

<template>
  <InlineMathRenderer
    v-if="inline"
    :node="mathNode"
  />
  <MathRenderer
    v-else
    :node="mathNode"
  />
</template>
