<script setup lang="ts">
import type { SelectOption, UISegmentedProps } from '../types'
import { useContext } from '../composables'

const props = withDefaults(defineProps<UISegmentedProps>(), {
  options: () => [],
  buttonStyle: () => ({}),
})

const emits = defineEmits<{
  (e: 'change', value: string): void
}>()

const { uiComponents: UI } = useContext()

const modelValue = defineModel<string>('value', { required: false, default: '' })

if (props.options.length && !modelValue.value)
  modelValue.value = String(props.options[0]!.value)

function isButtonActive(item: SelectOption) {
  return modelValue.value === item.value
}

function getButtonStyle(item: SelectOption) {
  return {
    paddingBlock: '0.25rem',
    backgroundColor: isButtonActive(item) ? 'var(--accent)' : undefined,
    ...props.buttonStyle,
  }
}

function onClick(item: SelectOption) {
  modelValue.value = String(item.value)
  emits('change', modelValue.value)
}
</script>

<template>
  <div data-stream-markdown="segmented">
    <component
      :is="UI.Button"
      v-for="item in options"
      :key="item.value"
      variant="text"
      :icon="item.icon"
      :name="item.label"
      :button-style="getButtonStyle(item)"
      :data-active="isButtonActive(item)"
      @click="() => onClick(item)"
    />
  </div>
</template>

<style>
:where(.stream-markdown, .stream-markdown-overlay) {
  & [data-stream-markdown='segmented'] {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.125rem;
    border-radius: 0.375rem;
  }
}
</style>
