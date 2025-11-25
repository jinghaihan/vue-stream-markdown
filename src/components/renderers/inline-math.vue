<script setup lang="ts">
import type { InlineMathNodeRendererProps } from '../../types'
import { computed, toRefs } from 'vue'
import { useMathRenderer } from '../../composables'
import ErrorComponent from '../error-component.vue'

const props = withDefaults(defineProps<InlineMathNodeRendererProps & {
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
    <span v-else data-stream-markdown="inline-math" v-html="html" />
  </Transition>
</template>

<style>
.stream-markdown .inline-math-enter-active,
.stream-markdown .inline-math-leave-active {
  transition: opacity var (--default-transition-duration) ease;
}

.stream-markdown .inline-math-enter-from,
.stream-markdown .inline-math-leave-to {
  opacity: 0;
}
</style>
