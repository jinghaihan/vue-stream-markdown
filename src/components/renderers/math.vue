<script setup lang="ts">
import type { MathNodeRendererProps } from '../../types'
import { computed, toRefs } from 'vue'
import { useMathRenderer } from '../../composables'
import ErrorComponent from '../error-component.vue'

const props = withDefaults(defineProps<MathNodeRendererProps & {
  throttle?: number
}>(), {
  throttle: 300,
})

const { node, katexOptions, throttle } = toRefs(props)
const { html, error, errorMessage } = useMathRenderer({
  node,
  katexOptions,
  throttle,
  cdnOptions: props.cdnOptions,
})

const Error = computed(() => katexOptions.value?.errorComponent ?? ErrorComponent)
</script>

<template>
  <component
    :is="Error"
    v-if="error"
    variant="katex"
    :message="errorMessage"
    v-bind="props"
  />
  <div v-else data-stream-markdown="math" v-html="html" />
</template>

<style>
:is(.stream-markdown, .stream-markdown-overlay) [data-stream-markdown='math'] {
  text-align: center;
  margin-block: 1rem;
}
</style>
