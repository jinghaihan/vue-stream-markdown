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
    class="my-4 p-1 border border-border/70 rounded-xl bg-background overflow-clip data-[collapsed=true]:[&_.code-block-header]:border-b-0"
    :class="[
      { 'code-loading': loading },
    ]"
  >
    <header
      data-stream-markdown="code-block-header"
      :class="[
        { 'border-b': !collapsed },
      ]"
      class="code-block-header text-sm text-muted-foreground px-3 py-1.5 border-border/70 rounded-lg bg-muted/80 flex items-center top-0 justify-between sticky z-[5] max-lg:px-2 [&>*:last-child]:flex [&>*:first-child]:flex-1 [&>*:last-child]:flex-1 [&>*:nth-child(2)]:left-1/2 [&>*:last-child]:justify-end [&>*:nth-child(2)]:absolute [&>*:nth-child(2)]:-translate-x-1/2"
    >
      <slot name="title" />
      <slot name="header-center" />
      <slot name="actions" />
    </header>

    <main
      v-show="!collapsed"
      :ref="setScrollRef"
      data-stream-markdown="code-block-content"
      class="mt-1 border border-border/70 rounded-lg overflow-auto"
      :style="{ maxHeight }"
    >
      <slot />
    </main>
  </div>
</template>
