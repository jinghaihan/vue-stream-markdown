<script setup lang="ts">
import { ArrowDownToLine, ArrowUpToLine } from '../icons'

const props = withDefaults(defineProps<{
  variant?: 'up' | 'down'
  getContainer: () => Element | null | undefined
  getScrollHeight?: () => number | undefined
}>(), {
  variant: 'down',
})

const icon = computed(() => props.variant === 'up' ? ArrowUpToLine : ArrowDownToLine)
const name = computed(() => props.variant === 'up' ? 'Scroll Up' : 'Scroll Down')
const placement = computed(() => props.variant === 'up' ? 'bottom' : 'top')

function onClick() {
  const container = props.getContainer()
  if (!container)
    return

  container.scrollTo({
    top: props.variant === 'up' ? 0 : container.scrollHeight,
    behavior: 'smooth',
  })
}
</script>

<template>
  <IconButton
    :icon="icon"
    :name="name"
    :button-class="['rounded-full', 'bg-popover', 'border', 'border-border']"
    :placement="placement"
    @click="onClick"
  />
</template>
