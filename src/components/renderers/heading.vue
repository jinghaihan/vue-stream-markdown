<script setup lang="ts">
import type { HeadingNodeRendererProps } from '../../types'
import { computed } from 'vue'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<HeadingNodeRendererProps>(), {})

const depth = computed(() => props.node.depth)
const tag = computed(() => `h${depth.value}`)
const id = computed(() => `heading-${depth.value}`)
</script>

<template>
  <component :is="tag" :data-stream-markdown="id">
    <NodeList v-bind="props" :nodes="node.children" />
  </component>
</template>

<style>
:is(.stream-markdown, .stream-markdown-overlay) {
  & [data-stream-markdown='heading-1'],
  & [data-stream-markdown='heading-2'],
  & [data-stream-markdown='heading-3'],
  & [data-stream-markdown='heading-4'],
  & [data-stream-markdown='heading-5'],
  & [data-stream-markdown='heading-6'] {
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  & [data-stream-markdown='heading-1'] {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }

  & [data-stream-markdown='heading-2'] {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  & [data-stream-markdown='heading-3'] {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  & [data-stream-markdown='heading-4'] {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }

  & [data-stream-markdown='heading-5'] {
    font-size: 1rem;
    line-height: 1.5rem;
  }

  & [data-stream-markdown='heading-6'] {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
}
</style>
