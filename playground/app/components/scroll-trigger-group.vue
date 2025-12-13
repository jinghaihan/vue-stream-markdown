<script setup lang="ts">
import ScrollTrigger from './scroll-trigger.vue'

withDefaults(defineProps<{
  getContainer: () => Element | null | undefined
}>(), {})
</script>

<template>
  <div class="pointer-events-none inset-0 absolute">
    <ScrollTrigger
      class="pointer-events-auto right-3 top-2 absolute z-10"
      variant="up"
      :get-container="getContainer"
    />
    <ScrollTrigger
      class="pointer-events-auto bottom-2 right-3 absolute z-10"
      variant="down"
      :get-container="getContainer"
    />

    <div class="rounded-md bg-background pointer-events-none items-center right-13 top-2 absolute z-10">
      <slot />
    </div>
  </div>
</template>
