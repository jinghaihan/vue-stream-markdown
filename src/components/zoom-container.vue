<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { Control, SelectOption, ZoomControlPosition } from '../types'
import { computed, ref } from 'vue'
import { useI18n, useZoom } from '../composables'
import Button from './button.vue'

const props = withDefaults(defineProps<{
  interactive?: boolean
  showControl?: boolean
  controlSize?: 'vanilla' | 'large'
  position?: ZoomControlPosition
  containerStyle?: CSSProperties
}>(), {
  interactive: true,
  showControl: true,
  controlSize: 'vanilla',
  position: 'bottom-right',
  containerStyle: () => ({}),
})

const containerRef = ref<HTMLElement>()

const { t } = useI18n()

const {
  zoom,
  isDragging,
  transformStyle,
  zoomIn,
  zoomOut,
  resetZoom,
  setZoom,
  startDrag,
  onDrag,
  stopDrag,
  handleWheel,

  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
} = useZoom()

const zoomPercent = computed(() => `${Math.round(zoom.value * 100)}%`)

const controlsPosition = computed(() => {
  switch (props.position) {
    case 'top-left':
      return {
        top: '0.5rem',
        left: '0.5rem',
      }
    case 'top-right':
      return {
        top: '0.5rem',
        right: '0.5rem',
      }
    case 'top-center':
      return {
        top: '0.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
      }
    case 'bottom-left':
      return {
        bottom: '0.5rem',
        left: '0.5rem',
      }
    case 'bottom-center':
      return {
        bottom: '0.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
      }
    case 'bottom-right':
    default:
      return {
        bottom: '0.5rem',
        right: '0.5rem',
      }
  }
})

const controlButtonProps = computed(() => {
  if (props.controlSize === 'vanilla')
    return {}

  return {
    iconWidth: 18,
    iconHeight: 18,
    buttonStyle: {
      fontSize: '0.875rem',
    },
  }
})

const controls = computed((): Control[] => [
  {
    ...controlButtonProps.value,
    key: 'zoomIn',
    icon: 'zoomIn',
    name: t('button.zoomIn'),
    onClick: zoomIn,
  },
  {
    ...controlButtonProps.value,
    key: 'zoomOut',
    icon: 'zoomOut',
    name: t('button.zoomOut'),
    onClick: zoomOut,
  },
  {
    ...controlButtonProps.value,
    key: 'updateZoom',
    variant: 'text',
    name: zoomPercent.value,
    options: [200, 150, 100, 75, 50].map(value => ({ label: `${value}%`, value })),
    onClick: (_event: MouseEvent, item?: SelectOption) => {
      const value = item?.value || 100
      if (value === 100)
        resetZoom()
      else
        setZoom(Number(value) / 100)
    },
  },
])

function onWheel(event: WheelEvent) {
  if (containerRef.value)
    handleWheel(event, containerRef.value)
}

function onPointerDown(event: PointerEvent) {
  if (!props.interactive)
    return

  event.preventDefault()
  startDrag(event)
}

function onPointerMove(event: PointerEvent) {
  if (!props.interactive)
    return

  event.preventDefault()
  onDrag(event)
}

function onPointerUp(event: PointerEvent) {
  if (!props.interactive)
    return

  event.preventDefault()
  stopDrag()
}

function onTouchStart(event: TouchEvent) {
  if (!props.interactive)
    return

  if (containerRef.value)
    handleTouchStart(event, containerRef.value)
}

function onTouchMove(event: TouchEvent) {
  if (!props.interactive)
    return

  if (containerRef.value)
    handleTouchMove(event, containerRef.value)
}

function onTouchEnd(event: TouchEvent) {
  if (!props.interactive)
    return

  handleTouchEnd(event)
}
</script>

<template>
  <div
    ref="containerRef"
    data-stream-markdown="zoom-container"
    :style="{
      touchAction: interactive ? 'none' : 'auto',
    }"
    @wheel="onWheel"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @pointerleave="onPointerUp"
  >
    <div v-if="showControl && interactive" data-stream-markdown="zoom-controls" :style="controlsPosition" @click.stop>
      <slot name="controls" v-bind="controlButtonProps" />
      <Button
        v-for="item in controls"
        v-bind="item"
        :key="item.key"
        @click="item.onClick"
      />
    </div>

    <div data-stream-markdown="zoom-inner">
      <div
        data-stream-markdown="zoom-transform-container"
        :style="{
          ...transformStyle,
          ...containerStyle,
          cursor: isDragging ? 'grabbing' : 'grab',
        }"
        @click.stop
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<style>
:is(.stream-markdown, .stream-markdown-overlay) [data-stream-markdown='zoom-container'] {
  height: 100%;
  position: relative;
  overflow: hidden;
}

:is(.stream-markdown, .stream-markdown-overlay) [data-stream-markdown='zoom-inner'] {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

:is(.stream-markdown, .stream-markdown-overlay) [data-stream-markdown='zoom-transform-container'] {
  width: 100%;
  flex-shrink: 0;
}

:is(.stream-markdown, .stream-markdown-overlay) [data-stream-markdown='zoom-controls'] {
  position: absolute;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border);
  background-color: var(--background);
}

@media (max-width: 1024px) {
  :is(.stream-markdown, .stream-markdown-overlay) [data-stream-markdown='zoom-controls'] {
    gap: 0;
  }
}
</style>
