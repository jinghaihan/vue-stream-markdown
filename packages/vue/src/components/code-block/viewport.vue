<script setup lang="ts">
import { computed, provide } from 'vue'
import { CODE_VIEWPORT_CONTEXT } from './viewport-context'

const props = defineProps<{
  element?: HTMLElement
  bounded: boolean
}>()

provide(CODE_VIEWPORT_CONTEXT, {
  element: computed(() => props.element),
  bounded: computed(() => props.bounded),
})
</script>

<template>
  <slot />
</template>
