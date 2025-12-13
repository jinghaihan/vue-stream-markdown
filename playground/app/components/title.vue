<script setup lang="ts">
import { version } from '../../../package.json'
</script>

<template>
  <div class="px-2 flex gap-2">
    <h1 class="text-lg font-bold">
      Vue Stream Markdown
    </h1>
    <small class="font-mono">v{{ version }}</small>
  </div>
</template>
