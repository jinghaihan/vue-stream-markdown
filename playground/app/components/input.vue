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
    class="aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 aria-invalid:ring-[2px] text-sm px-2 py-0.5 outline-none border border-input rounded-md bg-input/20 h-7 min-w-0 w-full transition-colors file:text-xs/relaxed md:text-xs/relaxed file:text-foreground placeholder:text-muted-foreground file:font-medium file:border-0 focus-visible:border-ring dark:bg-input/30 file:bg-transparent disabled:opacity-50 file:inline-flex file:h-6 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:ring-[2px] focus-visible:ring-ring/30"
  >
</template>
