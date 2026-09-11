<script setup lang="ts">
import type { CodeBlockVariantProps } from './types'

defineProps<CodeBlockVariantProps>()
</script>

<template>
  <div
    data-stream-markdown="code-block"
    data-variant="modern"
    dir="ltr"
    :data-collapsed="collapsed"
    class="my-4 p-0.5 border border-border/70 rounded-2xl bg-[color-mix(in_srgb,var(--muted)_80%,var(--background)_20%)] overflow-clip"
    :class="[
      { 'code-loading': loading },
    ]"
  >
    <header
      data-stream-markdown="code-block-header"
      class="code-block-header text-sm text-muted-foreground px-3 py-1 pr-2.5 bg-[color-mix(in_srgb,var(--muted)_80%,var(--background)_20%)] flex gap-2 items-center top-0 justify-between sticky z-[5] max-lg:px-2 [&>*:last-child]:flex [&>*:first-child]:flex-1 [&>*:last-child]:shrink-0 [&>*:first-child]:min-w-0 [&>*:last-child]:items-center [&>*:nth-child(2)]:left-1/2 [&>*:nth-child(2)]:absolute [&>*:nth-child(2)]:-translate-x-1/2"
    >
      <slot name="title" />
      <slot name="header-center" />
      <slot name="actions" />
    </header>

    <main
      v-show="!collapsed"
      :ref="setScrollRef"
      data-stream-markdown="code-block-content"
      class="mt-0.5 border border-border/70 rounded-xl bg-background max-w-full min-w-full w-0 overflow-auto"
      :style="{ maxHeight }"
    >
      <slot />
    </main>
  </div>
</template>
