<script setup lang="ts">
import type { BreakNodeRendererProps } from '../../types'

withDefaults(defineProps<BreakNodeRendererProps>(), {})
</script>

<template>
  <br data-stream-markdown="break">
</template>
