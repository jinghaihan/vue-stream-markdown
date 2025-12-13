<script setup lang="ts">
import type { IconButtonProps } from '../types'
import { computed, ref } from 'vue'
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

const buttonClass = computed(() => {
  return cn(
    'text-sm text-accent-foreground p-2 rounded-md flex-center gap-1 cursor-pointer transition-colors duration-150 duration-150 hover:bg-accent',
    active.value ? 'bg-accent' : 'bg-transparent',
    ...props.buttonClass,
  )
})

function onClick(event: MouseEvent) {
  if (props.variant === 'toggle')
    active.value = !active.value
  emits('click', event, active.value)
}
</script>

<template>
  <Tooltip
    v-if="name"
    :content="name"
    :placement="placement"
  >
    <button
      :class="buttonClass"
      type="button"
      @click="onClick"
    >
      <component :is="icon" :class="iconClass" />
    </button>
  </Tooltip>

  <button
    v-else
    :class="buttonClass"
    type="button"
    @click="onClick"
  >
    <component :is="icon" :class="iconClass" />
  </button>
</template>
