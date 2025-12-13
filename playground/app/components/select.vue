<script setup lang="ts">
import type { SelectOption } from 'vue-stream-markdown'
import ChevronDown from '~icons/lucide/chevron-down'

withDefaults(defineProps<{
  size?: 'sm' | 'default'
  options?: SelectOption[]
}>(), {
  size: 'default',
  options: () => [],
})

const modelValue = defineModel<string>('value', { required: false, default: '' })
</script>

<template>
  <div
    data-slot="native-select-wrapper"
    :data-size="size"
    class="group/native-select w-fit relative has-[select:disabled]:opacity-50"
  >
    <select
      v-model="modelValue"
      data-slot="native-select"
      :data-size="size"
      class="aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 aria-invalid:ring-[2px] text-xs/relaxed py-0.5 pl-2 pr-6 appearance-none outline-none border border-input rounded-md bg-input/20 h-7 min-w-0 w-full select-none transition-colors data-[size=sm]:text-[0.625rem] placeholder:text-muted-foreground selection:text-primary-foreground focus-visible:border-ring dark:bg-input/30 selection:bg-primary data-[size=sm]:h-6 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:ring-[2px] focus-visible:ring-ring/30 dark:hover:bg-input/50"
    >
      <option
        v-for="item in options"
        :key="item.value"
        data-slot="native-select-option"
        :value="item.value"
      >
        {{ item.label }}
      </option>
    </select>
    <ChevronDown
      class="text-muted-foreground size-3.5 pointer-events-none select-none right-1.5 top-1/2 absolute group-data-[size=sm]/native-select:size-3 -translate-y-1/2 group-data-[size=sm]/native-select:-translate-y-[calc(--spacing(1.25))]"
      aria-hidden="true"
      data-slot="native-select-icon"
    />
  </div>
</template>
