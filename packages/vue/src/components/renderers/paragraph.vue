<script setup lang="ts">
import type { ParagraphNodeRendererProps } from '../../types'
import { createParagraphModel } from '@stream-markdown/core'
import { computed } from 'vue'
import { useTextDirection } from '../../composables'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<ParagraphNodeRendererProps>(), {})

const model = computed(() => createParagraphModel(props))
const marginBottom = computed(() => model.value.marginBottom)
const lineHeight = computed(() => model.value.lineHeight)
const direction = useTextDirection(() => props.node)
</script>

<template>
  <p
    data-stream-markdown="paragraph"
    :dir="direction"
    class="my-4 align-middle transition-[height] duration-[var(--default-transition-duration)] ease"
    :style="{
      marginBottom,
      lineHeight,
    }"
  >
    <NodeList v-bind="props" :parent-node="node" :nodes="node.children" :deep="deep + 1" />
  </p>
</template>
