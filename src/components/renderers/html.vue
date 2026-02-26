<script setup lang="ts">
import type { HtmlNodeRendererProps } from '../../types'
import { computed } from 'vue'
import { useHtmlSanitizer } from '../../composables'

const props = withDefaults(defineProps<HtmlNodeRendererProps>(), {})

const html = computed(() => props.node.value || '')

const { sanitizedHtml } = useHtmlSanitizer({
  html,
})
</script>

<template>
  <div
    v-if="sanitizedHtml"
    data-stream-markdown="html"
    class="break-words"
    v-html="sanitizedHtml"
  />
</template>
