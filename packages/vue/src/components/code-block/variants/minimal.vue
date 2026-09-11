<script setup lang="ts">
import type { CodeBlockVariantProps } from './types'
import { computed } from 'vue'

const props = withDefaults(defineProps<CodeBlockVariantProps>(), {
  actionCount: 0,
})

const fadeWidth = computed(() => `${99 + Math.max(0, props.actionCount - 1) * 32}px`)
const contentStyle = computed(() => ({
  '--code-padding-right': fadeWidth.value,
  'maxHeight': props.maxHeight,
}))
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
      class="flex gap-1.5 items-center right-4 top-3 absolute z-[2]"
    >
      <slot name="actions" />
    </div>

    <main
      v-show="!collapsed"
      :ref="setScrollRef"
      data-stream-markdown="code-block-content"
      class="overflow-auto [&_pre>code]:pr-[var(--code-padding-right)] [&_pre>code]:block"
      :style="contentStyle"
    >
      <slot />
    </main>

    <div
      v-if="$slots.actions"
      data-stream-markdown="fade-overlay"
      aria-hidden="true"
      class="rounded-br-xl rounded-tr-xl bg-[linear-gradient(to_right,transparent_0px,color-mix(in_srgb,var(--background)_20%,transparent)_10px,color-mix(in_srgb,var(--background)_50%,transparent)_25px,color-mix(in_srgb,var(--background)_80%,transparent)_35px,var(--background)_45px)] h-14 pointer-events-none right-0 top-0 absolute z-[1]"
      :style="{ width: fadeWidth }"
    />
  </div>
</template>
