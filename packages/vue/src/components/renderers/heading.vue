<script setup lang="ts">
import type { HeadingNodeRendererProps } from '../../types'
import { createHeadingModel } from '@stream-markdown/core'
import { computed } from 'vue'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<HeadingNodeRendererProps>(), {})

const model = computed(() => createHeadingModel(props.node))
const tag = computed(() => model.value.tag)
const id = computed(() => model.value.id)
const depth = computed(() => model.value.depth)
</script>

<template>
  <component
    :is="tag" :data-stream-markdown="id"
    class="font-semibold mb-2 mt-6"
    :class="{
      'text-3xl': depth === 1,
      'text-2xl': depth === 2,
      'text-xl': depth === 3,
      'text-lg': depth === 4,
      'text-base': depth === 5,
      'text-sm': depth < 1 || depth > 5,
    }"
  >
    <NodeList v-bind="props" :nodes="node.children" :deep="deep + 1" />
  </component>
</template>
