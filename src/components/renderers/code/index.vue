<script setup lang="ts">
import type { Component } from 'vue'
import type { CodeNodeRendererProps } from '../../../types'
import { computed, defineAsyncComponent } from 'vue'
import { useShiki } from '../../../composables'
import CodeBlock from '../../code-block/index.vue'

const props = withDefaults(defineProps<CodeNodeRendererProps & {
  showHeader?: boolean
}>(), {
  showHeader: true,
})

const languageClass = computed(() => `language-${props.node.lang}`)

const { installed: hasShiki } = useShiki()

const components: Record<string, Component> = {
  vanilla: defineAsyncComponent(() => import('./vanilla.vue')),
  shiki: defineAsyncComponent(() => import('./shiki.vue')),
}

const component = computed(() => {
  if (hasShiki.value)
    return components.shiki
  return components.vanilla
})
</script>

<template>
  <CodeBlock v-if="showHeader" v-bind="props">
    <component :is="component" v-bind="props" :class="[languageClass]" />
  </CodeBlock>

  <component
    :is="component"
    v-else
    v-bind="props"
    :class="[languageClass]"
  />
</template>

<style>
.stream-markdown [data-stream-markdown='code'],
.stream-markdown [data-stream-markdown='code'] code {
  font-family: var(--font-mono);
}
</style>
