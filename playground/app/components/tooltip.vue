<script setup lang="ts">
import type { Placement } from '@floating-ui/vue'
import { toRefs } from 'vue'
import { useFloatingElement } from 'vue-stream-markdown'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  content?: string
  trigger?: 'hover' | 'click'
  placement?: Placement
  delay?: number | [number, number]
}>(), {
  trigger: 'hover',
  placement: 'top',
  delay: () => [100, 100],
})

const { trigger, placement, delay } = toRefs(props)

const {
  referenceEl: _referenceEl,
  floatingEl: _floatingEl,
  open,
  appendTo,
  floatingStyle,
  show,
  hide,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onFloatingEnter,
  onFloatingLeave,
} = useFloatingElement({
  trigger,
  placement,
  delay,
})

defineExpose({ show, hide })
</script>

<template>
  <span
    v-bind="$attrs"
    ref="_referenceEl"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="onClick"
  >
    <slot />
  </span>

  <Teleport :to="appendTo">
    <div
      v-if="open"
      ref="_floatingEl"
      class="text-popover-foreground border border-border rounded-md bg-popover z-100"
      :style="floatingStyle"
      @mouseenter="onFloatingEnter"
      @mouseleave="onFloatingLeave"
    >
      <slot name="content">
        <pre class="text-sm px-2 py-1">{{ content }}</pre>
      </slot>
    </div>
  </Teleport>
</template>
