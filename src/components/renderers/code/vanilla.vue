<script setup lang="ts">
import type { CodeNodeRendererProps } from '../../../types'
import VanillaRenderer from './vanilla-renderer.vue'

const props = withDefaults(defineProps<CodeNodeRendererProps>(), {})
</script>

<template>
  <VanillaRenderer :node="props.node" />
</template>
