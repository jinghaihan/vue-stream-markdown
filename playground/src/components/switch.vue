<script setup lang="ts">
import { computed } from 'vue'

const modelValue = defineModel<boolean>('value', { required: false, default: false })

const dataState = computed(() => modelValue.value ? 'checked' : 'unchecked')
</script>

<template>
  <button
    data-slot="switch"
    class="peer outline-none border border-transparent rounded-full inline-flex shrink-0 h-[1.15rem] w-8 shadow-xs transition-all items-center focus-visible:border-ring data-[state=checked]:bg-primary data-[state=unchecked]:bg-input disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80"
    :data-state="dataState"
    @click="modelValue = !modelValue"
  >
    <span
      :data-state="dataState"
      class="rounded-full bg-background size-4 block pointer-events-none ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground"
    />
  </button>
</template>
