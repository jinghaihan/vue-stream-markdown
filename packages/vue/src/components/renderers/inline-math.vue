<script setup lang="ts">
import type { MathRenderProps } from '../../types'
import { computed, toRefs } from 'vue'
import { useContext, useMathRenderer } from '../../composables'

const props = withDefaults(defineProps<MathRenderProps & {
  throttle?: number
}>(), {
  throttle: 300,
})

const {
  extensions,
  uiComponents: UI,
} = useContext()

const { node, throttle } = toRefs(props)
const { html, error, errorMessage } = useMathRenderer({
  node,
  extension: computed(() => extensions.value?.math),
  throttle,
})

const Error = computed(() => extensions.value?.math?.errorComponent ?? UI.value.ErrorComponent)
</script>

<template>
  <component
    :is="Error"
    v-if="error"
    variant="katex"
    :message="errorMessage"
  />
  <span v-else data-stream-markdown="inline-math" v-html="html" />
</template>
