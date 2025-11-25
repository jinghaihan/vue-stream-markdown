<script setup lang="ts">
import type { IconButtonProps } from '../types'
import { ref } from 'vue'
import { cn } from '../utils'
import Tooltip from './tooltip.vue'

const props = withDefaults(defineProps<IconButtonProps>(), {
  variant: 'default',
  buttonClass: () => [],
  iconClass: () => [],
})

const emits = defineEmits<{
  (e: 'click', event: MouseEvent, active: boolean): void
}>()

const active = ref<boolean>(props.defaultActive)

function onClick(event: MouseEvent) {
  if (props.variant === 'toggle')
    active.value = !active.value
  emits('click', event, active.value)
}
</script>

<template>
  <Tooltip
    append-to="parent"
    :content="name"
    :placement="placement"
  >
    <button
      :class="cn(
        'text-sm text-accent-foreground p-2 rounded-md flex-center gap-1 cursor-pointer transition-colors duration-150 duration-150 hover:bg-accent',
        active ? 'bg-accent' : 'bg-transparent',
        ...buttonClass)"
      type="button"
      @click="onClick"
    >
      <component :is="icon" :class="iconClass" />
    </button>
  </Tooltip>
</template>
