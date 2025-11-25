<script setup lang="ts">
import type { CodeNodeRendererProps } from '../../../types'
import { computed } from 'vue'

const props = withDefaults(defineProps<CodeNodeRendererProps>(), {})

const code = computed(() => props.node.value.trim())
</script>

<template>
  <pre data-stream-markdown="code"><code translate="no" v-text="code" /></pre>
</template>

<style>
.stream-markdown [data-stream-markdown='code'] {
  padding: 1rem;
}
</style>
