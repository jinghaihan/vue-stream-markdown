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
  vanilla: defineAsyncComponent(() => import('./vanilla')),
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
:is(.stream-markdown, .stream-markdown-overlay) {
  & [data-stream-markdown='code'],
  & [data-stream-markdown='code'] code {
    font-family: var(--font-mono);
    font-size: 0.875rem;
  }

  & [data-stream-markdown='code'] {
    padding: 1rem;

    & [data-stream-markdown='code-line'] {
      display: block;
      position: relative;
      font-size: 0.875rem;
      min-height: 1rem;

      &::before {
        display: inline-block;
        width: 1rem;
        margin-right: 1rem;
        font-size: 13px;
        text-align: right;
        color: color-mix(in oklab, var(--muted-foreground) 50%, transparent);
        font-family: var(--font-mono);
        content: counter(line);
        counter-increment: line;
        user-select: none;
      }
    }

    &[data-show-line-numbers='false'] [data-stream-markdown='code-line']::before {
      display: none;
    }
  }
}
</style>
