<script setup lang="ts">
import type { ThematicBreakNodeRendererProps } from '../../types'

withDefaults(defineProps<ThematicBreakNodeRendererProps>(), {})
</script>

<template>
  <hr data-stream-markdown="thematic-break">
</template>

<style>
.stream-markdown [data-stream-markdown='thematic-break'] {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  border-top: 1px solid var(--border);
}
</style>
