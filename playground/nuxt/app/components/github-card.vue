<script setup lang="ts">
import { homepage } from 'vue-stream-markdown/package.json'
import { GitHub } from '../icons'

defineProps<{
  name?: string
  description?: string
}>()

function onClick() {
  window.open(homepage, '_blank')
}
</script>

<template>
  <div
    class="px-4 py-2 border border-border rounded-md bg-card flex flex-col gap-1 cursor-pointer duration-150 self-start hover:bg-accent"
    @click="onClick"
  >
    <h3 class="flex gap-2 items-center">
      <GitHub />
      {{ name }}
    </h3>
    <p class="text-sm text-muted-foreground">
      {{ description }}
    </p>
  </div>
</template>
