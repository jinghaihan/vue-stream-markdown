<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { SelectItem } from '../types'
import Button from './button.vue'

const props = withDefaults(defineProps<{
  options?: SelectItem[]
  buttonStyle?: CSSProperties
}>(), {
  options: () => [],
  buttonStyle: () => ({}),
})

const emits = defineEmits<{
  (e: 'change', value: string): void
}>()

const modelValue = defineModel<string>('value', { required: false, default: '' })

if (props.options.length && !modelValue.value)
  modelValue.value = props.options[0].value

function getButtonStyle(item: SelectItem) {
  return {
    paddingBlock: '0.25rem',
    backgroundColor: modelValue.value === item.value ? 'var(--accent)' : undefined,
    ...props.buttonStyle,
  }
}

function onClick(item: SelectItem) {
  modelValue.value = item.value
  emits('change', item.value)
}
</script>

<template>
  <div data-stream-markdown="segmented">
    <Button
      v-for="item in options"
      :key="item.value"
      variant="text"
      :icon="item.icon"
      :name="item.label"
      :button-style="getButtonStyle(item)"
      @click="() => onClick(item)"
    />
  </div>
</template>

<style>
.stream-markdown [data-stream-markdown='segmented'] {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem;
  border-radius: 0.375rem;
}
</style>
