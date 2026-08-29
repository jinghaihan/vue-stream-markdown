<script setup lang="ts">
const { header } = useAppConfig()
const content = useDocsContent()
</script>

<template>
  <div class="flex shrink-0 gap-2.5 items-center">
    <NuxtLink
      :to="prefixLink(header?.to || '/', content.base)"
      :aria-label="header?.logo?.alt || header?.title"
      class="text-highlighted! flex items-center lg:mr-3"
    >
      <AppHeaderLogo class="shrink-0" />
    </NuxtLink>
  </div>
</template>
