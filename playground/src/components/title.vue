<script setup lang="ts">
import Markdown from '~icons/catppuccin/markdown'
import { version } from '../../../package.json'
</script>

<template>
  <div class="flex gap-2">
    <Markdown :height="28" :width="28" />
    <h1 class="text-lg font-bold">
      Vue Stream Markdown
    </h1>
    <small class="font-mono">v{{ version }}</small>
  </div>
</template>
