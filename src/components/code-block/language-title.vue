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
  <header
    data-stream-markdown="language-title"
    class="flex gap-2 items-center"
  >
    <component :is="icon" v-if="showIcon" />
    <span
      v-if="showName" data-stream-markdown="language-name"
      class="text-sm font-mono lowercase"
    >
      {{ language }}
    </span>
  </header>
</template>
