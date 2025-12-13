<script setup lang="ts">
import type { SelectOption } from '../types'
import { ref } from 'vue'
import Button from './button.vue'
import Tooltip from './tooltip.vue'

withDefaults(defineProps<{
  title?: string
  options?: SelectOption[]
}>(), {
  options: () => [],
})

const emits = defineEmits<{
  (e: 'click', event: MouseEvent, item: SelectOption): void
}>()

const tooltipRef = ref<InstanceType<typeof Tooltip>>()

const BUTTON_STYLE = {
  minWidth: '120px',
  display: 'flex',
  justifyContent: 'start',
  gap: '0.625rem',
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
}

function handleClick(event: MouseEvent, item: SelectOption) {
  emits('click', event, item)
  tooltipRef.value?.hide()
}
</script>

<template>
  <Tooltip
    ref="tooltipRef"
    trigger="click"
    placement="bottom-end"
    data-stream-markdown="dropdown"
  >
    <template #content>
      <div data-stream-markdown="dropdown-overlay">
        <Button
          v-for="option in options"
          :key="option.value"
          :name="option.label"
          :icon="option.icon"
          :button-style="BUTTON_STYLE"
          variant="text"
          @click="(e: MouseEvent) => handleClick(e, option)"
        />
      </div>
    </template>
    <slot />
  </Tooltip>
</template>
