<script setup lang="ts">
const { header } = useAppConfig()
</script>

<template>
  <span class="text-highlighted text-lg font-semibold flex gap-2 items-center">
    <img
      src="/favicon.svg"
      alt=""
      aria-hidden="true"
      class="size-5"
    >
    <span>{{ header?.title }}</span>
  </span>
</template>
