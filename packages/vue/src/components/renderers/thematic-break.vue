<script setup lang="ts">
import type { ThematicBreakNodeRendererProps } from '../../types'

withDefaults(defineProps<ThematicBreakNodeRendererProps>(), {})
</script>

<template>
  <hr
    data-stream-markdown="thematic-break"
    class="my-6 border-t border-border"
  >
</template>
