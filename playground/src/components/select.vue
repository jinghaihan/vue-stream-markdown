<script setup lang="ts">
import type { SelectItem } from 'vue-stream-markdown'

withDefaults(defineProps<{
  options?: SelectItem[]
}>(), {
  options: () => [],
})

const modelValue = defineModel<string>('value', { required: false, default: '' })
</script>

<template>
  <select
    v-model="modelValue"
    data-slot="native-select"
    class="aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-sm px-3 py-2 pr-9 appearance-none outline-none border border-input rounded-md bg-transparent h-9 min-w-0 w-full shadow-xs transition-[color,box-shadow] placeholder:text-muted-foreground selection:text-primary-foreground focus-visible:border-ring dark:bg-input/30 selection:bg-primary disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:hover:bg-input/50"
  >
    <option
      v-for="item in options"
      :key="item.value"
      data-slot="native-select-option"
      :value="item.value"
      class="text-popover-foreground bg-popover"
    >
      {{ item.label }}
    </option>
  </select>
</template>
