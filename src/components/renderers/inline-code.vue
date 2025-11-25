<script setup lang="ts">
import type { InlineCodeNodeRendererProps } from '../../types'

withDefaults(defineProps<InlineCodeNodeRendererProps>(), {})
</script>

<template>
  <code data-stream-markdown="inline-code">{{ node.value }}</code>
</template>

<style>
.stream-markdown [data-stream-markdown='inline-code'] {
  background-color: var(--muted);
  border-radius: 0.25rem;
  padding-inline: 0.375rem;
  padding-block: 0.125rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.25rem;
  white-space: normal;
  overflow-wrap: break-word;
}
</style>
