<script setup lang="ts">
import type { Component } from 'vue'
import type { CodeNodeRendererProps } from '../../../types'
import { computed, defineAsyncComponent } from 'vue'
import { useContext, useShiki } from '../../../composables'

const props = withDefaults(defineProps<CodeNodeRendererProps & {
  showHeader?: boolean
}>(), {
  showHeader: true,
})

const { uiComponents: UI } = useContext()

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
  <component :is="UI.CodeBlock" v-if="showHeader" v-bind="props">
    <component
      :is="component" v-bind="props"
      :class="[languageClass]"
    />
  </component>

  <component
    :is="component"
    v-else
    v-bind="props"
    :class="[languageClass]"
  />
</template>
