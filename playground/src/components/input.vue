<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'text' | 'number'
  placeholder?: string
}>(), {
  type: 'text',
})

const modelValue = defineModel<number | string>('value', { required: false, default: '' })
</script>

<template>
  <input
    v-model="modelValue"
    data-slot="input"
    :placeholder="placeholder"
    :type="type"
    class="aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-base px-3 py-1 outline-none border border-input rounded-md bg-transparent h-9 min-w-0 w-full shadow-xs transition-[color,box-shadow] file:text-sm md:text-sm file:text-foreground placeholder:text-muted-foreground selection:text-primary-foreground file:font-medium file:border-0 focus-visible:border-ring dark:bg-input/30 file:bg-transparent selection:bg-primary disabled:opacity-50 file:inline-flex file:h-7 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
  >
</template>
