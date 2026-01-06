<script setup lang="ts">
import type { Placement } from '@floating-ui/dom'
import { toRefs } from 'vue'
import { useContext, useFloating } from '../composables'
import { getOverlayContainer } from '../utils'

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

const { placement, delay, trigger } = toRefs(props)

const { hideTooltip } = useContext()

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
} = useFloating({
  hideTooltip,
  placement,
  delay,
  trigger,
  getContainer: () => getOverlayContainer(),
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
      :style="floatingStyle"
      data-stream-markdown="tooltip"
      @mouseenter="onFloatingEnter"
      @mouseleave="onFloatingLeave"
    >
      <slot name="content">
        <pre data-stream-markdown="tooltip-overlay">{{ content }}</pre>
      </slot>
    </div>
  </Teleport>
</template>

<style>
:is(.stream-markdown, .stream-markdown-overlay) [data-stream-markdown='tooltip'] {
  background: var(--popover);
  color: var(--popover-foreground);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  z-index: 10000;
}

:is(.stream-markdown, .stream-markdown-overlay) [data-stream-markdown='tooltip-overlay'] {
  padding-block: 0.25rem;
  padding-inline: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
