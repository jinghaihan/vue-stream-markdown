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
})

const Error = computed(() => katexOptions.value?.errorComponent ?? ErrorComponent)
</script>

<template>
  <Transition name="table-node-fade">
    <component
      :is="Error"
      v-if="error"
      variant="katex"
      :message="errorMessage"
      v-bind="props"
    />
    <div v-else data-stream-markdown="math" v-html="html" />
  </Transition>
</template>

<style>
.stream-markdown [data-stream-markdown='math'] {
  text-align: center;
  margin-block: 1rem;
}

.stream-markdown .math-enter-active,
.stream-markdown .math-leave-active {
  transition: opacity var (--default-transition-duration) ease;
}

.stream-markdown .math-enter-from,
.stream-markdown .math-leave-to {
  opacity: 0;
}
</style>
