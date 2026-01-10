<script setup lang="ts">
import type { LinkNodeRendererProps } from '../../types'
import { computed, toRefs } from 'vue'
import { useSanitizers } from '../../composables'
import ErrorComponent from '../error-component.vue'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<LinkNodeRendererProps>(), {})

const { hardenOptions } = toRefs(props)

const url = computed(() => props.node.url)
const loading = computed(
  () => props.node.loading
    || props.markdownParser.hasLoadingNode(props.node.children)
    || !url.value,
)

const { transformedUrl, isHardenUrl } = useSanitizers({
  url,
  hardenOptions,
  loading,
})

const Error = computed(() => hardenOptions.value?.errorComponent ?? ErrorComponent)
</script>

<template>
  <a
    v-if="!isHardenUrl && typeof transformedUrl === 'string'"
    data-stream-markdown="link"
    :data-stream-markdown-loading="loading"
    rel="noreferrer"
    target="_blank"
    :href="transformedUrl"
  >
    <NodeList v-bind="props" :nodes="node.children" />
  </a>

  <component :is="Error" v-else v-bind="props" variant="harden-link">
    <NodeList v-bind="props" :nodes="node.children" />
  </component>
</template>

<style>
:is(.stream-markdown, .stream-markdown-overlay) {
  & [data-stream-markdown='link'] {
    color: var(--primary);
    text-decoration: underline;
    overflow-wrap: anywhere;

    &[data-stream-markdown-loading='true'] {
      position: relative;
      cursor: default;
      text-decoration: none;
      pointer-events: none;
    }
  }
}
</style>
