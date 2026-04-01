<script setup lang="ts">
import type { HeadingNodeRendererProps } from '../../types'
import { computed } from 'vue'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<HeadingNodeRendererProps>(), {})

const depth = computed(() => props.node.depth)
const tag = computed(() => `h${depth.value}`)
const id = computed(() => `heading-${depth.value}`)
const headingClass = computed(() => {
  const shared = 'mt-6 mb-2 font-semibold'
  switch (depth.value) {
    case 1:
      return `${shared} text-3xl`
    case 2:
      return `${shared} text-2xl`
    case 3:
      return `${shared} text-xl`
    case 4:
      return `${shared} text-lg`
    case 5:
      return `${shared} text-base`
    default:
      return `${shared} text-sm`
  }
})
</script>

<template>
  <component
    :is="tag" :data-stream-markdown="id"
    :class="headingClass"
  >
    <NodeList v-bind="props" :nodes="node.children" :deep="deep + 1" />
  </component>
</template>
