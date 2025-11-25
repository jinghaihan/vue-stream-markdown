<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(defineProps<{
  icon?: Component
  language: string
  showIcon?: boolean
  showName?: boolean
}>(), {
  showIcon: true,
  showName: true,
})
</script>

<template>
  <header data-stream-markdown="language-title">
    <component :is="icon" v-if="showIcon" />
    <span v-if="showName" data-stream-markdown="language-name">
      {{ language }}
    </span>
  </header>
</template>

<style>
.stream-markdown [data-stream-markdown='language-title'] {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stream-markdown [data-stream-markdown='language-name'] {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.25rem;
  text-transform: lowercase;
}
</style>
