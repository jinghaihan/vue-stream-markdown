<script setup lang="ts">
import type { Component } from 'vue'
import type { CodeNodeRendererProps } from '../../../types'
import { createCodeRendererModel } from '@stream-markdown/core'
import { computed, defineAsyncComponent } from 'vue'
import { useContext, useShiki } from '../../../composables'
import Vanilla from './vanilla.vue'

const props = withDefaults(defineProps<CodeNodeRendererProps & {
  showHeader?: boolean
}>(), {
  showHeader: true,
})

const { cdnOptions, uiComponents: UI } = useContext()

const model = computed(() => createCodeRendererModel(props.node))
const languageClass = computed(() => model.value.languageClass)

const { installed: hasShiki } = useShiki({
  cdnOptions,
})

const Shiki = defineAsyncComponent(() => import('./shiki.vue'))

const component = computed<Component>(() => hasShiki.value ? Shiki : Vanilla)
</script>

<template>
  <component
    :is="UI.CodeBlock"
    v-if="showHeader"
    v-bind="props"
  >
    <component
      :is="component"
      v-bind="props"
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
