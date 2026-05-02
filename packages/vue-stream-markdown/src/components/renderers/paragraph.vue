<script setup lang="ts">
import type { ParagraphNodeRendererProps } from '../../types'
import { createParagraphModel } from '@stream-markdown/core'
import { computed } from 'vue'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<ParagraphNodeRendererProps>(), {})

const model = computed(() => createParagraphModel(props))
const marginBottom = computed(() => model.value.marginBottom)
const lineHeight = computed(() => model.value.lineHeight)
</script>

<template>
  <p
    data-stream-markdown="paragraph"
    class="my-4 align-middle transition-[height] duration-[var(--default-transition-duration)] ease"
    :style="{
      marginBottom,
      lineHeight,
    }"
  >
    <NodeList v-bind="props" :parent-node="node" :nodes="node.children" :deep="deep + 1" />
  </p>
</template>
