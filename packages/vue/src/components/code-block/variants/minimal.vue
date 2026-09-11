<script setup lang="ts">
import type { CodeBlockVariantProps } from './types'

defineProps<CodeBlockVariantProps>()
</script>

<template>
  <div
    data-stream-markdown="code-block"
    data-variant="minimal"
    dir="ltr"
    :data-collapsed="collapsed"
    class="group my-4 border border-border/70 rounded-xl bg-background relative overflow-clip"
    :class="[
      { 'code-loading': loading },
    ]"
  >
    <div
      v-if="$slots.actions"
      data-stream-markdown="actions"
      class="flex gap-1.5 items-center right-2 top-2 absolute z-[1]"
    >
      <slot name="actions" />
    </div>

    <main
      v-show="!collapsed"
      :ref="setScrollRef"
      data-stream-markdown="code-block-content"
      class="overflow-auto"
      :style="{ maxHeight }"
    >
      <slot />
    </main>
  </div>
</template>
