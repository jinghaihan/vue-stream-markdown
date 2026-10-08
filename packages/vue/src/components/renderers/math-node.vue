<script setup lang="ts">
import type { MarkdownRendererProps, MathRenderNode } from '../../types'
import { computed } from 'vue'
import InlineMathRenderer from './inline-math.vue'
import MathRenderer from './math.vue'

const props = defineProps<MarkdownRendererProps>()

const inline = computed(() => String(props.node[1].class ?? '').split(/\s+/).includes('inline'))
const mathNode = computed<MathRenderNode>(() => ({
  display: !inline.value,
  loading: props.loading,
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
