<script setup lang="ts">
import type { SelectOption, UISegmentedProps } from '../types'
import { createSegmentedModel } from '@stream-markdown/core'
import { computed } from 'vue'
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

const model = computed(() => createSegmentedModel({
  options: props.options,
  value: modelValue.value,
  buttonStyle: props.buttonStyle,
}))

function isButtonActive(item: SelectOption) {
  return model.value.isActive(item)
}

function getButtonStyle(item: SelectOption) {
  return model.value.getButtonStyle(item)
}

function onClick(item: SelectOption) {
  modelValue.value = String(item.value)
  emits('change', modelValue.value)
}
</script>

<template>
  <div
    data-stream-markdown="segmented"
    class="p-0.5 rounded-md flex gap-1 items-center"
  >
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
