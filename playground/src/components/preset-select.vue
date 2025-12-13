<script setup lang="ts">
import type { SelectOption } from 'vue-stream-markdown'
import { ref } from 'vue'
import SwatchBook from '~icons/lucide/swatch-book'
import { getPresetOptions } from '../markdown'
import Tooltip from './tooltip.vue'

const emits = defineEmits<{
  (e: 'select', item: SelectOption): void
}>()

const tooltipRef = ref()

const options = getPresetOptions()

const BUTTON_CLASSES = [
  'text-muted-foreground',
  'rounded-md',
  'duration-150',
  'hover:text-accent-foreground',
  'hover:bg-accent',
]

function onSelect(item: SelectOption) {
  tooltipRef.value?.hide()
  emits('select', item)
}
</script>

<template>
  <Tooltip
    ref="tooltipRef"
    trigger="click"
    placement="bottom"
  >
    <button
      class="px-3 py-2 flex gap-2 items-center"
      :class="BUTTON_CLASSES"
    >
      <SwatchBook />
      Examples
    </button>

    <template #content>
      <div class="p-2 flex flex-col gap-1">
        <button
          v-for="item in options"
          :key="item.value"
          class="text-sm p-2 flex items-center justify-start"
          :class="[...BUTTON_CLASSES]"
          @click="() => onSelect(item)"
        >
          {{ item.label }}
        </button>
      </div>
    </template>
  </Tooltip>
</template>
