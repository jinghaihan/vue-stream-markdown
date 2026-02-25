<script setup lang="ts">
import type { MathNodeRendererProps } from '../../types'
import { computed, toRefs } from 'vue'
import { useContext, useMathRenderer } from '../../composables'

const props = withDefaults(defineProps<MathNodeRendererProps & {
  throttle?: number
}>(), {
  throttle: 300,
})

const { uiComponents: UI } = useContext()

const { node, katexOptions, throttle } = toRefs(props)
const { html, error, errorMessage } = useMathRenderer({
  node,
  katexOptions,
  throttle,
  cdnOptions: props.cdnOptions,
})

const Error = computed(() => katexOptions.value?.errorComponent ?? UI.value.ErrorComponent)
</script>

<template>
  <component
    :is="Error"
    v-if="error"
    variant="katex"
    :message="errorMessage"
    v-bind="props"
  />
  <div
    v-else data-stream-markdown="math"
    class="my-4 text-center"
    v-html="html"
  />
</template>
